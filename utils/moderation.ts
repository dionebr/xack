// Blocked tags and content moderation utilities

export const BLOCKED_TAGS = [
    // Politics
    'política', 'politics', 'político', 'political', 'partido', 'party', 'eleição', 'election',
    'bolsonaro', 'lula', 'pt', 'psdb', 'esquerda', 'direita', 'left', 'right',

    // Sports
    'futebol', 'football', 'soccer', 'flamengo', 'corinthians', 'palmeiras', 'são paulo',
    'vasco', 'grêmio', 'internacional', 'santos', 'copa', 'world cup', 'champions',

    // General entertainment
    'bbb', 'big brother', 'novela', 'soap opera', 'reality show'
];

export const BLOCKED_KEYWORDS_REGEX = new RegExp(
    BLOCKED_TAGS.map(tag => `\\b${tag}\\b`).join('|'),
    'gi'
);

export interface ModerationResult {
    isBlocked: boolean;
    reason?: string;
    blockedTerms?: string[];
}

export const moderateContent = (content: string, title?: string): ModerationResult => {
    const textToCheck = `${title || ''} ${content}`.toLowerCase();
    const matches = textToCheck.match(BLOCKED_KEYWORDS_REGEX);

    if (matches && matches.length > 0) {
        const uniqueTerms = [...new Set(matches)];
        return {
            isBlocked: true,
            reason: 'Content contains blocked keywords related to politics, sports, or off-topic subjects.',
            blockedTerms: uniqueTerms
        };
    }

    return { isBlocked: false };
};

export const getRemovalMessage = (lang: 'en' | 'pt', blockedTerms?: string[]): string => {
    if (lang === 'pt') {
        return `🚫 **Conteúdo Removido Automaticamente**\n\nEste conteúdo foi removido por violar as Diretrizes da Comunidade XACK.\n\n**Motivo:** Conteúdo fora do escopo técnico da plataforma${blockedTerms ? `\n**Termos detectados:** ${blockedTerms.join(', ')}` : ''}\n\n**Lembre-se:** A XACK é focada exclusivamente em Tecnologia, Cibersegurança e áreas técnicas correlatas.\n\n📖 [Leia as Diretrizes Completas](/guidelines)`;
    }

    return `🚫 **Content Automatically Removed**\n\nThis content was removed for violating XACK Community Guidelines.\n\n**Reason:** Content outside the technical scope of the platform${blockedTerms ? `\n**Detected terms:** ${blockedTerms.join(', ')}` : ''}\n\n**Remember:** XACK is exclusively focused on Technology, Cybersecurity, and related technical areas.\n\n📖 [Read Full Guidelines](/guidelines)`;
};
