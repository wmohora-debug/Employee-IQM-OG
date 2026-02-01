"use client";
import { useState } from "react";
import { X } from "lucide-react";

interface ExpandableTextProps {
    text: string;
    previewWords?: number;
    modalTitle?: string;
    className?: string; // for custom styling of the container/text
}

export function ExpandableText({ text, previewWords = 3, modalTitle = "Details", className = "" }: ExpandableTextProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (!text) return null;

    const words = text.split(/\s+/);
    const isLong = words.length > previewWords;

    const previewText = isLong
        ? words.slice(0, previewWords).join(" ") + "..."
        : text;

    return (
        <>
            <div className={`inline-flex flex-wrap items-center gap-1 ${className}`}>
                <span>{previewText}</span>
                {isLong && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}
                        className="text-iqm-primary text-xs font-bold hover:underline whitespace-nowrap inline-block ml-1 cursor-pointer"
                        title="Read full content"
                    >
                        [View All]
                    </button>
                )}
            </div>

            {/* Modal - Portal-like behavior using fixed positioning */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200 text-left"
                    onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                >
                    <div
                        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh] relative animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
                            <h3 className="font-bold text-gray-800 text-lg">{modalTitle}</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 overflow-y-auto overflow-x-hidden">
                            <p className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm md:text-base break-words">
                                {text}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
