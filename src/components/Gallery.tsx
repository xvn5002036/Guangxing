import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { PlayCircle, X, ChevronLeft, ChevronRight, Youtube } from 'lucide-react';
import { GalleryItem } from '../types';

const Gallery: React.FC = () => {
    const { gallery, galleryAlbums } = useData();
    const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
    const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);

    // Helper to extract YouTube ID
    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    // Close modal on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setSelectedItem(null);
            if (selectedItem) {
                if (e.key === 'ArrowLeft') handlePrev(e as any);
                if (e.key === 'ArrowRight') handleNext(e as any);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedItem, gallery]);

    // Filter items based on view mode
    const filteredGallery = selectedAlbumId
        ? gallery.filter(item => item.albumId === selectedAlbumId)
        : [];

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!selectedItem) return;
        const currentIndex = filteredGallery.findIndex(item => item.id === selectedItem.id);
        const prevIndex = (currentIndex - 1 + filteredGallery.length) % filteredGallery.length;
        setSelectedItem(filteredGallery[prevIndex]);
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!selectedItem) return;
        const currentIndex = filteredGallery.findIndex(item => item.id === selectedItem.id);
        const nextIndex = (currentIndex + 1) % filteredGallery.length;
        setSelectedItem(filteredGallery[nextIndex]);
    };

    return (
        <section id="gallery" className="py-24 bg-mystic-charcoal">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <span className="text-mystic-gold text-xs tracking-[0.3em] uppercase block mb-2">Gallery</span>
                    <h2 className="text-3xl font-bold text-white">活動花絮</h2>
                    {selectedAlbumId && (
                        <button
                            onClick={() => setSelectedAlbumId(null)}
                            className="mt-4 text-gray-400 hover:text-white flex items-center justify-center gap-2 mx-auto transition-colors"
                        >
                            <ChevronLeft size={16} /> 返回相簿列表
                        </button>
                    )}
                </div>

                {/* ALBUM LIST VIEW */}
                {!selectedAlbumId && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {galleryAlbums.length > 0 ? (
                            galleryAlbums.map((album) => (
                                <div
                                    key={album.id}
                                    onClick={() => setSelectedAlbumId(album.id)}
                                    className="group cursor-pointer"
                                >
                                    <div className="aspect-[4/3] overflow-hidden rounded-sm border border-white/5 bg-black relative mb-4">
                                        <img
                                            src={album.coverImageUrl || 'https://images.unsplash.com/photo-1592388796690-3482d8d8091e?q=80&w=1000&auto=format&fit=crop'}
                                            alt={album.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                                        />
                                        <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-300"></div>
                                    </div>
                                    <h3 className="text-xl font-bold text-white group-hover:text-mystic-gold transition-colors text-center">{album.title}</h3>
                                    <p className="text-gray-500 text-sm text-center mt-1 line-clamp-2">{album.description}</p>
                                    <div className="text-xs text-gray-600 text-center mt-2 uppercase tracking-widest group-hover:text-gray-400 transition-colors">
                                        查看相簿
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center text-gray-500 py-12 border border-white/10 border-dashed rounded">
                                暫無相簿資料
                            </div>
                        )}
                    </div>
                )}

                {/* PHOTO GRID VIEW (Inside Album) */}
                {selectedAlbumId && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
                        {filteredGallery.length > 0 ? (
                            filteredGallery.map((item) => {
                                const isYoutube = item.type === 'YOUTUBE';
                                const youtubeId = isYoutube ? getYouTubeId(item.url) : null;
                                const thumbnailUrl = isYoutube && youtubeId
                                    ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
                                    : item.url;

                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedItem(item)}
                                        className="group relative aspect-[4/3] overflow-hidden rounded-sm cursor-pointer border border-white/5 bg-black"
                                    >
                                        {item.type === 'VIDEO' ? (
                                            <video
                                                src={item.url}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                                                muted
                                                loop
                                                playsInline
                                                onMouseOver={e => e.currentTarget.play()}
                                                onMouseOut={e => e.currentTarget.pause()}
                                            />
                                        ) : (
                                            <img
                                                src={thumbnailUrl}
                                                alt={item.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                                            />
                                        )}

                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-10">
                                            <span className="text-white font-bold tracking-widest text-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                                {item.title}
                                            </span>
                                        </div>

                                        {/* Center Icon Overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            {item.type === 'VIDEO' && (
                                                <div className="w-12 h-12 rounded-full bg-black/50 border border-white/20 flex items-center justify-center group-hover:bg-mystic-gold/80 transition-colors">
                                                    <PlayCircle className="text-white group-hover:text-black" size={24} />
                                                </div>
                                            )}
                                            {item.type === 'YOUTUBE' && (
                                                <div className="w-12 h-12 rounded-full bg-red-600/80 border border-white/20 flex items-center justify-center group-hover:bg-red-600 transition-colors">
                                                    <Youtube className="text-white" size={24} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-full text-center text-gray-500 py-12 border border-white/10 border-dashed rounded">
                                本相簿暫無照片
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Lightbox Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedItem(null)}>
                    <button
                        className="absolute top-6 right-6 text-gray-400 hover:text-white hover:rotate-90 transition-all duration-300 z-50 p-2"
                        onClick={() => setSelectedItem(null)}
                    >
                        <X size={40} />
                    </button>

                    {/* Navigation Buttons */}
                    {filteredGallery.length > 1 && (
                        <>
                            <button
                                className="absolute left-4 md:left-10 text-gray-400 hover:text-white hover:bg-white/10 p-4 rounded-full transition-all z-50 group"
                                onClick={handlePrev}
                            >
                                <ChevronLeft size={48} className="group-hover:-translate-x-1 transition-transform" />
                            </button>
                            <button
                                className="absolute right-4 md:right-10 text-gray-400 hover:text-white hover:bg-white/10 p-4 rounded-full transition-all z-50 group"
                                onClick={handleNext}
                            >
                                <ChevronRight size={48} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </>
                    )}

                    <div className="relative max-w-7xl w-full max-h-[90vh] flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
                        <div className="relative w-full flex justify-center items-center" style={{ height: '80vh' }}>
                            {selectedItem.type === 'VIDEO' ? (
                                <video
                                    src={selectedItem.url}
                                    controls
                                    autoPlay
                                    className="max-w-full max-h-full object-contain shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 rounded-sm"
                                />
                            ) : selectedItem.type === 'YOUTUBE' ? (
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${getYouTubeId(selectedItem.url)}?autoplay=1&rel=0`}
                                    title="YouTube video player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="w-full h-full max-w-5xl aspect-video shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 rounded-sm"
                                ></iframe>
                            ) : (
                                <img
                                    src={selectedItem.url}
                                    alt={selectedItem.title}
                                    className="max-w-full max-h-full object-contain shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 rounded-sm"
                                />
                            )}
                        </div>

                        <div className="mt-6 text-center animate-fade-in-up">
                            <h3 className="text-2xl font-bold text-white tracking-widest mb-2 font-serif">{selectedItem.title}</h3>
                            <div className="flex items-center justify-center gap-2 text-xs text-mystic-gold uppercase tracking-[0.2em]">
                                <span className="w-8 h-[1px] bg-mystic-gold/50"></span>
                                {selectedItem.type === 'VIDEO' ? 'Video' : selectedItem.type === 'YOUTUBE' ? 'YouTube' : 'Image'} Gallery
                                <span className="w-8 h-[1px] bg-mystic-gold/50"></span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Gallery;