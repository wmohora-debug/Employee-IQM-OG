import { IQMLogoFull } from "./components/Logo";
import { LoginForm } from "./components/LoginForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[50%] -left-[20%] w-[100%] h-[100%] rounded-full bg-indigo-100/40 blur-[100px]"></div>
        <div className="absolute top-[50%] right-[0%] w-[80%] h-[80%] rounded-full bg-purple-100/40 blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* Left Side: Branding & Info */}
        <div className="text-center lg:text-left space-y-6">
          <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300 cursor-default">
              <IQMLogoFull className="w-10 h-10 text-iqm-primary" />
            </div>
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 tracking-tight leading-tight">
            Manage Tasks <br />
            <span className="text-iqm-primary">Intelligently.</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-md mx-auto lg:mx-0 leading-relaxed">
            The centralized Employee Task Management System (IQM) for tracking performance, assigning modules, and verifying skills.
          </p>


        </div>

        {/* Right Side: Login Form */}
        <div className="flex justify-center lg:justify-end w-full">
          <LoginForm />
        </div>

      </div>

      <footer className="mt-16 text-gray-400 text-sm">
        © 2026 IQM Systems. All rights reserved.
      </footer>
    </div>
  );
}
