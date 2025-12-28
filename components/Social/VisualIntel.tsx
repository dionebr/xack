import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';

interface Album {
    id: string;
    title: string;
    description: string;
    created_at: string;
    cover_url?: string; // Derived from first photo
    photo_count?: number;
}

interface Photo {
    id: string;
    url: string;
    caption: string;
    created_at: string;
}

interface VisualIntelProps {
    userId: string;
    isOwner: boolean;
}

const VisualIntel: React.FC<VisualIntelProps> = ({ userId, isOwner }) => {
    const [albums, setAlbums] = useState<Album[]>([]);
    const [activeAlbum, setActiveAlbum] = useState<Album | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Lightbox State
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    // Create Album Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newAlbumTitle, setNewAlbumTitle] = useState('');

    useEffect(() => {
        loadAlbums();
    }, [userId]);

    useEffect(() => {
        if (activeAlbum) {
            loadPhotos(activeAlbum.id);
        }
    }, [activeAlbum]);

    const loadAlbums = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('user_albums')
                .select('*, user_photos(url, id)')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const formattedAlbums = data.map((album: any) => ({
                ...album,
                cover_url: album.user_photos?.[0]?.url || null,
                photo_count: album.user_photos?.length || 0
            }));

            setAlbums(formattedAlbums);
        } catch (error) {
            console.error('Error loading albums:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadPhotos = async (albumId: string) => {
        const { data, error } = await supabase
            .from('user_photos')
            .select('*')
            .eq('album_id', albumId)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setPhotos(data);
        }
    };

    const handleCreateAlbum = async () => {
        if (!newAlbumTitle.trim() || !isOwner) return;

        const { error } = await supabase.from('user_albums').insert({
            user_id: userId,
            title: newAlbumTitle,
            description: 'Classified visual intelligence.'
        });

        if (error) toast.error('Failed to create album');
        else {
            toast.success('Album initialized');
            setNewAlbumTitle('');
            setShowCreateModal(false);
            loadAlbums();
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !activeAlbum || !isOwner) return;
        setUploading(true);

        const files = Array.from(e.target.files);
        let successCount = 0;

        for (const file of files) {
            try {
                const fileExt = file.name.split('.').pop();
                const fileName = `${userId}/${activeAlbum.id}/${Math.random()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('profile-gallery')
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('profile-gallery')
                    .getPublicUrl(fileName);

                await supabase.from('user_photos').insert({
                    album_id: activeAlbum.id,
                    url: publicUrl,
                    caption: file.name
                });
                successCount++;
            } catch (err) {
                console.error(err);
            }
        }

        toast.success(`Uploaded ${successCount}/${files.length} intel assets.`);
        loadPhotos(activeAlbum.id);
        setUploading(false);
    };

    // Lightbox Controls
    const nextPhoto = useCallback(() => {
        if (lightboxIndex === null) return;
        setLightboxIndex((prev) => (prev! + 1) % photos.length);
    }, [lightboxIndex, photos.length]);

    const prevPhoto = useCallback(() => {
        if (lightboxIndex === null) return;
        setLightboxIndex((prev) => (prev! - 1 + photos.length) % photos.length);
    }, [lightboxIndex, photos.length]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 min-h-[400px]">
            {/* Header */}
            <div className="bg-bg-card rounded-[2.5rem] border border-white/5 p-8 shadow-card flex justify-between items-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

                <div className="relative z-10">
                    <h3 className="text-xl font-display font-black text-white uppercase italic tracking-tighter">
                        {activeAlbum ? (
                            <button onClick={() => setActiveAlbum(null)} className="hover:text-accent-purple transition-colors flex items-center gap-2">
                                <span className="material-symbols-outlined">arrow_back</span>
                                {activeAlbum.title}
                            </button>
                        ) : 'Visual Intelligence'}
                    </h3>
                    <p className="text-[10px] text-text-muted uppercase tracking-widest mt-1">
                        {activeAlbum ? `${photos.length} Assets Found` : `${albums.length} Secure Folders`}
                    </p>
                </div>

                {isOwner && (
                    <div className="relative z-10">
                        {activeAlbum ? (
                            <label className="cursor-pointer px-6 py-2 bg-accent-purple text-white rounded-lg font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-colors shadow-glow flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">upload</span>
                                Upload Intel
                                <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                            </label>
                        ) : (
                            <button onClick={() => setShowCreateModal(true)} className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-black text-[10px] uppercase tracking-widest transition-colors flex items-center gap-2 border border-white/10">
                                <span className="material-symbols-outlined text-sm">create_new_folder</span>
                                New Dossier
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Content Area */}
            {activeAlbum ? (
                // PHOTOS GRID
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photos.map((photo, idx) => (
                        <div
                            key={photo.id}
                            onClick={() => setLightboxIndex(idx)}
                            className="group relative aspect-square bg-black rounded-xl overflow-hidden cursor-pointer border border-white/5 hover:border-accent-purple/50 transition-all"
                        >
                            <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                <p className="text-[9px] text-white font-mono uppercase truncate w-full">{photo.caption}</p>
                            </div>

                            {/* Cyber Overlay Effect */}
                            <div className="absolute top-2 right-2 w-2 h-2 bg-accent-purple rounded-full opacity-0 group-hover:opacity-100 shadow-[0_0_10px_#b946e9]"></div>
                        </div>
                    ))}
                    {uploading && (
                        <div className="aspect-square bg-white/5 rounded-xl border border-white/10 border-dashed flex items-center justify-center animate-pulse">
                            <span className="text-xs font-bold text-white/50 uppercase">Uploading...</span>
                        </div>
                    )}
                </div>
            ) : (
                // ALBUMS GRID
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {albums.map((album) => (
                        <div
                            key={album.id}
                            onClick={() => setActiveAlbum(album)}
                            className="group bg-[#161718] rounded-2xl p-4 border border-white/5 hover:border-white/20 transition-all cursor-pointer relative overflow-hidden h-64 flex flex-col"
                        >
                            {/* Folder Tab Effect */}
                            <div className="absolute top-0 right-0 p-4 opacity-10 font-[1000] text-6xl text-white group-hover:opacity-20 transition-opacity select-none">
                                {album.title.charAt(0)}
                            </div>

                            <div className="flex-1 rounded-xl bg-black/50 overflow-hidden relative mb-4 border border-white/5">
                                {album.cover_url ? (
                                    <img src={album.cover_url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white/10">
                                        <span className="material-symbols-outlined text-4xl">folder_off</span>
                                    </div>
                                )}
                                {/* Scanline overlay */}
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_4px,3px_100%]"></div>
                            </div>

                            <div className="flex justify-between items-end">
                                <div>
                                    <h4 className="text-white font-bold uppercase tracking-wide group-hover:text-accent-purple transition-colors truncate max-w-[200px]">{album.title}</h4>
                                    <p className="text-[10px] text-text-muted font-mono">{album.photo_count} FILES • ENCRYPTED</p>
                                </div>
                                <span className="material-symbols-outlined text-white/20 group-hover:text-white transition-colors">folder_open</span>
                            </div>
                        </div>
                    ))}
                    {albums.length === 0 && !loading && (
                        <div className="col-span-full border border-dashed border-white/10 rounded-2xl p-10 text-center text-text-muted uppercase text-xs tracking-widest">
                            No Intelligence Dossiers Found.
                        </div>
                    )}
                </div>
            )}

            {/* CREATE ALBUM MODAL */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-bg-card border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="p-4 border-b border-white/5 flex justify-between items-center">
                            <h3 className="font-display font-bold text-white uppercase italic">Initialize Dossier</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-white/50 hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Designation</label>
                                <input
                                    type="text"
                                    value={newAlbumTitle}
                                    onChange={(e) => setNewAlbumTitle(e.target.value)}
                                    placeholder="e.g. OPERATIONS-ALPHA"
                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white text-sm font-mono focus:outline-none focus:border-accent-purple/50"
                                    autoFocus
                                />
                            </div>
                            <button
                                onClick={handleCreateAlbum}
                                className="w-full py-3 bg-accent-purple text-white rounded-xl font-bold uppercase tracking-wider text-xs shadow-glow hover:brightness-110 transition-all"
                            >
                                Create Secure Folder
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* LIGHTBOX LAYOVER */}
            {lightboxIndex !== null && photos[lightboxIndex] && (
                <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-10">
                    <button onClick={() => setLightboxIndex(null)} className="absolute top-10 right-10 text-white/50 hover:text-white z-50">
                        <span className="material-symbols-outlined text-4xl">close</span>
                    </button>

                    <div className="relative w-full max-w-5xl h-full flex items-center justify-center">
                        <img
                            src={photos[lightboxIndex].url}
                            className="max-h-full max-w-full object-contain shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10"
                        />

                        {/* HUD Elements */}
                        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur px-4 py-2 border border-white/10 rounded font-mono text-xs text-green-500">
                            IMG_{photos[lightboxIndex].id.split('-')[0].toUpperCase()} :: {photos[lightboxIndex].caption}
                        </div>
                        <div className="absolute bottom-4 right-4 text-white/30 font-mono text-[10px] uppercase tracking-[0.3em]">
                            CONFIDENTIAL // EYES ONLY
                        </div>
                    </div>

                    <button onClick={prevPhoto} className="absolute left-10 p-4 text-white/30 hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-5xl">chevron_left</span>
                    </button>
                    <button onClick={nextPhoto} className="absolute right-10 p-4 text-white/30 hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-5xl">chevron_right</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default VisualIntel;
