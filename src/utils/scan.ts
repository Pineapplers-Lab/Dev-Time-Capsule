export const performRealScan = async (
    { repoUrl }: { repoUrl: string },
    setScanResults: (res: ScanResult | null) => void,
    setView: (view: "upload" | "results") => void,
    setIsScanning: (isScanning: boolean) => void,
    setScanStep: (step: string) => void,
    setError: (err: string | null) => void
) => {
    try {
        setIsScanning(true);
        setScanStep("Sending repo for scan...");

        const res = await fetch("/api/scan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ repoUrl }),
        });

        const data = await res.json(); // read JSON once

        if (!res.ok) {
            throw new Error(data.error || "Scan failed");
        }

        setScanStep("Processing results...");
        setScanResults(data);
        setView("results");
    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsScanning(false);
        setScanStep("");
    }
};
