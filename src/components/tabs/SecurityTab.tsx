import { Copy, Check } from "lucide-react";

export default function SecurityTab({ scanResults, copiedId, setCopiedId }: any) {
    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="space-y-8">
            {scanResults.agents_reports.security.vulnerabilities.map((v: any, idx: number) => (
                <div key={idx} className="bg-white border border-gray-100 rounded-[32px] p-8 space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="text-lg font-bold">{v.pkg}</h4>
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${v.severity === "Critical"
                                ? "bg-red-100 text-red-600"
                                : "bg-yellow-100 text-yellow-700"
                            }`}>
                            {v.severity}
                        </span>
                    </div>

                    <p className="text-gray-500 text-sm">{v.desc}</p>

                    <div className="bg-gray-900 rounded-xl p-4 flex justify-between">
                        <code className="text-white text-xs font-mono">
                            $ {v.fix_command}
                        </code>
                        <button onClick={() => handleCopy(v.fix_command, `v-${idx}`)}>
                            {copiedId === `v-${idx}` ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
