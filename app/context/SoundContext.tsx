"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";

type SoundType = 'click' | 'success' | 'reject' | 'pop' | 'ping';

interface SoundContextType {
    isMuted: boolean;
    toggleMute: () => void;
    playSound: (type: SoundType) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isMuted, setIsMuted] = useState(false);

    // Store audio elements to avoid recreation
    const soundsRef = useRef<Record<SoundType, HTMLAudioElement | null>>({
        click: null,
        success: null,
        reject: null,
        pop: null,
        ping: null,
    });

    // Debounce tracking
    const lastPlayedRef = useRef<Record<SoundType, number>>({
        click: 0,
        success: 0,
        reject: 0,
        pop: 0,
        ping: 0,
    });

    // Initialize state from local storage and preload sounds
    useEffect(() => {
        // Load mute state safely
        try {
            const savedState = localStorage.getItem("iqm_sound_muted");
            if (savedState) {
                setIsMuted(savedState === "true");
            }
        } catch (e) {
            console.error("Failed to access localStorage for sound state", e);
        }

        // Preload sounds
        const createAudio = (src: string) => {
            if (typeof window === 'undefined') return null;
            try {
                const audio = new Audio(src);
                audio.volume = 0.15; // Capped at 0.15
                // audio.preload = 'auto'; // By default new Audio() preloads but strictly setting might help
                return audio;
            } catch (e) {
                console.error("Failed to create audio element", e);
                return null;
            }
        };

        soundsRef.current = {
            click: createAudio('/sounds/click.wav'),
            success: createAudio('/sounds/success.wav'),
            reject: createAudio('/sounds/reject.wav'),
            pop: createAudio('/sounds/pop.wav'),
            ping: createAudio('/sounds/ping.wav'),
        };
    }, []);

    const toggleMute = useCallback(() => {
        setIsMuted((prev) => {
            const newVal = !prev;
            try {
                localStorage.setItem("iqm_sound_muted", String(newVal));
            } catch (e) {
                console.error("Failed to save mute state", e);
            }
            return newVal;
        });
    }, []);

    const playSound = useCallback((type: SoundType) => {
        if (isMuted) return;

        const now = Date.now();
        // Debounce map
        const debounceTimes: Record<SoundType, number> = {
            click: 120,    // 120ms for clicks
            success: 300,
            reject: 400,
            pop: 150,
            ping: 400
        };

        if (now - lastPlayedRef.current[type] < debounceTimes[type]) {
            return; // Debounced
        }

        const audio = soundsRef.current[type];
        if (audio) {
            lastPlayedRef.current[type] = now;
            try {
                audio.currentTime = 0; // Rewind to start
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        // Suppress autoplay policy warnings or abort errors quietly to prevent UI break
                        // console.debug("Audio playback failed or prevented by browser policy", error);
                    });
                }
            } catch (error) {
                // Ignore failure
            }
        }
    }, [isMuted]);

    return (
        <SoundContext.Provider value={{ isMuted, toggleMute, playSound }}>
            {children}
        </SoundContext.Provider>
    );
};

export const useSound = () => {
    const context = useContext(SoundContext);
    if (context === undefined) {
        throw new Error("useSound must be used within a SoundProvider");
    }
    return context;
};
