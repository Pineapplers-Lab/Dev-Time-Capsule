// src/components/Tabs/AnatomyTab.tsx
"use client";

import { ScanResult } from "../../types";

interface AnatomyTabProps {
    data: ScanResult;
}

export default function AnatomyTab({ data }: AnatomyTabProps) {
    if (!data.anatomy || data.anatomy.length === 0) return <p>No anatomy data found.</p>;

    return (
        <div>
            {data.anatomy.map((item, idx) => (
                <div key={idx} className="border p-2 mb-2 rounded shadow-sm">
                    <p><strong>Name:</strong> {item.name}</p>
                    <p><strong>File:</strong> {item.file}</p>
                </div>
            ))}
        </div>
    );
}
