import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase } from '../lib/supabase';
import ReportLayout from '../components/ReportLayout';
import { REPORT_TEMPLATE } from '../constants/reportTemplate';
import { Toaster, toast } from 'sonner';

const MachineWalkthrough: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [machine, setMachine] = useState<any>(null);
    const [markdown, setMarkdown] = useState<string>('');
    const [loading, setLoading] = useState(true);

    // Load Machine Data
    useEffect(() => {
        const fetchMachine = async () => {
            try {
                const { data, error } = await supabase
                    .from('challenges')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                setMachine(data);
            } catch (err) {
                toast.error("Failed to load mission data");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchMachine();
    }, [id]);

    // Load Draft or Template
    useEffect(() => {
        if (!machine) return;

        const savedDraft = localStorage.getItem(`xack_report_draft_${machine.id} `);
        if (savedDraft) {
            setMarkdown(savedDraft);
            toast.info("Draft restored from local storage");
        } else {
            setMarkdown(REPORT_TEMPLATE(machine.name));
        }
    }, [machine]);

    // Save Draft on Change
    const handleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newVal = e.target.value;
        setMarkdown(newVal);
        if (machine?.id) {
            localStorage.setItem(`xack_report_draft_${machine.id}`, newVal);
        }
    };

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

                const loadingToast = toast.loading("Encrypting & Uploading Evidence...");

                try {
                    const fileExt = file.name.split('.').pop() || 'png';
                    const fileName = `${machine.id}_${Date.now()}.${fileExt}`;
                    const filePath = `${fileName}`;

                    const { error: uploadError } = await supabase.storage
                        .from('mission-reports')
                        .upload(filePath, file);

                    if (uploadError) throw uploadError;

                    const { data } = supabase.storage
                        .from('mission-reports')
                        .getPublicUrl(filePath);

                    const imageMarkdown = `\n![EVIDENCE_${Date.now().toString().slice(-4)}](${data.publicUrl})\n`;

                    // Insert at previously captured cursor position
                    // Note: We use the current 'markdown' state. Race conditions possible if user types during upload,
                    // but blocking crash is priority.
                    const text = markdown;
                    const newText = text.substring(0, start) + imageMarkdown + text.substring(end);

                    setMarkdown(newText);
                    if (machine?.id) {
                        localStorage.setItem(`xack_report_draft_${machine.id}`, newText);
                    }

                    toast.dismiss(loadingToast);
                    toast.success("Evidence Secured");

                } catch (err) {
                    console.error(err);
                    toast.dismiss(loadingToast);
                    toast.error("Upload failed");
                }
            }
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleReset = () => {
        if (window.confirm("Are you sure? This will delete your current draft.")) {
            const template = REPORT_TEMPLATE(machine.name);
            setMarkdown(template);
            if (machine?.id) localStorage.setItem(`xack_report_draft_${machine.id}`, template);
            toast.success("Template reset");
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-white">LOADING MISSION...</div>;
    }

    if (!machine) return null;

    return (
        <div className="flex h-screen w-full bg-neutral-900 overflow-hidden print:h-auto print:overflow-visible print:block">
            <Toaster theme="dark" position="top-center" />

            {/* LEFT: EDITOR PANEL (Hidden on Print) */}
            <div className="w-1/2 flex flex-col border-r border-white/10 print:hidden h-full">
                {/* Toolbar */}
                <div className="h-16 bg-neutral-900 border-b border-white/10 flex items-center justify-between px-6 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(`/machines/${id}`)} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                            <span className="material-symbols-outlined text-sm">arrow_back</span> Back
                        </button>
                        <div className="h-4 w-[1px] bg-white/10"></div>
                        <span className="text-white font-bold text-sm tracking-wide">REPORT EDITOR</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={handleReset} className="text-xs font-bold text-red-500 uppercase tracking-widest hover:bg-white/5 px-3 py-2 rounded transition-colors hidden md:block">
                            Reset
                        </button>

                        {/* SUBMIT BUTTON */}
                        <button
                            onClick={async () => {
                                if (window.confirm("Submit this report to Command & Control? This will lock your draft for review.")) {
                                    const toastId = toast.loading("Encrypting and transmitting report...");
                                    try {
                                        const { data: { user } } = await supabase.auth.getUser();
                                        if (!user) throw new Error("Unauthorized");

                                        const { error } = await supabase.from('reports').insert({
                                            user_id: user.id,
                                            machine_id: machine.id,
                                            content: markdown,
                                            status: 'pending'
                                        });

                                        if (error) throw error;

                                        toast.success("Report Transmitted Successfully", { id: toastId });
                                        // Optional: Redirect or lock editor
                                        // For now, allow them to keep printing if they want, but show status.
                                    } catch (err) {
                                        console.error(err);
                                        toast.error("Transmission Failed", { id: toastId });
                                    }
                                }
                            }}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-green-500/20"
                        >
                            <span className="material-symbols-outlined text-sm">send</span> Submit Report
                        </button>

                        <button onClick={handlePrint} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20">
                            <span className="material-symbols-outlined text-sm">print</span> Export PDF (English)
                        </button>
                    </div>
                </div>

                {/* Text Area */}
                <div className="flex-1 relative bg-[#0d1117]">
                    <textarea
                        value={markdown}
                        onChange={handleEditorChange}
                        onPaste={handlePaste}
                        className="w-full h-full bg-transparent text-gray-300 font-mono text-sm p-8 resize-none focus:outline-none leading-relaxed"
                        placeholder="# Start writing your report... (Paste images to upload)"
                        spellCheck={false}
                    />
                </div>
            </div>

            {/* RIGHT: PREVIEW PANEL (Full width on Print) */}
            <div className="w-1/2 h-full bg-gray-100 overflow-y-auto print:w-full print:h-auto print:overflow-visible relative">
                {/* Print Overlay helper (only visible on screen) */}
                <div className="print:hidden absolute top-4 right-6 z-10 bg-black/80 text-white text-[10px] font-bold px-3 py-1 rounded-full pointer-events-none uppercase tracking-widest opacity-50">
                    Live Preview (A4)
                </div>

                <div className="preview-container origin-top-left print:transform-none">
                    <ReportLayout
                        machineId={machine.id}
                        machineName={machine.name}
                        difficulty={machine.difficulty}
                    >
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                h1: ({ node, ...props }) => <h1 className="text-3xl font-black uppercase mb-6 pb-2 border-b-2 border-black break-after-avoid" {...props} />,
                                h2: ({ node, ...props }) => <h2 className="text-2xl font-bold uppercase mt-10 mb-4 flex items-center gap-2 before:content-['//'] before:text-accent-purple before:mr-2 break-after-avoid" {...props} />,
                                h3: ({ node, ...props }) => <h3 className="text-xl font-bold mt-6 mb-3 break-after-avoid" {...props} />,
                                p: ({ node, ...props }) => <p className="mb-4 text-justify leading-relaxed" {...props} />,
                                ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
                                ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-1" {...props} />,
                                li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                img: ({ node, ...props }: any) => (
                                    <span className="block my-8 break-inside-avoid">
                                        <span className="block border-2 border-black p-1 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                            <img {...props} className="w-full h-auto block" />
                                        </span>
                                        {props.alt && <span className="mt-2 font-mono text-[10px] uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                            EVIDENCE // {props.alt}
                                        </span>}
                                    </span>
                                ),
                                code: ({ node, inline, className, children, ...props }: any) => {
                                    const match = /language-(\w+)/.exec(className || '')
                                    // Use match presence to detect block code, as 'inline' prop is unreliable in v9+
                                    return match ? (
                                        <div className="my-6 rounded-lg overflow-hidden border border-gray-800 shadow-xl break-inside-avoid">
                                            <div className="bg-gray-900 px-4 py-2 flex items-center gap-2 border-b border-gray-700">
                                                <span className="text-xs font-mono text-gray-400 uppercase">{match[1]}</span>
                                            </div>
                                            <div className="bg-gray-950 p-4 overflow-x-auto text-sm font-mono text-gray-300">
                                                <code className={className} {...props}>
                                                    {children}
                                                </code>
                                            </div>
                                        </div>
                                    ) : (
                                        <code className="bg-gray-200 text-red-700 px-1 py-0.5 rounded font-mono text-xs font-bold border border-gray-300" {...props}>
                                            {children}
                                        </code>
                                    )
                                },
                                blockquote: ({ node, ...props }) => (
                                    <blockquote className="border-l-4 border-yellow-500 bg-yellow-50 p-4 my-6 italic text-gray-700 rounded-r-lg shadow-sm" {...props} />
                                )
                            }}
                        >
                            {markdown}
                        </ReactMarkdown>
                    </ReportLayout>
                </div>
            </div>
        </div>
    );
};

export default MachineWalkthrough;
