"use client";

import { useEffect, useRef } from "react";
import { useSound } from "./SoundContext";

export function GlobalSoundListener() {
    const { playSound, isMuted } = useSound();
    const lastToastRef = useRef<number>(0);

    useEffect(() => {
        if (isMuted) return;

        // 1. Handle Clicks
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Only trigger on interactive elements
            if (target.closest("button") || target.closest("a") || target.closest('input[type="submit"], input[type="button"]') || target.closest('[role="button"]') || target.closest('[role="tab"]') || target.closest('.cursor-pointer')) {
                playSound("click");
            }
        };

        document.addEventListener("click", handleClick, true);

        // 2. Observe DOM mutations for Modals and Toasts
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === "childList") {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const el = node as HTMLElement;
                            const elClass = el.className || "";

                            // Modal detection: typically a fixed overlay with z-index (e.g. z-50, z-[60])
                            if (typeof elClass === 'string' && (elClass.includes("fixed inset-0") && (elClass.includes("z-50") || elClass.includes("z-[50]") || elClass.includes("z-[60]") || elClass.includes("bg-black/50")))) {
                                playSound("pop");
                            }

                            // Modal content pop inside framer
                            if (typeof elClass === 'string' && elClass.includes("bg-white rounded-2xl w-full max-w-")) {
                                playSound("pop");
                            }

                            // Toast detection: react-hot-toast adds elements with specific classes or inline styles
                            // Checking if it matches typical toast wrapper or text
                            if (typeof elClass === 'string' && (elClass.includes("go3958317564") || elClass.includes("go2072408551") || el.querySelector('[role="status"]'))) {
                                const now = Date.now();
                                if (now - lastToastRef.current > 1000) {
                                    playSound("ping");
                                    lastToastRef.current = now;
                                }
                            }
                        }
                    });
                }
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            document.removeEventListener("click", handleClick, true);
            observer.disconnect();
        };
    }, [playSound, isMuted]);

    return null;
}
