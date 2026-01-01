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
            <style>{`
                @media print {
                    @page { margin: 0; size: auto; }
                    body { background-color: white !important; background-image: none !important; -webkit-print-color-adjust: exact; }
                    .print-hidden { display: none !important; }
                    /* Hide parent containers if they have dark backgrounds */
                    #root > div { background-color: white !important; }
                    /* Force image visibility */
                    img { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            `}</style>
            {/* GLOBAL HEADER (Repeats on every page via CSS fixed positioning if supported, otherwise just top) */}
            <div className="print-header fixed top-0 left-0 w-full p-4 border-b-2 border-black/10 flex justify-between items-center z-50 bg-white">
                <div className="flex items-center gap-3">
                    <img src="/assets/images/logo_dark.svg" alt="X-ACK" className="h-12 w-auto transition-transform hover:scale-105" />
                    <span className="font-mono text-xs font-bold tracking-[0.2em] uppercase">MISSION REPORT // {machineId}</span>
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
            <div className="h-screen flex flex-col justify-between p-16 bg-white relative overflow-hidden print:break-after-page">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600 rounded-full blur-3xl"></div>
                </div>

                {/* Header */}
                <div className="relative z-10 flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                        <img src="/assets/images/logo_dark.svg" alt="XACK Logo" className="h-12 w-auto" />

                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-600 tracking-widest uppercase">Cyber Security</div>
                        <div className="w-32 h-1 bg-black mt-2"></div>
                    </div>
                </div>

                {/* Main Title */}
                <div className="relative z-10 flex-1 flex flex-col justify-center -mt-20">
                    <div className="text-xs font-bold text-purple-600 tracking-[0.3em] uppercase mb-4">
                        Official Field Report
                    </div>
                    <h1 className="text-8xl font-black uppercase leading-none mb-6 tracking-tighter">
                        {machineName}
                    </h1>
                    <div className="text-2xl text-purple-600 font-light tracking-wide">
                        Mission Walkthrough & Intelligence
                    </div>
                </div>

                {/* Footer Metadata */}
                <div className="relative z-10 grid grid-cols-3 gap-8 pt-8 border-t-2 border-black">
                    <div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Difficulty</div>
                        <div className={`text-sm font-black uppercase ${difficulty === 'hard' ? 'text-red-600' :
                            difficulty === 'medium' ? 'text-yellow-600' :
                                'text-green-600'
                            }`}>
                            {difficulty}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Target ID</div>
                        <div className="text-sm font-mono font-bold">{machineId}</div>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Report Date</div>
                        <div className="text-sm font-bold">{new Date().toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}</div>
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

                {/* SIGNATURE BLOCK - ONLY ON LAST PAGE */}
                <div className="mt-32 pt-16 border-t-2 border-black break-inside-avoid print:block">
                    <div className="flex justify-center">
                        <div className="flex flex-col items-center">
                            <div className="mb-2 relative">
                                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-auto flex items-center justify-center pointer-events-none select-none">
                                    <img src="/assets/images/signature.png" alt="Signature" className="w-full h-auto object-contain opacity-90 rotate-[-2deg] block" style={{ mixBlendMode: 'multiply' }} />
                                </div>
                                <div className="w-64 border-b border-black mt-8"></div>
                            </div>
                            <div className="text-center bg-white/50 relative z-10 mt-4">
                                <p className="font-bold text-black text-xs">DIONE SOUZA LIMA</p>
                                <p className="text-[9px] mt-0.5 text-gray-600">CEO // XACK CYBER SECURITY</p>
                                <p className="text-[8px] opacity-60 mt-1 text-gray-500">AUTH: XCK-SEC-9921</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer (Simple page number only) */}
            <footer className="relative mt-20 w-full p-12 border-t border-gray-200 flex justify-between items-end text-[10px] uppercase tracking-widest text-gray-400 font-mono z-20 print:fixed print:bottom-0 print:left-0 print:border-none print:bg-white/90">
                <div>
                    <p className="font-bold text-black text-xs">CYBER SECURITY</p>
                    <p className="mt-1">TRAINING DIVISION // CONFIDENTIAL</p>
                </div>

                {/* Signature Placeholder in Fixed Footer (Empty) */}
                <div className="flex flex-col items-center print:hidden invisible">
                    {/* Hiding to preserve flex layout if needed, but invisible */}
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
