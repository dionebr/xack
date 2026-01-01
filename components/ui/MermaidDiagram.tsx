import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
    chart: string;
}

mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: 'Inter, sans-serif',
});

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [svg, setSvg] = useState('');

    useEffect(() => {
        mermaid.initialize({
            startOnLoad: false,
            theme: 'dark',
            securityLevel: 'loose',
            fontFamily: 'Orbitron, sans-serif',
        });

        const renderChart = async () => {
            if (ref.current) {
                try {
                    // Generate unique ID
                    const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
                    // Clear previous content
                    setSvg('');

                    const { svg } = await mermaid.render(id, chart);
                    setSvg(svg);
                } catch (error) {
                    console.error('Failed to render mermaid chart:', error);
                    setSvg('<div class="text-red-500 text-xs p-4">Error Rendering Diagram</div>');
                }
            }
        };

        renderChart();
    }, [chart]);

    return (
        <div
            ref={ref}
            className="mermaid-wrapper flex justify-center items-center p-8 bg-[#0F0F0F] rounded-xl border border-white/5 my-8 overflow-x-auto min-h-[150px]"
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
};
