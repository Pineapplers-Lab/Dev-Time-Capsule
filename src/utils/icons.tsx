import { AtomIcon } from "../components/Icons/AtomIcon";
import { Server, Box, FileCode, Database, Cloud, Wind, Layout, Boxes, Flame, Coffee, Code } from "lucide-react";

export const getTechIcon = (tech: string) => {
    const t = tech.toLowerCase();
    if (t.includes('react')) return <AtomIcon size={ 14 } />;
    if (t.includes('node')) return <Server size={ 14 } />;
    if (t.includes('python')) return <Box size={ 14 } />;
    if (t.includes('typescript') || t.includes('js')) return <FileCode size={ 14 } />;
    if (t.includes('db') || t.includes('sql') || t.includes('mongo')) return <Database size={ 14 } />;
    if (t.includes('aws') || t.includes('cloud')) return <Cloud size={ 14 } />;
    if (t.includes('tailwind')) return <Wind size={ 14 } />;
    if (t.includes('css')) return <Layout size={ 14 } />;
    if (t.includes('docker')) return <Boxes size={ 14 } />;
    if (t.includes('firebase')) return <Flame size={ 14 } />;
    if (t.includes('java')) return <Coffee size={ 14 } />;
    return <Code size={ 14 } />;
};
