import { Activity } from "lucide-react";

interface AdvisoryTabProps {
    advisory: Array<{
        title: string;
        explanation: string;
        recommendation: string;
    }>;
}

export default function AdvisoryTab({ advisory }: AdvisoryTabProps) {
    return (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <section className="bg-black text-white p-16 rounded-[48px] shadow-2xl relative overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-16">
                {advisory.map((item, i) => (
                    <div key={i} className="space-y-5 z-10">
                        <h4 className="text-[22px] font-bold tracking-tight border-l-4 border-[var(--primary)] pl-6">
                            {item.title}
                        </h4>
                        <p className="text-[17px] text-white/60 leading-[1.5] font-medium">
                            {item.explanation}
                        </p>
                        <div className="flex items-center gap-2 text-[13px] font-bold text-[var(--success)]">
                            <Activity size={14} /> {item.recommendation}
                        </div>
                    </div>
                ))}
                <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--primary)]/20 rounded-full blur-[100px] pointer-events-none" />
            </section>
        </div>
    );
}