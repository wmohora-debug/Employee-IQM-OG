import Image from "next/image";

export function IQMLogo({ className = "w-10 h-10" }: { className?: string }) {
    return (
        <div className={`relative ${className}`}>
            <Image
                src="/logo_new.jpg"
                alt="IQM Logo"
                fill
                className="object-contain rounded-lg"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
            />
        </div>
    );
}

export function IQMLogoFull({ className = "w-10 h-10" }: { className?: string }) {
    return (
        <div className={`relative ${className}`}>
            <Image
                src="/logo_new.jpg"
                alt="IQM Logo"
                fill
                className="object-contain rounded-lg"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
            />
        </div>
    );
}
