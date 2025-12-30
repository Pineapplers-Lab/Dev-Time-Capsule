"use client";

import { Box, Layers, ArrowDown, Package, CircleDot } from "lucide-react";

export default function AnatomyTab({ scanResults }: any) {
    if (!scanResults || !scanResults.agents_reports) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="flex flex-col items-center gap-4">
                    <p className="text-sm text-gray-500 font-medium">No architecture data available</p>
                </div>
            </div>
        );
    }

    const components = scanResults.agents_reports.architect.components;

    // Group components by tier
    const tierGroups = components.reduce((acc: any, comp: any) => {
        if (!acc[comp.tier]) acc[comp.tier] = [];
        acc[comp.tier].push(comp);
        return acc;
    }, {});

    const tiers = Object.keys(tierGroups);

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-6xl mx-auto px-6 py-16">

                {/* Header Section */}
                <div className="mb-20 animate-fade-in text-center">
                    <h1 className="text-5xl font-semibold text-gray-900 mb-4 tracking-tight">
                        Project Architecture
                    </h1>
                    <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
                        Visual representation of the main components and their hierarchy within the project
                    </p>

                    {/* Architecture Stats */}
                    <div className="mt-8 flex items-center justify-center gap-6">
                        <div className="flex items-center gap-2">
                            <Layers size={18} className="text-gray-400" />
                            <span className="text-sm text-gray-600 font-medium">
                                {tiers.length} {tiers.length === 1 ? 'Tier' : 'Tiers'}
                            </span>
                        </div>
                        <div className="w-px h-4 bg-gray-300" />
                        <div className="flex items-center gap-2">
                            <Package size={18} className="text-gray-400" />
                            <span className="text-sm text-gray-600 font-medium">
                                {components.length} {components.length === 1 ? 'Component' : 'Components'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Architecture Diagram */}
                <div className="relative">
                    {/* Vertical Flow Line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200 -translate-x-1/2 hidden md:block" />

                    {/* Tiers */}
                    <div className="space-y-16">
                        {tiers.map((tier: string, tierIdx: number) => (
                            <div
                                key={tier}
                                className="relative animate-slide-up"
                                style={{ animationDelay: `${tierIdx * 200}ms` }}
                            >
                                {/* Tier Label Node */}
                                <div className="flex justify-center mb-8">
                                    <div className="relative z-10 inline-flex items-center gap-3 px-6 py-3 bg-white border-2 border-gray-300 rounded-full shadow-lg">
                                        <CircleDot size={20} className="text-gray-600" />
                                        <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                                            {tier}
                                        </span>
                                    </div>
                                </div>

                                {/* Components in this tier */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                                    {tierGroups[tier].map((comp: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className="group bg-white border-2 border-gray-200 rounded-2xl p-6 transition-all duration-300 hover:border-gray-400 hover:shadow-2xl animate-scale-in"
                                            style={{ animationDelay: `${tierIdx * 200 + idx * 100}ms` }}
                                        >
                                            {/* Component Icon */}
                                            <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-gray-900 group-hover:scale-110">
                                                <Box size={24} className="text-gray-400 group-hover:text-white transition-colors duration-300" />
                                            </div>

                                            {/* Component Name */}
                                            <h4 className="text-xl font-semibold text-gray-900 mb-2">
                                                {comp.name}
                                            </h4>

                                            {/* Component Purpose */}
                                            <p className="text-gray-600 text-sm leading-relaxed">
                                                {comp.purpose}
                                            </p>

                                            {/* Connection Indicator */}
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                                                    <span className="font-medium">{tier} Layer</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Arrow to next tier */}
                                {tierIdx < tiers.length - 1 && (
                                    <div className="flex justify-center mt-12">
                                        <ArrowDown
                                            size={28}
                                            className="text-gray-300 animate-bounce-slow"
                                            style={{ animationDelay: `${tierIdx * 400}ms` }}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Architecture Summary */}
                <div className="mt-20 animate-fade-in">
                    <div className="max-w-3xl mx-auto bg-gray-50 border-2 border-gray-200 rounded-2xl p-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Layers size={20} />
                            Architecture Overview
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                            This diagram shows the hierarchical structure of your project, organized by architectural tiers.
                            Each component serves a specific purpose within its layer, working together to create a cohesive system.
                        </p>
                    </div>
                </div>

                <div className="h-16" />
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes scale-in {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                @keyframes bounce-slow {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(10px);
                    }
                }

                .animate-fade-in {
                    animation: fade-in 0.8s ease-out;
                }

                .animate-slide-up {
                    animation: slide-up 0.8s ease-out;
                    animation-fill-mode: both;
                }

                .animate-scale-in {
                    animation: scale-in 0.6s ease-out;
                    animation-fill-mode: both;
                }

                .animate-bounce-slow {
                    animation: bounce-slow 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}