import { IQMLogoFull } from "./components/Logo";
import { LoginForm } from "./components/LoginForm";
import { PremiumBackground } from "./components/PremiumBackground";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden">

      {/* 1. Animated Background Layer */}
      <PremiumBackground />

      {/* 2. Login Content Layer */}
      <div className="relative z-10 w-full flex flex-col items-center p-4 animate-in fade-in zoom-in-95 duration-700">

        {/* Brand Header */}
        <div className="flex flex-col items-center mb-10 space-y-6">
          {/* Logo Container with glass effect */}
          <div className="bg-white/80 p-4 rounded-3xl shadow-lg ring-1 ring-black/5 backdrop-blur-xl transition-transform hover:scale-105 duration-500">
            <IQMLogoFull className="w-12 h-12 text-indigo-600" />
          </div>

          <div className="text-center space-y-1.5">
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
              Employee Management System IQM
            </h1>
            <p className="text-gray-500 font-medium text-sm lg:text-base tracking-wide">
              Manage Task Intelligently
            </p>
          </div>
        </div>

        {/* Login Form */}
        <div className="w-full max-w-[400px]">
          <LoginForm />
        </div>

      </div>
    </div>
  );
}
