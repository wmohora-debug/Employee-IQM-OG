"use client";

import { AuthProvider } from "./context/AuthContext";
import { SoundProvider } from "./context/SoundContext";
import { GlobalSoundListener } from "./context/GlobalSoundListener";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <SoundProvider>
                <GlobalSoundListener />
                {children}
            </SoundProvider>
        </AuthProvider>
    );
}
