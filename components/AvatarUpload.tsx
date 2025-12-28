import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/canvasUtils';
import { useCallback } from 'react';

interface AvatarUploadProps {
    uid: string;
    url: string | null;
    size: number;
    onUpload: (publicUrl: string) => void;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ uid, url, size, onUpload }) => {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    // Crop State
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    useEffect(() => {
        if (url) setAvatarUrl(url);
    }, [url]);

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const imageDataUrl = await readFile(file);
            setImageSrc(imageDataUrl as string);
        }
    };

    const readFile = (file: File) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.addEventListener('load', () => resolve(reader.result), false);
            reader.readAsDataURL(file);
        });
    };

    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const uploadCroppedImage = async () => {
        try {
            setUploading(true);
            if (!imageSrc || !croppedAreaPixels) return;

            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            if (!croppedBlob) throw new Error('Failed to crop image');

            const fileExt = 'png'; // canvasUtils exports as png
            const fileName = `${uid}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, croppedBlob);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

            onUpload(data.publicUrl);
            setAvatarUrl(data.publicUrl);

            // Cleanup
            setImageSrc(null);
            setZoom(1);
        } catch (error: any) {
            toast.error('Error uploading avatar: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <>
            <div className="relative group cursor-pointer" style={{ width: size, height: size }}>
                <label className="cursor-pointer block w-full h-full">
                    <div className={`w-full h-full rounded-full overflow-hidden border-4 border-bg-card shadow-glow relative transition-all ${uploading ? 'opacity-50' : 'group-hover:border-accent-purple'}`}>
                        {/* Background Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#1c2f2d] to-[#2d6078] z-0"></div>

                        {/* Image */}
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt="Avatar"
                                className="w-full h-full object-cover relative z-10"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center relative z-10">
                                <span className="material-symbols-outlined text-4xl text-white/50">person</span>
                            </div>
                        )}

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 backdrop-blur-sm">
                            <span className="material-symbols-outlined text-white text-3xl mb-1">upload</span>
                            <span className="text-[8px] font-black uppercase text-white tracking-widest leading-tight">Change</span>
                        </div>

                        {/* Loading Spinner */}
                        {uploading && (
                            <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-30">
                                <div className="w-8 h-8 border-2 border-accent-purple border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={onFileChange}
                        disabled={uploading}
                    />
                </label>
            </div>

            {/* Crop Modal */}
            {imageSrc && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-bg-card border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="p-4 border-b border-white/5 flex justify-between items-center">
                            <h3 className="font-display font-bold text-white uppercase italic">Adjust Photo</h3>
                            <button onClick={() => setImageSrc(null)} className="text-white/50 hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="relative h-[300px] w-full bg-black">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                                cropShape="round"
                                showGrid={false}
                                objectFit="cover"
                                restrictPosition={false}
                                minZoom={0.5}
                            />
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-bold uppercase text-text-muted">
                                    <span>Zoom</span>
                                    <span>{Math.round(zoom * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={0.5}
                                    max={3}
                                    step={0.1}
                                    aria-labelledby="Zoom"
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        setZoom(Number(e.target.value));
                                    }}
                                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-purple"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setImageSrc(null)}
                                    className="flex-1 py-3 rounded-xl border border-white/10 text-xs font-bold uppercase tracking-wider text-text-muted hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={uploadCroppedImage}
                                    disabled={uploading}
                                    className="flex-1 py-3 rounded-xl bg-accent-purple text-xs font-bold uppercase tracking-wider text-white shadow-glow hover:brightness-110 transition-all flex items-center justify-center gap-2"
                                >
                                    {uploading ? (
                                        <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-sm">check</span>
                                            Confirm
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AvatarUpload;
