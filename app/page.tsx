import { IQMLogoFull } from "./components/Logo";
import { LoginForm } from "./components/LoginForm";
import { CyberBackground } from "./components/CyberBackground";
import Image from "next/image";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#050505]">

      {/* 1. Animated Background Layer */}
      <CyberBackground />

      {/* 2. Login Content Layer */}
      <div className="relative z-10 w-full flex flex-col items-center p-4 animate-in fade-in zoom-in-95 duration-1000">

        {/* Brand Header */}
        <div className="flex flex-col items-center mb-10 space-y-6">
          {/* Logo Container with glass effect */}
          <div className="bg-[#111928]/40 p-4 rounded-3xl shadow-[0_0_30px_rgba(139,92,246,0.15)] ring-1 ring-white/10 backdrop-blur-xl transition-transform hover:scale-105 duration-500">
            <Image src="/logo_new.jpg" alt="IQM Logo" width={56} height={56} className="rounded-xl object-contain" />
          </div>

          <div className="text-center space-y-1.5">
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]">
              Employee Management System IQM
            </h1>
            <p className="text-[#a78bfa] font-medium text-sm lg:text-base tracking-widest uppercase">
              Manage Task Intelligently
            </p>
          </div>
        </div>

        {/* Login Form */}
        <div className="w-full max-w-[420px]">
          <LoginForm />
        </div>

      </div>
    </div>
  );
}
