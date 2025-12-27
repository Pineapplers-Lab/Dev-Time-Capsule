"use client";

import Image from "next/image";
import { Github, Linkedin, Workflow, Menu } from "lucide-react";
import { useState } from "react";

export default function Navigation({
    phase,
    activeTab,
    setActiveTab,
    setPhase
}: any) {
    const [open, setOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => setPhase("upload")}
                    >
                        <Image
                            src="/favicon.ico"
                            alt="Dev Capsule"
                            width={32}
                            height={32}
                            className="rounded-lg"
                        />
                        <span className="font-bold text-lg tracking-tight">
                            Dev Capsule
                        </span>
                    </div>

                    {phase === "results" && (
                        <div className="hidden md:flex bg-gray-100 p-1 rounded-full border border-gray-200">
                            {["overview", "anatomy", "security"].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-6 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-widest transition-all ${activeTab === tab
                                            ? "bg-white text-blue-600 shadow-sm"
                                            : "text-gray-500 hover:text-black"
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="hidden md:flex items-center gap-4 text-gray-500">
                        <Workflow size={16} />
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-black"
                        >
                            <Github size={18} />
                        </a>
                        <a
                            href="https://linkedin.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-black"
                        >
                            <Linkedin size={18} />
                        </a>
                    </div>

                    <button
                        onClick={() => setOpen(!open)}
                        className="md:hidden text-gray-600"
                    >
                        <Menu size={22} />
                    </button>
                </div>
            </div>

            {open && phase === "results" && (
                <div className="md:hidden border-t border-gray-100 bg-white">
                    <div className="flex flex-col gap-2 px-4 py-4">
                        {["overview", "anatomy", "security"].map(tab => (
                            <button
                                key={tab}
                                onClick={() => {
                                    setActiveTab(tab);
                                    setOpen(false);
                                }}
                                className={`w-full rounded-lg px-4 py-2 text-left text-sm font-bold uppercase ${activeTab === tab
                                        ? "bg-blue-50 text-blue-600"
                                        : "text-gray-600"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}

                        <div className="flex gap-4 pt-4 border-t border-gray-100">
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Github size={18} />
                            </a>
                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Linkedin size={18} />
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
