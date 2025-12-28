import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const AdminReports: React.FC = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<any>(null);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const { data, error } = await supabase
                .from('reports')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReports(data || []);
        } catch (e) {
            console.error(e);
            toast.error("Failed to load reports");
        } finally {
            setLoading(false);
        }
    };

    const handleVerdict = async (id: string, verdict: 'approved' | 'rejected') => {
        try {
            const { error } = await supabase
                .from('reports')
                .update({ status: verdict })
                .eq('id', id);

            if (error) throw error;

            toast.success(`Report ${verdict.toUpperCase()}`);
            fetchReports();
            if (selectedReport?.id === id) setSelectedReport(null);
        } catch (e) {
            toast.error("Verdict failed");
        }
    };

    return (
        <div className="h-screen bg-neutral-900 text-white font-sans flex flex-col overflow-hidden">
            {/* HEADER */}
            <div className="h-16 bg-black border-b border-white/10 flex items-center justify-between px-6 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <Link to="/admin" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                        <span className="material-symbols-outlined text-sm">arrow_back</span> Dashboard
                    </Link>
                    <div className="h-4 w-[1px] bg-white/10"></div>
                    <span className="text-white font-bold text-sm tracking-wide uppercase">Intelligence Review Queue</span>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* LEFT: LIST */}
                <div className="w-1/3 border-r border-white/10 bg-neutral-900 overflow-y-auto">
                    {reports.map(report => (
                        <div
                            key={report.id}
                            onClick={() => setSelectedReport(report)}
                            className={`p-6 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-all
                                ${selectedReport?.id === report.id ? 'bg-white/5 border-l-4 border-l-accent-purple' : 'border-l-4 border-l-transparent'}
                            `}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm
                                    ${report.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                                        report.status === 'approved' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}
                                `}>
                                    {report.status}
                                </span>
                                <span className="text-[10px] text-gray-500 font-mono">
                                    {new Date(report.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="font-bold text-sm text-white mb-1">Mission Report: {report.machine_id}</div>
                            <div className="text-xs text-gray-500 truncate">{report.user_id}</div>
                        </div>
                    ))}
                    {reports.length === 0 && (
                        <div className="p-10 text-center text-gray-500 text-sm">No reports in queue.</div>
                    )}
                </div>

                {/* RIGHT: DETAILS */}
                <div className="flex-1 bg-white/5 overflow-y-auto p-10 relative">
                    {selectedReport ? (
                        <div className="max-w-4xl mx-auto">
                            <div className="flex justify-between items-center mb-8 bg-neutral-900 p-6 rounded-xl border border-white/10 sticky top-0 z-20 shadow-xl">
                                <div>
                                    <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Subject</div>
                                    <h1 className="text-2xl font-black text-white">{selectedReport.machine_id}</h1>
                                </div>
                                <div className="flex gap-4">
                                    {selectedReport.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleVerdict(selectedReport.id, 'rejected')}
                                                className="px-6 py-2 bg-red-900/20 text-red-500 border border-red-900 hover:bg-red-900/40 rounded uppercase text-xs font-bold tracking-widest transition-all"
                                            >
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => handleVerdict(selectedReport.id, 'approved')}
                                                className="px-6 py-2 bg-green-600 text-white hover:bg-green-500 rounded uppercase text-xs font-bold tracking-widest transition-all shadow-lg shadow-green-600/20"
                                            >
                                                Approve Intelligence
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white text-black p-12 min-h-[1000px] shadow-2xl rounded-sm">
                                <article className="prose prose-sm max-w-none prose-headings:font-black prose-headings:uppercase prose-h1:text-4xl prose-h2:text-2xl font-serif">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {selectedReport.content}
                                    </ReactMarkdown>
                                </article>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-600">
                            <span className="material-symbols-outlined text-6xl mb-4 opacity-50">description</span>
                            <div className="text-sm font-bold uppercase tracking-widest">Select a report to review</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminReports;
