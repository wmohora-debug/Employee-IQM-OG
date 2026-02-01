import { LucideIcon } from "lucide-react";
import Image from "next/image";

interface StatProps {
    label: string;
    value: string | number;
    icon?: LucideIcon;
    iconImage?: string;
    color: string;
}

export function StatCard({ label, value, icon: Icon, iconImage, color }: StatProps) {
    // Parsing color to get text variant (simple hack for now)
    const textColor = color.replace('bg-', 'text-');

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow group">
            <div>
                <p className="text-sm text-gray-500 font-medium mb-1 uppercase tracking-wider">{label}</p>
                <h3 className="text-3xl font-bold text-gray-800 group-hover:text-iqm-primary transition-colors">{value}</h3>
            </div>
            {iconImage ? (
                <div className="w-14 h-14 relative shrink-0">
                    <Image
                        src={iconImage}
                        alt={label}
                        fill
                        className="object-contain rounded-xl"
                    />
                </div>
            ) : (
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${color} bg-opacity-10`}>
                    {Icon && <Icon className={`w-7 h-7 ${textColor}`} />}
                </div>
            )}
        </div>
    );
}
