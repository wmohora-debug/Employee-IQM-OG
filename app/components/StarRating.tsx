"use client";
import { Star } from "lucide-react";

interface StarRatingProps {
    rating: number; // 0 to 5
    maxRating?: number;
    onRate?: (rating: number) => void;
    readOnly?: boolean;
    size?: number;
}

export function StarRating({ rating, maxRating = 5, onRate, readOnly = false, size = 16 }: StarRatingProps) {
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: maxRating }).map((_, i) => (
                <button
                    key={i}
                    type="button"
                    onClick={() => !readOnly && onRate && onRate(i + 1)}
                    disabled={readOnly}
                    className={`transition-all p-1 ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
                >
                    <Star
                        size={size}
                        fill={i < rating ? "#F59E0B" : "none"}
                        className={i < rating ? "text-amber-500" : "text-gray-300"}
                    />
                </button>
            ))}
        </div>
    );
}
