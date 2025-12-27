"use client";

import { Box } from "lucide-react";

export default function AnatomyTab({ scanResults }: any) {
    return (
        <div className="flex flex-col items-center gap-12 max-w-5xl mx-auto p-6">
            <h2 className="text-3xl font-bold text-gray-900 text-center">
                Project Architecture
            </h2>
            <p className="text-gray-500 text-center max-w-2xl">
                Visual representation of the main components and their hierarchy within the project.
            </p>

            <div className="relative flex flex-col items-center gap-12 w-full">
                {scanResults.agents_reports.architect.components.map((comp: any, idx: number) => (
                    <div key={idx} className="flex flex-col items-center w-full max-w-2xl relative">
                        {/* Connector Line */}
                        {idx > 0 && (
                            <div className="absolute top-[-3rem] left-1/2 transform -translate-x-1/2 h-12 w-px bg-gray-200" />
                        )}

                        {/* Component Card */}
                        <div className="bg-white border border-gray-100 rounded-2xl p-6 w-full flex flex-col items-center shadow-sm hover:shadow-md transition-shadow relative z-10">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-12 w-12 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                    <Box size={20} />
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-xs font-semibold text-blue-600 uppercase">
                                        {comp.tier}
                                    </span>
                                    <h4 className="text-lg font-bold text-gray-900">{comp.name}</h4>
                                </div>
                            </div>
                            <p className="text-gray-500 text-sm text-center leading-relaxed">
                                {comp.purpose}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
