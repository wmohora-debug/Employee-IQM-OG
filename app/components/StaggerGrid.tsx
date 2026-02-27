"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StaggerGridProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    stagger?: number;
}

export const StaggerGrid = ({ children, className = "", delay = 0.1, stagger = 0.08 }: StaggerGridProps) => {
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: stagger,
                delayChildren: delay,
            }
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className={className}
        >
            {children}
        </motion.div>
    );
};
