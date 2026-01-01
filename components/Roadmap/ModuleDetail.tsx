import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Database } from '../../database.types';
import { supabase } from '../../lib/supabase';
import {
    X,
    ArrowLeft,
    ArrowRight,
    PlayCircle,
    CheckCircle2,
    Circle,
    Clock,
    BarChart3,
    LayoutGrid,
    ChevronRight,
    Play,
    BookOpen
} from 'lucide-react';
import { MermaidDiagram } from '../ui/MermaidDiagram';
import { KernelVisual, ProcessVisual, LinuxPermissionsVisual, OSIVisual, VirtualizationVisual, NetworkTopologyVisual, AddressingVisual } from './RoadmapVisuals';

type Level = Database['public']['Tables']['roadmap_levels']['Row'];
type Module = Database['public']['Tables']['roadmap_modules']['Row'];
type Topic = Database['public']['Tables']['roadmap_topics']['Row'];

interface ModuleDetailProps {
    level: Level;
    onClose: () => void;
}

export const ModuleDetail: React.FC<ModuleDetailProps> = ({ level, onClose }) => {
    const [modules, setModules] = useState<Module[]>([]);
    const [topics, setTopics] = useState<Record<number, Topic[]>>({});
    const [loading, setLoading] = useState(true);
    const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
    const [completedTopics, setCompletedTopics] = useState<Set<number>>(new Set());
    const [isCompleting, setIsCompleting] = useState(false);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);

            // Fetch Modules
            const { data: modulesData } = await supabase
                .from('roadmap_modules')
                .select('*')
                .eq('level_id', level.id)
                .order('order_index');

            if (modulesData) {
                setModules(modulesData);

                // Fetch Topics
                const moduleIds = modulesData.map(m => m.id);
                if (moduleIds.length > 0) {
                    const { data: topicsData } = await supabase
                        .from('roadmap_topics')
                        .select('*')
                        .in('module_id', moduleIds)
                        .order('order_index');

                    if (topicsData) {
                        const topicsMap: Record<number, Topic[]> = {};
                        topicsData.forEach(t => {
                            if (!topicsMap[t.module_id!]) topicsMap[t.module_id!] = [];
                            topicsMap[t.module_id!].push(t);
                        });
                        setTopics(topicsMap);
                    }
                }
            }

            // Fetch Progress
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: progressData } = await supabase
                    .from('user_roadmap_progress')
                    .select('topic_id')
                    .eq('user_id', user.id)
                    .eq('is_completed', true);

                if (progressData) {
                    setCompletedTopics(new Set(progressData.map(p => p.topic_id)));
                }
            }

            setLoading(false);
        }
        fetchData();
    }, [level]);

    const handleTopicClick = (topic: Topic) => {
        setActiveTopic(topic);
    };

    const handleStartSector = () => {
        if (modules.length > 0) {
            const firstModule = modules[0];
            const moduleTopics = topics[firstModule.id];
            if (moduleTopics && moduleTopics.length > 0) {
                setActiveTopic(moduleTopics[0]);
            }
        }
    };

    const handleMarkComplete = async () => {
        if (!activeTopic) return;
        setIsCompleting(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase
                    .from('user_roadmap_progress')
                    .upsert({
                        user_id: user.id,
                        topic_id: activeTopic.id,
                        level_id: level.id,
                        module_id: activeTopic.module_id,
                        is_completed: true,
                        completed_at: new Date().toISOString()
                    });

                setCompletedTopics(prev => new Set(prev).add(activeTopic.id));
            } else {
                setCompletedTopics(prev => new Set(prev).add(activeTopic.id));
            }
        } catch (error) {
            console.error("Error marking complete:", error);
        } finally {
            setIsCompleting(false);
        }
    };

    // Find next/prev topic logic
    const getAllTopicsFlat = () => {
        const flat: Topic[] = [];
        modules.forEach(m => {
            if (topics[m.id]) flat.push(...topics[m.id]);
        });
        return flat;
    };

    const allTopics = getAllTopicsFlat();
    const activeIndex = activeTopic ? allTopics.findIndex(t => t.id === activeTopic.id) : -1;
    const prevTopic = activeIndex > 0 ? allTopics[activeIndex - 1] : null;
    const nextTopic = activeIndex > -1 && activeIndex < allTopics.length - 1 ? allTopics[activeIndex + 1] : null;


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fadeIn text-sans">
            <div className="bg-[#050505] border border-white/10 w-full max-w-7xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl flex relative h-[85vh]">

                {/* LEFT SIDEBAR - TIMELINE */}
                <div className="w-80 border-r border-white/5 bg-bg-card/20 flex flex-col flex-shrink-0 backdrop-blur-xl">
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 bg-gradient-to-r from-white/[0.02] to-transparent">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-2xl opacity-50" style={{ color: level.color || 'white' }}>{level.icon}</span>
                            <div>
                                <div className="text-[9px] font-black text-white/30 uppercase tracking-widest">Sector {level.order_index}</div>
                                <h2 className="text-sm font-display font-black text-white italic uppercase tracking-tighter leading-tight">{level.title}</h2>
                            </div>
                        </div>
                    </div>

                    {/* Timeline List */}
                    <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar relative">
                        {/* Vertical Path Line */}
                        <div className="absolute left-[39px] top-8 bottom-8 w-px bg-white/5"></div>

                        {loading ? (
                            <div className="space-y-4 pl-12">
                                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />)}
                            </div>
                        ) : (
                            modules.map((module, mIndex) => (
                                <div key={module.id} className="mb-8 relative">
                                    <h3 className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-4 pl-12 truncate" title={module.title}>
                                        {mIndex + 1}. {module.title}
                                    </h3>

                                    <div className="space-y-6">
                                        {topics[module.id]?.map((topic, tIndex) => {
                                            const isActive = activeTopic?.id === topic.id;
                                            const isCompleted = completedTopics.has(topic.id);
                                            const duration = 15;

                                            return (
                                                <div
                                                    key={topic.id}
                                                    onClick={() => handleTopicClick(topic)}
                                                    className="group relative flex items-start gap-4 cursor-pointer"
                                                >
                                                    {/* Node Circle */}
                                                    <div className={`
                                                        w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 transition-all flex-shrink-0 bg-[#0a0a0a]
                                                        ${isActive
                                                            ? 'border-accent-cyan text-accent-cyan shadow-[0_0_15px_rgba(34,211,238,0.3)] scale-110'
                                                            : (isCompleted ? 'border-accent-green/50 text-accent-green' : 'border-white/10 text-text-muted group-hover:border-white/30')
                                                        }
                                                    `}>
                                                        {isCompleted ? (
                                                            <CheckCircle2 size={12} strokeWidth={3} />
                                                        ) : (
                                                            <span className="text-[10px] font-black">{tIndex + 1}</span>
                                                        )}
                                                    </div>

                                                    {/* Text Info */}
                                                    <div className={`transition-all ${isActive ? 'opacity-100 translate-x-1' : 'opacity-60 group-hover:opacity-90'}`}>
                                                        <div className={`text-xs font-bold leading-tight mb-1 ${isActive ? 'text-white' : 'text-white/80'}`}>
                                                            {topic.title}
                                                        </div>
                                                        <div className="text-[9px] uppercase tracking-wider text-text-muted flex items-center gap-1 font-medium">
                                                            {isActive && <PlayCircle size={10} className="text-accent-cyan" />}
                                                            <span>{duration} min</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* RIGHT CONTENT AREA */}
                <div className="flex-1 flex flex-col bg-[#080808] relative overflow-hidden">

                    {/* Top Navigation Bar */}
                    <div className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/40 backdrop-blur-md z-20">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setActiveTopic(null)}
                                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-text-muted hover:text-white transition-colors group"
                            >
                                <LayoutGrid size={14} className="group-hover:text-accent-cyan transition-colors" />
                                Overview
                            </button>
                            {activeTopic && (
                                <>
                                    <ChevronRight size={12} className="text-white/10" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 truncate max-w-[200px]">
                                        {activeTopic.title}
                                    </span>
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors">
                                <X size={18} className="text-white/50 hover:text-white transition-colors" />
                            </button>
                        </div>
                    </div>

                    {/* Main Content Scrollable */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                        {/* Very subtle noise/gradient */}
                        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent-purple/5 blur-[200px] rounded-full pointer-events-none opacity-20 mix-blend-screen"></div>

                        <div className="max-w-4xl mx-auto p-8 md:p-14 relative z-10 min-h-full flex flex-col">
                            {activeTopic ? (
                                <div className="animate-fadeIn">
                                    {/* Topic Header Card */}
                                    <div className="mb-12">
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-[10px] font-black uppercase tracking-widest text-accent-cyan mb-6">
                                            <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan shadow-[0_0_10px_rgba(34,211,238,0.5)]"></span>
                                            Module: {modules.find(m => m.id === activeTopic.module_id)?.title}
                                        </div>
                                        <h1 className="text-4xl md:text-6xl font-display font-black text-white italic tracking-tighter mb-8 leading-[0.9]">
                                            {activeTopic.title}
                                        </h1>
                                        <div className="flex items-center gap-8 text-xs text-text-muted font-medium pb-10 border-b border-white/5">
                                            <div className="flex items-center gap-2">
                                                <Clock size={16} />
                                                15 min read
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <BarChart3 size={16} />
                                                Beginner
                                            </div>
                                            {completedTopics.has(activeTopic.id) && (
                                                <div className="flex items-center gap-2 text-accent-green">
                                                    <CheckCircle2 size={16} />
                                                    Completed
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Markdown Content */}
                                    <div className="prose prose-invert prose-lg max-w-none 
                                        prose-headings:font-display prose-headings:font-black prose-headings:italic prose-headings:tracking-tight prose-headings:text-white
                                        prose-p:text-gray-400 prose-p:leading-8 prose-p:font-normal
                                        prose-strong:text-white prose-strong:font-bold
                                        prose-a:text-accent-cyan prose-a:no-underline hover:prose-a:underline
                                        prose-blockquote:border-l-2 prose-blockquote:border-accent-purple prose-blockquote:bg-white/[0.02] prose-blockquote:px-8 prose-blockquote:py-6 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:text-gray-300
                                        prose-code:text-accent-pink prose-code:bg-[#111] prose-code:border prose-code:border-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
                                        prose-pre:bg-[#0A0A0A] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl prose-pre:shadow-2xl
                                        prose-img:rounded-2xl prose-img:border prose-img:border-white/5 prose-img:shadow-2xl prose-img:my-10
                                        prose-ul:list-disc prose-ul:marker:text-accent-cyan prose-li:my-2
                                        prose-ol:list-decimal prose-ol:marker:text-accent-purple
                                        ">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                code({ node, inline, className, children, ...props }: any) {
                                                    const match = /language-(\w+)(?:-([\w-]+))?/.exec(className || '')

                                                    // Mermaid Handling
                                                    if (!inline && match && match[1] === 'mermaid') {
                                                        return <MermaidDiagram chart={String(children).replace(/\n$/, '')} />
                                                    }

                                                    // Visual Components Handling
                                                    if (!inline && match && match[1] === 'visual') {
                                                        const type = match[2]; // e.g. 'kernel', 'process'
                                                        if (type === 'kernel') return <KernelVisual />;
                                                        if (type === 'process') return <ProcessVisual />;
                                                        if (type === 'linux') return <LinuxPermissionsVisual />;
                                                        if (type === 'osi') return <OSIVisual />;
                                                        if (type === 'virtualization') return <VirtualizationVisual />;
                                                        if (type === 'network-topology') return <NetworkTopologyVisual />;
                                                        if (type === 'addressing') return <AddressingVisual />;
                                                    }

                                                    // Terminal Block (for code blocks)
                                                    if (!inline && match) {
                                                        const language = match[1];
                                                        return (
                                                            <div className="my-8 rounded-xl overflow-hidden border border-white/10 bg-[#0F0F0F] shadow-2xl relative group">
                                                                {/* Terminal Header */}
                                                                <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5">
                                                                    <div className="flex gap-1.5">
                                                                        <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                                                                        <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                                                                        <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                                                                    </div>
                                                                    <div className="absolute left-1/2 transform -translate-x-1/2 text-[10px] font-mono text-white/30 uppercase tracking-widest font-bold">
                                                                        {language === 'bash' || language === 'powershell' ? 'TERMINAL' : language.toUpperCase()}
                                                                    </div>
                                                                    <div className="w-10"></div> {/* Spacer for center alignment */}
                                                                </div>

                                                                {/* Code Content */}
                                                                <div className="p-5 overflow-x-auto custom-scrollbar">
                                                                    <code className={`font-mono text-sm leading-relaxed ${className}`} {...props}>
                                                                        {children}
                                                                    </code>
                                                                </div>
                                                            </div>
                                                        );
                                                    }

                                                    // Inline Code
                                                    return (
                                                        <code className="text-accent-pink bg-[#111] border border-white/10 px-1.5 py-0.5 rounded-md font-mono text-xs" {...props}>
                                                            {children}
                                                        </code>
                                                    )
                                                }
                                            }}
                                        >
                                            {activeTopic.content || "*Content currently under development by headquarters...*"}
                                        </ReactMarkdown>
                                    </div>

                                    {/* Action Footer */}
                                    <div className="mt-20 pt-8 border-t border-white/5 flex justify-between items-center bg-gradient-to-t from-[#080808] to-transparent pb-10 sticky bottom-0 backdrop-blur-sm z-20">
                                        {prevTopic ? (
                                            <button
                                                onClick={() => setActiveTopic(prevTopic)}
                                                className="group flex items-center gap-4 text-xs font-bold text-text-muted hover:text-white transition-colors uppercase tracking-wider pl-2"
                                            >
                                                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/30 group-hover:bg-white/5 transition-all">
                                                    <ArrowLeft size={16} />
                                                </div>
                                                <div className="flex flex-col items-start gap-0.5">
                                                    <span className="text-[9px] opacity-40">Previous Lesson</span>
                                                    <span className="max-w-[150px] truncate">{prevTopic.title}</span>
                                                </div>
                                            </button>
                                        ) : <div />}

                                        <button
                                            onClick={handleMarkComplete}
                                            disabled={isCompleting || completedTopics.has(activeTopic.id)}
                                            className={`
                                                px-8 py-4 font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center gap-3 shadow-lg hover:scale-[1.02] active:scale-[0.98]
                                                ${completedTopics.has(activeTopic.id)
                                                    ? 'bg-[#111] text-accent-green border border-accent-green/20 cursor-default'
                                                    : 'bg-white text-black hover:bg-gray-200 shadow-white/5'
                                                }
                                            `}
                                        >
                                            {isCompleting ? (
                                                <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                                            ) : (
                                                completedTopics.has(activeTopic.id) ? <CheckCircle2 size={18} /> : <Circle size={18} />
                                            )}
                                            {completedTopics.has(activeTopic.id) ? 'Completed' : 'Mark as Complete'}
                                        </button>

                                        {nextTopic ? (
                                            <button
                                                onClick={() => setActiveTopic(nextTopic)}
                                                className="group flex items-center gap-4 text-xs font-bold text-text-muted hover:text-white transition-colors uppercase tracking-wider pr-2"
                                            >
                                                <div className="flex flex-col items-end gap-0.5">
                                                    <span className="text-[9px] opacity-40">Next Lesson</span>
                                                    <span className="max-w-[150px] truncate">{nextTopic.title}</span>
                                                </div>
                                                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/30 group-hover:bg-white/5 transition-all">
                                                    <ArrowRight size={16} />
                                                </div>
                                            </button>
                                        ) : <div />}
                                    </div>
                                </div>
                            ) : (
                                /* DEFAULT WELCOME STATE */
                                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-fadeIn">
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-white/5 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                        <div className="w-32 h-32 rounded-3xl bg-[#111] border border-white/10 flex items-center justify-center backdrop-blur-md relative z-10 shadow-2xl skew-y-3 group-hover:skew-y-0 transition-all duration-500">
                                            <BookOpen size={48} className="text-white/20 group-hover:text-white transition-colors" />
                                        </div>
                                    </div>

                                    <div className="max-w-lg">
                                        <h3 className="text-4xl font-display font-black text-white italic tracking-tighter mb-4">
                                            Ready to Initialize <br />
                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-600">Module Sequence</span>
                                        </h3>
                                        <p className="text-text-muted font-light leading-relaxed">
                                            Select a learning module from the timeline on the left to begin your instruction.
                                            Content is sequential. Do not skip steps.
                                        </p>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={handleStartSector}
                                            className="px-8 py-4 bg-white text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all shadow-glow hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3"
                                        >
                                            <Play size={16} fill="currentColor" />
                                            Start Sector
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};
