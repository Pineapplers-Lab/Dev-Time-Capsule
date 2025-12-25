import React from "react";
import { Lock, Activity } from "lucide-react";

interface Props {
    setView: (view: 'upload' | 'results') => void;
    view: 'upload' | 'results';
}

export const Navbar: React.FC<Props> = ({ setView, view }) => (
    <nav className="h-14 border-b border-gray-100/60 bg-white/80 backdrop-blur-xl sticky top-0 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setView('upload')}>
            <div className="bg-blue-600 h-8 w-8 rounded-[10px] flex items-center justify-center shadow-inner">
                <Lock size={16} className="text-white" />
            </div>
            <span className="font-bold text-[17px] tracking-tight">Dev Capsule</span>
        </div>

        <div className="flex items-center gap-4">
            <Activity size={16} className="text-gray-400" />
            <div className="h-8 w-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                <div className="bg-gradient-to-tr from-blue-500 to-purple-500 w-full h-full" />
            </div>
        </div>
    </nav>
);
