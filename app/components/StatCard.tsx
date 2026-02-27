import { LucideIcon } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { AnimatedCounter } from "./AnimatedCounter";

interface StatProps {
    label: string;
    value: string | number;
    icon?: LucideIcon;
    iconImage?: string;
    color: string;
}

import { Variants } from "framer-motion";

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export function StatCard({ label, value, icon: Icon, iconImage, color }: StatProps) {
    // Parsing color to get text variant (simple hack for now)
    const textColor = color.replace('bg-', 'text-');
    const isNum = typeof value === 'number' || !isNaN(Number(value));

    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            className="relative bg-white/95 backdrop-blur-md p-6 rounded-2xl border border-gray-100 flex items-center justify-between transition-all group overflow-hidden"
            style={{ boxShadow: 'var(--card-box-shadow, 0 4px 6px -1px rgba(0, 0, 0, 0.05))' }}
            onMouseOver={(e) => { e.currentTarget.style.boxShadow = '0 10px 30px var(--theme-sidebar-glow)' }}
            onMouseOut={(e) => { e.currentTarget.style.boxShadow = 'var(--card-box-shadow, 0 4px 6px -1px rgba(0, 0, 0, 0.05))' }}
        >
            {/* Subtle glow loop on the card via CSS logic or motion if needed, here simple CSS for performance */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shimmer-sweep pointer-events-none" />

            <div className="relative z-10">
                <p className="text-sm text-gray-500 font-medium mb-1 uppercase tracking-wider">{label}</p>
                <h3 className="text-3xl font-bold text-gray-800 transition-colors" style={{ color: "var(--theme-primary)" }}>
                    {isNum ? <AnimatedCounter value={Number(value)} /> : value}
                </h3>
            </div>

            <div className="relative z-10">
                {iconImage ? (
                    <div className="w-14 h-14 relative shrink-0">
                        <Image
                            src={iconImage}
                            alt={label}
                            fill
                            className="object-contain rounded-xl"
                        />
                    </div>
                ) : (
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${color} bg-opacity-10 shadow-[0_0_15px_rgba(0,0,0,0.05)] relative`}>
                        {/* Glow loop behind icon */}
                        <div className={`absolute inset-0 rounded-xl ${color} bg-opacity-20 animate-pulse`} />
                        {Icon && <Icon className={`w-7 h-7 ${textColor} relative z-10`} />}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
