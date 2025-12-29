import React, { useState } from 'react';
import { useTranslation } from '../context/TranslationContext';

interface PrePostWarningModalProps {
    onAccept: () => void;
    onCancel: () => void;
}

const PrePostWarningModal: React.FC<PrePostWarningModalProps> = ({ onAccept, onCancel }) => {
    const { t } = useTranslation();
    const [agreed, setAgreed] = useState(false);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-bg-card w-full max-w-2xl rounded-2xl border border-accent-purple/30 shadow-2xl p-8 relative">
                <div className="text-center mb-6">
                    <span className="text-6xl mb-4 block">⚠️</span>
                    <h2 className="text-2xl font-display font-bold text-white mb-2">
                        {t('legal.warning.title') || 'Antes de Publicar'}
                    </h2>
                    <p className="text-text-muted text-sm">
                        {t('legal.warning.subtitle') || 'Leia atentamente as diretrizes da comunidade'}
                    </p>
                </div>

                <div className="bg-bg-main border border-white/10 rounded-xl p-6 mb-6 max-h-[400px] overflow-y-auto">
                    <div className="space-y-4 text-sm text-text-muted">
                        <div className="border-l-4 border-accent-purple pl-4">
                            <h3 className="text-white font-bold mb-2">✅ {t('legal.warning.allowed') || 'Conteúdo Permitido'}</h3>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                                <li>Tecnologia, Cibersegurança, Pentest</li>
                                <li>CTF Write-ups e Análises Técnicas</li>
                                <li>Programação e Infraestrutura</li>
                                <li>Discussões Construtivas e Respeitosas</li>
                            </ul>
                        </div>

                        <div className="border-l-4 border-red-500 pl-4">
                            <h3 className="text-red-400 font-bold mb-2">❌ {t('legal.warning.forbidden') || 'Conteúdo Proibido'}</h3>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                                <li className="text-red-400">Política, Ideologias, Partidos</li>
                                <li className="text-red-400">Futebol, Esportes, Entretenimento</li>
                                <li className="text-red-400">Discurso de Ódio, Preconceito</li>
                                <li className="text-red-400">Ataques Pessoais, Ofensas</li>
                                <li className="text-red-400">Spam, Autopromoção Abusiva</li>
                            </ul>
                        </div>

                        <div className="bg-accent-purple/10 border border-accent-purple/30 rounded-lg p-4">
                            <p className="text-xs text-white">
                                <strong>⚡ Moderação Automática:</strong> Conteúdos que violem estas diretrizes serão automaticamente removidos e sua conta poderá ser suspensa.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                            className="mt-1 w-5 h-5 rounded border-2 border-white/20 bg-transparent checked:bg-accent-purple checked:border-accent-purple cursor-pointer"
                        />
                        <span className="text-sm text-text-muted group-hover:text-white transition-colors">
                            {t('legal.warning.agreement') || 'Li e concordo com as Diretrizes da Comunidade e Termos de Uso. Entendo que conteúdo fora do escopo técnico será removido.'}
                        </span>
                    </label>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all"
                    >
                        {t('actions.cancel') || 'Cancelar'}
                    </button>
                    <button
                        onClick={onAccept}
                        disabled={!agreed}
                        className="flex-1 py-3 bg-accent-purple hover:bg-accent-purple/90 text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t('actions.continue') || 'Continuar'}
                    </button>
                </div>

                <div className="mt-4 text-center">
                    <a href="/guidelines" className="text-xs text-accent-purple hover:underline">
                        {t('legal.warning.read_full') || 'Ler Diretrizes Completas'}
                    </a>
                </div>
            </div>
        </div>
    );
};

export default PrePostWarningModal;
