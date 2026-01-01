export type ValidationType = 'exact' | 'regex' | 'flag';

export interface ValidationResult {
    isCorrect: boolean;
    message: string;
}

export interface PoCQuestion {
    id: string;
    challenge_id: string;
    question_order: number;
    question_text: string;
    question_text_pt?: string;
    hint?: string;
    hint_pt?: string;
    validation_type: ValidationType;
    correct_answer: string;
    points: number;
}

export interface UserPoCProgress {
    id: string;
    user_id: string;
    challenge_id: string;
    question_id: string;
    is_completed: boolean;
    completed_at?: string;
    attempts: number;
}

/**
 * Validates a user's answer against the correct answer using the specified validation type
 */
export function validateAnswer(
    userAnswer: string,
    correctAnswer: string,
    validationType: ValidationType
): ValidationResult {
    const trimmedAnswer = userAnswer.trim();

    switch (validationType) {
        case 'exact':
            const isExactMatch = trimmedAnswer.toLowerCase() === correctAnswer.toLowerCase();
            return {
                isCorrect: isExactMatch,
                message: isExactMatch ? 'Correct!' : 'Incorrect answer. Keep investigating...'
            };

        case 'regex':
            try {
                const regex = new RegExp(correctAnswer, 'i');
                const isRegexMatch = regex.test(trimmedAnswer);
                return {
                    isCorrect: isRegexMatch,
                    message: isRegexMatch ? 'Correct!' : 'Pattern does not match. Try again...'
                };
            } catch (error) {
                return {
                    isCorrect: false,
                    message: 'Invalid validation pattern'
                };
            }

        case 'flag':
            // Flag format: XACK{...}
            const flagRegex = /^XACK\{.+\}$/;
            const isFlagValid = flagRegex.test(trimmedAnswer) && trimmedAnswer === correctAnswer;
            return {
                isCorrect: isFlagValid,
                message: isFlagValid ? 'Flag validated!' : 'Invalid flag format or value'
            };

        default:
            return {
                isCorrect: false,
                message: 'Unknown validation type'
            };
    }
}

/**
 * Calculates the total progress percentage for a challenge
 */
export function calculateProgress(
    totalQuestions: number,
    completedQuestions: number
): number {
    if (totalQuestions === 0) return 0;
    return Math.round((completedQuestions / totalQuestions) * 100);
}
