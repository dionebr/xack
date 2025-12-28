import React from 'react';
import { ASSETS } from '../constants';

interface ReportLayoutProps {
    children: React.ReactNode;
    machineId: string;
    machineName: string;
    difficulty: string;
}

const ReportLayout: React.FC<ReportLayoutProps> = ({ children, machineId, machineName, difficulty }) => {
    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="print:block bg-white text-black font-sans min-h-screen print:min-h-0 print:h-auto print:overflow-visible">
            {/* GLOBAL HEADER (Repeats on every page via CSS fixed positioning if supported, otherwise just top) */}
            <div className="print-header fixed top-0 left-0 w-full p-8 border-b-2 border-black/10 flex justify-between items-center z-50 bg-white">
                <div className="flex items-center gap-3">
                    <div className="h-4 w-4 bg-black rounded-sm"></div>
                    <span className="font-mono text-xs font-bold tracking-[0.2em] uppercase">XACK MISSION REPORT // {machineId}</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 opacity-80 grayscale-[0.3] hover:grayscale-0 transition-all">
                        <span className="text-lg leading-none">🇧🇷</span>
                        <span className="text-lg leading-none">🇺🇸</span>
                    </div>
                    <span className="font-mono text-[10px] uppercase text-gray-500">CLASS: CONFIDENTIAL</span>
                    <span className={`px-2 py-0.5 text-[10px] uppercase font-bold text-white ${difficulty === 'hard' ? 'bg-red-600' : difficulty === 'medium' ? 'bg-yellow-600' : 'bg-green-600'}`}>
                        {difficulty}
                    </span>
                </div>
            </div>

            {/* COVER PAGE */}
            <div className="print-page relative h-[297mm] w-[210mm] mx-auto overflow-hidden flex flex-col justify-between p-20 break-after-always">

                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gray-100 rounded-full blur-[100px] -z-10"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gray-50 rounded-full blur-[80px] -z-10"></div>

                <div className="space-y-20 mt-20">
                    <div className="space-y-4">
                        <div className="flex items-center gap-6 mb-10">
                            {/* Larger Logo */}
                            <img src="/assets/images/logo_dark.svg" alt="X-ACK Logo" className="h-16 w-auto" />
                            <div className="text-4xl font-display font-bold tracking-tight uppercase">CYBER SECURITY</div>
                        </div>
                        <div className="h-1 w-24 bg-black"></div>
                    </div>

                    <div className="space-y-6">
                        <div className="font-mono text-sm tracking-[0.3em] uppercase text-gray-500">Official Field Report</div>
                        <h1 className="text-8xl font-black uppercase tracking-tighter leading-[0.8] break-words">
                            {machineName}
                        </h1>
                        <div className="text-2xl font-light text-gray-600">Mission Walkthrough & Intelligence</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-10 border-t-4 border-black pt-10">
                    <div>
                        <div className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1">Generated Date</div>
                        <div className="font-bold text-lg">{currentDate}</div>
                    </div>
                    <div>
                        <div className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1">Authorization</div>
                        <div className="font-bold text-lg">LEVEL 5 ACCESS</div>
                    </div>
                    <div>
                        <div className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1">Classification</div>
                        <div className="font-bold text-lg text-red-600 uppercase">Top Secret</div>
                    </div>
                    <div>
                        {/* Removed duplicate signature here to clean up UI */}
                    </div>
                </div>
            </div>

            {/* CONTENT PAGES */}
            <div className="max-w-[210mm] mx-auto p-12 pt-32 pb-40 print-content bg-white">
                <div className="font-mono text-xs mb-8 text-gray-400">
            // BEGIN TRANSMISSION
                </div>

                {/* The Markdown Content will go here */}
                <article className="prose prose-sm max-w-none prose-headings:font-black prose-headings:uppercase prose-h1:text-4xl prose-h2:text-2xl prose-h2:border-l-4 prose-h2:border-black prose-h2:pl-4 prose-h2:mt-12 prose-code:bg-gray-100 prose-code:text-red-500 prose-pre:bg-gray-900 prose-pre:text-green-400 prose-pre:rounded-lg prose-pre:p-4 prose-p:text-justify font-serif">
                    {children}
                </article>
            </div>

            {/* Footer (Visible in Preview and Print) */}
            <footer className="relative mt-20 w-full p-12 border-t border-gray-200 flex justify-between items-end text-[10px] uppercase tracking-widest text-gray-400 font-mono z-20 print:fixed print:bottom-0 print:left-0 print:border-none print:bg-white/90">
                <div>
                    <p className="font-bold text-black text-xs">CYBER SECURITY</p>
                    <p className="mt-1">TRAINING DIVISION // CONFIDENTIAL</p>
                </div>

                {/* Signature Block */}
                <div className="flex flex-col items-center">
                    <div className="mb-2 relative">
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-auto flex items-center justify-center pointer-events-none select-none">
                            <img src="/assets/images/signature.png" alt="Signature" className="w-full h-auto object-contain opacity-90 rotate-[-2deg]" style={{ mixBlendMode: 'multiply' }} />
                        </div>
                        <div className="w-64 border-b border-black mt-8"></div>
                    </div>
                    <div className="text-center bg-white/50 relative z-10">
                        <p className="font-bold text-black text-xs">DIONE SOUZA LIMA</p>
                        <p className="text-[9px] mt-0.5">CEO // XACK CYBER SECURITY</p>
                        <p className="text-[8px] opacity-60 mt-1">AUTH: XCK-SEC-9921</p>
                    </div>
                </div>

                <div className="text-right">
                    <p>CONFIDENTIAL DOCUMENT</p>
                    <p className="mt-1">PAGE <span className="pageNumber"></span></p>
                </div>
            </footer>
        </div>
    );
};

export default ReportLayout;
