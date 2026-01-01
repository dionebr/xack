import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/TranslationContext';
import { validateAnswer, calculateProgress, PoCQuestion, UserPoCProgress } from '../utils/pocValidation';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

interface PoCValidationModalProps {
    challengeId: string;
    challengeName: string;
    onUnlock: () => void;
    onClose: () => void;
}

export const PoCValidationModal: React.FC<PoCValidationModalProps> = ({
    challengeId,
    challengeName,
    onUnlock,
    onClose
}) => {
    const { user } = useAuth();
    const { t } = useTranslation();

    const [questions, setQuestions] = useState<PoCQuestion[]>([]);
    const [progress, setProgress] = useState<Map<string, UserPoCProgress>>(new Map());
    const [currentAnswers, setCurrentAnswers] = useState<Map<string, string>>(new Map());
    const [loading, setLoading] = useState(true);
    const [validating, setValidating] = useState<string | null>(null);

    useEffect(() => {
        fetchQuestionsAndProgress();
    }, [challengeId, user]);

    const fetchQuestionsAndProgress = async () => {
        try {
            setLoading(true);

            // Fetch PoC questions
            const { data: questionsData, error: questionsError } = await supabase
                .from('challenge_poc_questions')
                .select('*')
                .eq('challenge_id', challengeId)
                .order('question_order', { ascending: true });

            if (questionsError) throw questionsError;
            setQuestions(questionsData || []);

            // Fetch user progress
            if (user) {
                const { data: progressData, error: progressError } = await supabase
                    .from('user_poc_progress')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('challenge_id', challengeId);

                if (progressError) throw progressError;

                const progressMap = new Map<string, UserPoCProgress>();
                progressData?.forEach(p => progressMap.set(p.question_id, p));
                setProgress(progressMap);

                // Check if all questions are completed
                if (questionsData && progressData && progressData.length === questionsData.length) {
                    const allCompleted = progressData.every(p => p.is_completed);
                    if (allCompleted) {
                        onUnlock();
                        onClose();
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching PoC data:', error);
            toast.error('Failed to load PoC questions');
        } finally {
            setLoading(false);
        }
    };

    const handleValidateAnswer = async (question: PoCQuestion) => {
        if (!user) {
            toast.error(t('machineDetail.authRequired'));
            return;
        }

        const userAnswer = currentAnswers.get(question.id) || '';
        if (!userAnswer.trim()) {
            toast.error('Please enter an answer');
            return;
        }

        setValidating(question.id);

        try {
            const result = validateAnswer(userAnswer, question.correct_answer, question.validation_type);
            const existingProgress = progress.get(question.id);

            if (result.isCorrect) {
                if (existingProgress) {
                    await supabase
                        .from('user_poc_progress')
                        .update({
                            is_completed: true,
                            completed_at: new Date().toISOString(),
                            attempts: existingProgress.attempts + 1
                        })
                        .eq('id', existingProgress.id);
                } else {
                    await supabase
                        .from('user_poc_progress')
                        .insert({
                            user_id: user.id,
                            challenge_id: challengeId,
                            question_id: question.id,
                            is_completed: true,
                            completed_at: new Date().toISOString(),
                            attempts: 1
                        });
                }

                toast.success(t('machineDetail.poc.correct') || result.message);
                await fetchQuestionsAndProgress();

                const allCompleted = questions.every(q => {
                    const p = progress.get(q.id);
                    return p?.is_completed || q.id === question.id;
                });

                if (allCompleted) {
                    confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#a855f7', '#22c55e', '#ffffff']
                    });
                    toast.success(t('machineDetail.poc.unlockSuccess'));
                    setTimeout(() => {
                        onUnlock();
                        onClose();
                    }, 1500);
                }
            } else {
                if (existingProgress) {
                    await supabase
                        .from('user_poc_progress')
                        .update({
                            attempts: existingProgress.attempts + 1
                        })
                        .eq('id', existingProgress.id);
                } else {
                    await supabase
                        .from('user_poc_progress')
                        .insert({
                            user_id: user.id,
                            challenge_id: challengeId,
                            question_id: question.id,
                            is_completed: false,
                            attempts: 1
                        });
                }

                toast.error(t('machineDetail.poc.incorrect') || result.message);
                await fetchQuestionsAndProgress();
            }
        } catch (error) {
            console.error('Error validating answer:', error);
            toast.error('Validation failed');
        } finally {
            setValidating(null);
        }
    };

    const completedCount = Array.from(progress.values()).filter(p => p.is_completed).length;
    const progressPercentage = calculateProgress(questions.length, completedCount);

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                <div className="text-white animate-pulse">Loading PoC Challenge...</div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-bg-card w-full max-w-2xl rounded-3xl border border-accent-purple/20 shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="text-center mb-6 pb-6 border-b border-white/5">
                    <h2 className="text-2xl font-display font-black text-white italic uppercase mb-2">
                        {t('machineDetail.poc.title')}
                    </h2>
                    <p className="text-text-muted text-xs">
                        {t('machineDetail.poc.subtitle')}
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-text-muted uppercase tracking-widest">
                            {t('machineDetail.poc.progress')}
                        </span>
                        <span className="text-xs font-mono text-accent-purple">{completedCount}/{questions.length}</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-accent-purple to-accent-cyan shadow-glow transition-all duration-500"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>

                {/* Questions */}
                <div className="space-y-4">
                    {questions.map((question, index) => {
                        const isCompleted = progress.get(question.id)?.is_completed || false;
                        const attempts = progress.get(question.id)?.attempts || 0;
                        const isValidatingThis = validating === question.id;

                        return (
                            <div
                                key={question.id}
                                className={`p-5 rounded-2xl border transition-all ${isCompleted
                                        ? 'bg-status-green/10 border-status-green/20'
                                        : 'bg-white/5 border-white/10 hover:border-accent-purple/30'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[10px] font-black text-accent-purple uppercase tracking-widest">
                                                Q{index + 1}
                                            </span>
                                            {isCompleted && (
                                                <span className="material-symbols-outlined text-status-green text-sm">check_circle</span>
                                            )}
                                            {attempts > 0 && !isCompleted && (
                                                <span className="text-[9px] text-text-muted">
                                                    {attempts} {attempts === 1 ? 'attempt' : 'attempts'}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-white leading-relaxed">
                                            {t('machines.title') === 'LABORATÓRIOS DE DESAFIO' && question.question_text_pt
                                                ? question.question_text_pt
                                                : question.question_text}
                                        </p>
                                    </div>
                                    <span className="text-[10px] font-mono text-accent-cyan ml-3">+{question.points}</span>
                                </div>

                                {!isCompleted && (
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            value={currentAnswers.get(question.id) || ''}
                                            onChange={(e) => {
                                                const newAnswers = new Map(currentAnswers);
                                                newAnswers.set(question.id, e.target.value);
                                                setCurrentAnswers(newAnswers);
                                            }}
                                            placeholder={t('machineDetail.poc.answerPlaceholder')}
                                            className="w-full bg-bg-main border border-white/10 text-white rounded-xl py-2.5 px-4 font-mono text-sm placeholder:text-white/20 focus:border-accent-purple transition-all outline-none"
                                            disabled={isValidatingThis}
                                        />
                                        <button
                                            onClick={() => handleValidateAnswer(question)}
                                            disabled={isValidatingThis || !currentAnswers.get(question.id)?.trim()}
                                            className="w-full py-2.5 bg-accent-purple hover:bg-accent-purple/90 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isValidatingThis ? (
                                                <>
                                                    <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                                                    Validating...
                                                </>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined text-sm">verified</span>
                                                    {t('machineDetail.poc.validate')}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Close Button */}
                <div className="mt-6 text-center">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all"
                    >
                        {t('actions.close')}
                    </button>
                </div>
            </div>
        </div>
    );
};
