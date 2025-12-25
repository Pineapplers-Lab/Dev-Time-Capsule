"use client";

import React, { useState } from "react";
import GlassCard from "../Cards/GlassCard";
import { Layers } from "lucide-react";
import { ScanResult } from "../../types";
import { performRealScan } from "../../utils/scan";

interface Props {
    repoUrl: string;
}

const AnatomyTab: React.FC<Props> = ({ repoUrl }) => {
    const [scanResults, setScanResults] = useState<ScanResult | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scanStep, setScanStep] = useState("");
    const [error, setError] = useState<string | null>(null);

    const ensureArray = (arr: any) => (Array.isArray(arr) ? arr : arr ? [arr] : []);

    const handleScan = async () => {
        setScanResults(null);
        setError(null);
        await performRealScan(
            { repoUrl },
            setScanResults,
            () => { }, // view switching not needed here
            setIsScanning,
            setScanStep,
            setError
        );
    };

    return (
        <div className="space-y-8">
            <header className="space-y-2">
                <h2 className="text-4xl font-bold tracking-tight">Code Anatomy</h2>
                <p className="text-gray-500 font-medium">
                    Visualizing the structural tiers and component logic of your project.
                </p>
                <button
                    onClick={handleScan}
                    disabled={isScanning}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {isScanning ? "Scanning..." : "Start Scan"}
                </button>
                {scanStep && <p className="text-gray-300 text-sm mt-1">{scanStep}</p>}
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scanResults &&
                    ensureArray(scanResults?.anatomy).map((comp, idx) => (
                        <GlassCard
                            key={idx}
                            className="p-6 hover:border-blue-500 transition-colors group"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                                    <Layers size={22} />
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block">
                                        {comp.architecture_tier || "Component"}
                                    </span>
                                    <h3 className="text-lg font-bold">{comp.component}</h3>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest block">
                                        Purpose
                                    </span>
                                    <p className="text-sm font-semibold leading-tight">{comp.purpose}</p>
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed">{comp.analysis}</p>
                            </div>
                        </GlassCard>
                    ))}
            </div>
        </div>
    );
};

export default AnatomyTab;
