import { Copy, Check, Target } from "lucide-react";

export default function OverviewTab({ scanResults, copiedId, setCopiedId }: any) {
    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="grid grid-cols-12 gap-8">
            <div className="col-span-8 space-y-8">
                <h2 className="text-5xl font-bold tracking-tight">Project Roadmap</h2>
                <p className="text-xl text-gray-500">
                    {scanResults.agents_reports.architect.summary}
                </p>

                {scanResults.agents_reports.dx.steps.map((step: any, idx: number) => (
                    <div key={idx} className="bg-white p-8 rounded-[32px] border border-gray-100 flex gap-8">
                        <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center font-bold border">
                            {idx + 1}
                        </div>

                        <div className="space-y-4 flex-1">
                            <div className="flex justify-between">
                                <h3 className="text-xl font-bold">{step.title}</h3>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${step.priority === "High"
                                        ? "bg-red-50 text-red-600"
                                        : "bg-blue-50 text-blue-600"
                                    }`}>
                                    {step.priority}
                                </span>
                            </div>

                            <p className="text-gray-500 text-sm">{step.desc}</p>

                            <div className="bg-gray-900 rounded-2xl p-4 flex justify-between">
                                <code className="text-blue-400 text-xs font-mono">$ {step.cmd}</code>
                                <button onClick={() => handleCopy(step.cmd, `dx-${idx}`)}>
                                    {copiedId === `dx-${idx}` ? <Check size={16} /> : <Copy size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="col-span-4 space-y-6">
                <div className="bg-black rounded-[32px] p-8 text-white space-y-8">
                    <div className="flex justify-between">
                        <Target size={24} className="text-blue-500" />
                        <div className="text-right">
                            <span className="text-[10px] text-gray-500 uppercase block">
                                Health Score
                            </span>
                            <span className="text-5xl font-bold">
                                {scanResults.metadata.score}%
                            </span>
                        </div>
                    </div>

                    <div className="h-1.5 w-full bg-white/10 rounded-full">
                        <div
                            className="h-full bg-blue-500"
                            style={{ width: `${scanResults.metadata.score}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
