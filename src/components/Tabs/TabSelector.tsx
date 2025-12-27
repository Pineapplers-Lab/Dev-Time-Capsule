// src/components/Tabs/TabSelector.tsx
"use client";

import React from "react";

interface TabSelectorProps {
    tabs: string[];
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export default function TabSelector({ tabs, activeTab, setActiveTab }: TabSelectorProps) {
    return (
        <div className="flex space-x-4 border-b mb-4">
            {tabs.map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 font-medium ${activeTab === tab ? "border-b-2 border-black" : "text-gray-500"
                        }`}
                >
                    {tab}
                </button>
            ))}
        </div>
    );
}
