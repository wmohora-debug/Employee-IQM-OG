"use client";
import { Toaster, toast } from "react-hot-toast";
import { useEffect } from "react";
import { useSound } from "@/app/context/SoundContext";

export default function ToastProvider() {
    const { playSound } = useSound();

    useEffect(() => {
        const originalAlert = window.alert;
        window.alert = (message?: any) => {
            const msg = String(message || "");
            const lower = msg.toLowerCase();

            if (lower.includes('fail') || lower.includes('error') || lower.includes('invalid') || lower.includes('wrong') || lower.includes('reject')) {
                toast.error(msg);
                playSound("reject");
            } else if (lower.includes('success') || lower.includes('verif') || lower.includes('submit') || lower.includes('complet')) {
                toast.success(msg);
                playSound("success");
            } else {
                toast(msg);
                // "ping" is handled by the dom observer but we could optionally call playSound("ping") here too.
            }
        };

        return () => {
            window.alert = originalAlert;
        };
    }, [playSound]);


    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 4000,
                className: "bg-white/80 backdrop-blur-xl border border-gray-100 shadow-xl rounded-2xl text-sm font-medium text-gray-800",
                style: {
                    background: "rgba(255, 255, 255, 0.9)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(0, 0, 0, 0.05)",
                    padding: "16px",
                    color: "#1f2937",
                },
                success: {
                    iconTheme: {
                        primary: "#10b981",
                        secondary: "#fff",
                    },
                },
                error: {
                    iconTheme: {
                        primary: "#ef4444",
                        secondary: "#fff",
                    },
                },
            }}
        />
    );
}
