import OverviewTab from "./tabs/OverviewTab";
import AnatomyTab from "./tabs/AnatomyTab";
import SecurityTab from "./tabs/SecurityTab";

export default function ResultsPhase({ activeTab, scanResults, copiedId, setCopiedId }: any) {
    if (activeTab === "overview") return <OverviewTab scanResults={scanResults} copiedId={copiedId} setCopiedId={setCopiedId} />;
    if (activeTab === "anatomy") return <AnatomyTab scanResults={scanResults} />;
    return <SecurityTab scanResults={scanResults} copiedId={copiedId} setCopiedId={setCopiedId} />;
}
