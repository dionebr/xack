import { useTranslation } from '../context/TranslationContext';

export const useLocalizedPath = () => {
    const { language } = useTranslation();

    return (path: string) => {
        // Remove leading slash if present
        const cleanPath = path.startsWith('/') ? path.slice(1) : path;
        return `/${language}/${cleanPath}`;
    };
};
