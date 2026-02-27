"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface PageTransitionProps {
    children: ReactNode;
}

export const PageTransition = ({ children }: PageTransitionProps) => {
    const pathname = usePathname();

    const variants = {
        hidden: { opacity: 0, y: 8 },
        enter: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                initial="hidden"
                animate="enter"
                exit="exit"
                variants={variants}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full h-full flex flex-col flex-1"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};
