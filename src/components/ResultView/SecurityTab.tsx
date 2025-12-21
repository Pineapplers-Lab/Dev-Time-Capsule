import { ShieldCheck } from "lucide-react";

interface SecurityTabProps {
    vulnerabilities: Array<{
        issue: string;
        riskLevel: "Low" | "Medium" | "High";
        fix: string;
    }>;
}

export default function SecurityTab({ vulnerabilities }: SecurityTabProps) {
    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
            {vulnerabilities?.map((v, i) => (
                <div
                    key={i}
                    className="flex items-start gap-8 p-10 bg-white border border-[var(--light-gray)] rounded-[32px] hover:shadow-lg transition-all"
                >
                    <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${v.riskLevel === "High"
                                ? "bg-[var(--danger)]/10 text-[var(--danger)]"
                                : "bg-[var(--warning)]/10 text-[var(--warning)]"
                            }`}
                    >
                        <ShieldCheck size={24} />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h4 className="text-[20px] font-bold tracking-tight">
                                {v.issue}
                            </h4>
                            <span
                                className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-widest ${v.riskLevel === "High"
                                        ? "bg-[var(--danger)] text-white"
                                        : "bg-[var(--warning)] text-white"
                                    }`}
                            >
                                {v.riskLevel}
                            </span>
                        </div>
                        <p className="text-[16px] text-[var(--gray)] font-medium leading-relaxed max-w-2xl">
                            {v.fix}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}