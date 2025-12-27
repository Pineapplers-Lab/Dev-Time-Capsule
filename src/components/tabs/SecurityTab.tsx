import { Copy, Check } from "lucide-react";

export default function SecurityTab({ scanResults, copiedId, setCopiedId }: any) {
    const handleCopy = (text: string, id: string) => {
        if (typeof navigator !== "undefined" && navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                setCopiedId(id);
                setTimeout(() => setCopiedId(null), 2000);
            });
        } else {
            // Fallback for SSR or older browsers
            const textarea = document.createElement("textarea");
            textarea.value = text;
            textarea.style.position = "fixed";
            textarea.style.top = "-9999px";
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        }
    };

    return (
        <div className="flex flex-col items-center gap-6">
            {scanResults.agents_reports.security.vulnerabilities.map((v: any, idx: number) => (
                <div
                    key={idx}
                    className="w-full max-w-2xl bg-white border border-gray-100 rounded-3xl p-6 space-y-4 shadow-sm hover:shadow-md transition-all"
                >
                    <div className="flex justify-between items-center">
                        <h4 className="text-lg font-semibold">{v.pkg}</h4>
                        <span
                            className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${v.severity === "Critical" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-700"
                                }`}
                        >
                            {v.severity}
                        </span>
                    </div>

                    <p className="text-gray-600 text-sm">{v.desc}</p>

                    <div className="relative bg-gray-900 rounded-xl p-4 flex justify-between items-center font-mono text-sm text-green-400">
                        <code className="overflow-x-auto">{`$ ${v.fix_command}`}</code>
                        <button
                            onClick={() => handleCopy(v.fix_command, `v-${idx}`)}
                            className="ml-4 text-gray-300 hover:text-white transition-colors"
                        >
                            {copiedId === `v-${idx}` ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
