// src/components/Tabs/OverviewTab.tsx
"use client";

import { ScanResult } from "../../types";

interface OverviewTabProps {
    data: ScanResult;
}

export default function OverviewTab({ data }: OverviewTabProps) {
    return (
        <div>
            <h2 className="text-xl font-bold">Tech Stack</h2>
            <pre>{JSON.stringify(data.tech_stack, null, 2)}</pre>

            <h2 className="text-xl font-bold mt-4">Files</h2>
            <pre>{JSON.stringify(data.files, null, 2)}</pre>
        </div>
    );
}
