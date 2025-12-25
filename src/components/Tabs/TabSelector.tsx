import React from "react";
import { Tab } from "../../types";
import { ChevronRight } from "lucide-react";

interface Props {
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
}

export const TabSelector: React.FC<Props> = ({ activeTab, setActiveTab }) => (
    <div className="flex bg-gray-100/80 p-0.5 rounded-full border border-gray-200/20">
        {['onboarding', 'anatomy', 'vulns'].map((tab) => (
            <button
                key={tab}
                onClick={() => setActiveTab(tab as Tab)}
                className={`px-5 py-1.5 rounded-full text-[12px] font-medium transition-all ${activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-black'
                    }`}
            >
                {tab === 'onboarding' ? 'Overview' : tab === 'vulns' ? 'Security' : 'Anatomy'}
            </button>
        ))}
    </div>
);
