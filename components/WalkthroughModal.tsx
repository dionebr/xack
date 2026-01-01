import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { REPORT_TEMPLATE } from '../constants/reportTemplate';
import ReportLayout from './ReportLayout';

interface WalkthroughModalProps {
    isOpen: boolean;
    onClose: () => void;
    machine: any;
}

const WalkthroughModal: React.FC<WalkthroughModalProps> = ({ isOpen, onClose, machine }) => {
    const [markdown, setMarkdown] = useState<string>('');
    const [viewMode, setViewMode] = useState<'EDIT' | 'PREVIEW'>('EDIT');
    const [submissionStatus, setSubmissionStatus] = useState<'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED'>('DRAFT');
    const [loading, setLoading] = useState(false);

    // Load existing report or draft
    useEffect(() => {
        if (!isOpen || !machine) return;

        const loadContent = async () => {
            setLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // 1. Check for existing submission in DB
                const { data: existingReport, error } = await supabase
                    .from('reports')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('machine_id', machine.id)
                    .single();

                if (existingReport) {
                    setMarkdown(existingReport.content);
                    setSubmissionStatus(existingReport.status.toUpperCase());
                } else {
                    // 2. Fallback to LocalStorage Draft
                    const savedDraft = localStorage.getItem(`xack_report_${machine.id}`);
                    if (savedDraft) {
                        setMarkdown(savedDraft);
                    } else {
                        setMarkdown(REPORT_TEMPLATE(machine.name));
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadContent();
    }, [isOpen, machine]);

    // Autosave
    useEffect(() => {
        if (markdown && machine && submissionStatus === 'DRAFT') {
            const timeout = setTimeout(() => {
                localStorage.setItem(`xack_report_${machine.id}`, markdown);
            }, 1000);
            return () => clearTimeout(timeout);
        }
    }, [markdown, machine, submissionStatus]);

    const handlePaste = async (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items;
        const textarea = e.currentTarget as HTMLTextAreaElement;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        for (const item of items) {
            if (item.type.indexOf('image') === 0) {
                e.preventDefault();
                const file = item.getAsFile();
                if (!file) return;

                const toastId = toast.loading("Encrypting Evidence...");
                try {
                    const fileExt = file.name.split('.').pop() || 'png';
                    const fileName = `${machine.id}_${Date.now()}.${fileExt}`;
                    const { data, error } = await supabase.storage
                        .from('mission-reports')
                        .upload(fileName, file);

                    if (error) throw error;

                    const publicUrl = supabase.storage.from('mission-reports').getPublicUrl(fileName).data.publicUrl;

                    const imgMd = `\n![EVIDENCE](${publicUrl})\n`;
                    const newText = markdown.substring(0, start) + imgMd + markdown.substring(end);
                    setMarkdown(newText);

                    toast.success("Evidence Secured", { id: toastId });
                } catch (err) {
                    toast.error("Upload Failed", { id: toastId });
                }
            }
        }
    };

    const handleSubmit = async () => {
        if (!confirm("Submit this report for official review? Once submitted, it will be locked until approved.")) return;

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Unauthorized");

            // Upsert report
            const { error } = await supabase.from('reports').upsert({
                user_id: user.id,
                machine_id: machine.id,
                content: markdown,
                status: 'pending',
                title: `${machine.name} Walkthrough`
            }, { onConflict: 'user_id, machine_id' });

            if (error) throw error;

            setSubmissionStatus('PENDING');
            localStorage.removeItem(`xack_report_${machine.id}`);
            toast.success("Report Transmitted to Command");
            onClose();

        } catch (err) {
            toast.error("Submission Failed");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8">
            {/* Backdrop with Blur */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-xl transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-7xl h-[90vh] bg-[#0A0A0A] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 ring-1 ring-white/5">

                {/* Header */}
                <div className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/40 backdrop-blur-lg">
                    <div className="flex items-center gap-6">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                            <span className="material-symbols-outlined">description</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Mission Report: {machine?.name}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`w-2 h-2 rounded-full ${submissionStatus === 'APPROVED' ? 'bg-green-500 shadow-green-500/50 shadow-lg' :
                                    submissionStatus === 'PENDING' ? 'bg-yellow-500 animate-pulse' :
                                        'bg-gray-500'
                                    }`}></span>
                                <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">{submissionStatus}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-white/5 p-1 rounded-lg flex border border-white/5">
                            <button
                                onClick={() => setViewMode('EDIT')}
                                className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'EDIT' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                            >
                                WRITER
                            </button>
                            <button
                                onClick={() => setViewMode('PREVIEW')}
                                className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'PREVIEW' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                            >
                                PREVIEW
                            </button>
                        </div>

                        <div className="w-[1px] h-8 bg-white/10 mx-2"></div>

                        <button
                            onClick={onClose}
                            className="p-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-hidden relative">
                    {/* Editor View */}
                    <div className={`absolute inset-0 transition-opacity duration-300 ${viewMode === 'EDIT' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                        <textarea
                            value={markdown}
                            onChange={(e) => setMarkdown(e.target.value)}
                            onPaste={handlePaste}
                            placeholder="# Classification Level: Top Secret\n\nBegin your report here..."
                            className="w-full h-full bg-[#050505] text-gray-300 font-mono p-12 resize-none focus:outline-none leading-relaxed text-sm selection:bg-purple-500/30"
                            spellCheck={false}
                            disabled={submissionStatus !== 'DRAFT' && submissionStatus !== 'REJECTED'}
                        />
                        <div className="absolute bottom-6 right-6 text-xs font-mono text-gray-600 pointer-events-none">
                            MARKDOWN SUPPORTED // PASTE IMAGES TO UPLOAD
                        </div>
                    </div>

                    {/* Preview View */}
                    <div className={`absolute inset-0 bg-white overflow-y-auto transition-opacity duration-300 transform ${viewMode === 'PREVIEW' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                        <div className="max-w-[210mm] mx-auto min-h-full bg-white shadow-2xl my-8">
                            <ReportLayout
                                machineId={machine?.id || '000'}
                                machineName={machine?.name || 'TARGET'}
                                difficulty={machine?.difficulty || 'hard'}
                            >
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        // Reuse components from MachineWalkthrough to ensure consistency
                                        h1: ({ node, ...props }) => <h1 className="text-3xl font-black uppercase mb-6 pb-2 border-b-2 border-black" {...props} />,
                                        h2: ({ node, ...props }) => <h2 className="text-2xl font-bold uppercase mt-10 mb-4 flex items-center gap-2 before:content-['//'] before:text-purple-600 before:mr-2" {...props} />,
                                        code: ({ node, inline, className, children, ...props }: any) => {
                                            const match = /language-(\w+)/.exec(className || '')
                                            return !inline && match ? (
                                                <div className="my-6 rounded-lg overflow-hidden border border-gray-800 shadow-xl bg-gray-900 text-gray-100 p-4 font-mono text-sm">
                                                    {children}
                                                </div>
                                            ) : (
                                                <code className="bg-gray-100 text-red-600 px-1 rounded font-mono font-bold text-xs" {...props}>{children}</code>
                                            )
                                        },
                                        img: ({ node, ...props }: any) => (
                                            <div className="my-8 border-2 border-black p-1 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                                <img {...props} className="w-full h-auto block" />
                                            </div>
                                        ),
                                        blockquote: ({ node, ...props }: any) => (
                                            <div className="border-l-4 border-purple-500 bg-purple-50 p-4 my-6 text-purple-900 rounded-r-lg" {...props} />
                                        )
                                    }}
                                >
                                    {markdown}
                                </ReactMarkdown>
                            </ReportLayout>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="h-20 border-t border-white/5 bg-black/40 backdrop-blur-md flex items-center justify-between px-8">
                    <div className="flex items-center gap-3">
                        {submissionStatus === 'DRAFT' && (
                            <span className="text-xs font-mono text-gray-500 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                Auto-saving enabled
                            </span>
                        )}
                        {submissionStatus === 'PENDING' && (
                            <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-3">
                                <span className="material-symbols-outlined text-yellow-500">hourglass_top</span>
                                <div>
                                    <div className="text-xs font-bold text-yellow-500 uppercase">Under Review</div>
                                    <div className="text-[10px] text-gray-400">Your report is being analyzed by Command.</div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {(submissionStatus === 'DRAFT' || submissionStatus === 'REJECTED') && (
                            <button
                                onClick={handleSubmit}
                                disabled={loading || !markdown}
                                className="group relative px-6 py-3 bg-white text-black rounded-xl font-bold text-xs uppercase tracking-widest overflow-hidden transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                                <span className="relative flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base">send_and_archive</span>
                                    Submit for Classification
                                </span>
                            </button>
                        )}
                        {submissionStatus === 'APPROVED' && (
                            <button
                                onClick={() => setViewMode('PREVIEW')} // Or trigger download
                                className="px-6 py-3 bg-green-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(34,197,94,0.3)] flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined">verified</span>
                                Approved Payload
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalkthroughModal;
