"use client";

import React, { useState, useRef, useEffect } from "react";

interface ImageCropperProps {
    imageSrc: string; // The selected file as a data URL
    onCancel: () => void;
    onCropComplete: (croppedBlob: Blob) => void;
    aspectRatio?: number; // default 1 (square)
}

export default function ImageCropper({
    imageSrc,
    onCancel,
    onCropComplete,
    aspectRatio = 1,
}: ImageCropperProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [startPan, setStartPan] = useState({ x: 0, y: 0 });
    const imgRef = useRef<HTMLImageElement | null>(null);

    // Load image
    useEffect(() => {
        const img = new Image();
        img.src = imageSrc;
        img.onload = () => {
            imgRef.current = img;
            renderCanvas();
        };
    }, [imageSrc]);

    // Render loop
    useEffect(() => {
        renderCanvas();
    }, [offset, zoom, aspectRatio]);

    const renderCanvas = () => {
        const canvas = canvasRef.current;
        const img = imgRef.current;
        if (!canvas || !img) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas size (fixed viewport size, e.g., 300x300)
        const size = 300;
        canvas.width = size;
        canvas.height = size / aspectRatio;

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw image with transforms
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Calculate dimensions
        const scale = Math.max(
            canvas.width / img.width,
            canvas.height / img.height
        ) * zoom; // Start covering content and multiply by zoom

        const width = img.width * scale;
        const height = img.height * scale;

        ctx.save();
        // Move to center + offset
        ctx.translate(centerX + offset.x, centerY + offset.y);
        // Draw centered
        ctx.drawImage(img, -width / 2, -height / 2, width, height);
        ctx.restore();
    };

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        setIsDragging(true);
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        setStartPan({ x: clientX - offset.x, y: clientY - offset.y });
    };

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging) return;
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        setOffset({
            x: clientX - startPan.x,
            y: clientY - startPan.y,
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleSave = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.toBlob((blob) => {
            if (blob) onCropComplete(blob);
        }, "image/jpeg", 0.9);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1e1e24] rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-white/10 animate-scaleIn">
                <h3 className="text-lg font-semibold text-white mb-4 text-center">Adjust Photo</h3>

                <div
                    className="relative overflow-hidden rounded-xl bg-black border border-white/10 mx-auto cursor-move touch-none"
                    style={{ width: 300, height: 300 / aspectRatio }}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onTouchMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchEnd={handleMouseUp}
                >
                    <canvas ref={canvasRef} className="block pointer-events-none" />

                    {/* Grid Overlay for precision feel */}
                    <div className="absolute inset-0 pointer-events-none opacity-30">
                        <div className="absolute top-1/3 w-full h-px bg-white"></div>
                        <div className="absolute top-2/3 w-full h-px bg-white"></div>
                        <div className="absolute left-1/3 h-full w-px bg-white"></div>
                        <div className="absolute left-2/3 h-full w-px bg-white"></div>
                    </div>
                </div>

                <div className="mt-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-white/50">Zoom</span>
                        <input
                            type="range"
                            min="1"
                            max="3"
                            step="0.01"
                            value={zoom}
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            className="flex-1 accent-purple-500 h-1 bg-white/20 rounded-full appearance-none"
                        />
                    </div>

                    <p className="text-xs text-center text-white/40">
                        Drag to move • Pinch/Slider to zoom
                    </p>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors font-medium text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all font-medium text-sm"
                        >
                            Save Photo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
