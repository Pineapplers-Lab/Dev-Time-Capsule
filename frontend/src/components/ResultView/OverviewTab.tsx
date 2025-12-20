import { Cpu } from "lucide-react";

interface OverviewTabProps {
    stackDetails: Array<{ name: string; purpose: string }>;
}

export default function OverviewTab({ stackDetails }: OverviewTabProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
            {stackDetails.map((tech, i) => (
                <div
                    key={i}
                    className="bg-white p-8 rounded-[32px] border border-[var(--light-gray)] hover:shadow-xl transition-all group"
                >
                    <div className="w-10 h-10 bg-[var(--light-bg)] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                        <Cpu size={20} />
                    </div>
                    <h4 className="text-[19px] font-bold mb-3">{tech.name}</h4>
                    <p className="text-[15px] text-[var(--gray)] font-medium leading-relaxed">
                        {tech.purpose}
                    </p>
                </div>
            ))}
        </div>
    );
}