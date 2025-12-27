// src/components/Tabs/SecurityTab.tsx
"use client";

import { ScanResult } from "../../types";

interface SecurityTabProps {
  data: ScanResult;
}

export default function SecurityTab({ data }: SecurityTabProps) {
  if (!data.vulnerabilities || data.vulnerabilities.length === 0)
    return <p>No vulnerabilities found.</p>;

  return (
    <div>
      {data.vulnerabilities.map((vuln, idx) => (
        <div key={idx} className="border p-2 mb-2 rounded shadow-sm">
          {vuln.component && <p><strong>Component:</strong> {vuln.component}</p>}
          {vuln.package && <p><strong>Package:</strong> {vuln.package}</p>}
          {vuln.version && <p><strong>Version:</strong> {vuln.version}</p>}
          {vuln.issue && <p><strong>Issue:</strong> {vuln.issue}</p>}
          {vuln.severity && <p><strong>Severity:</strong> {vuln.severity}</p>}
          {vuln.recommendation && <p><strong>Recommendation:</strong> {vuln.recommendation}</p>}
          {vuln.fix_command && <p><strong>Fix Command:</strong> {vuln.fix_command}</p>}
          {vuln.cve_id && <p><strong>CVE ID:</strong> {vuln.cve_id}</p>}
          {vuln.severity?.map && (
            <ul>
              {vuln.severity.map((s: any, i: number) => (
                <li key={i}>
                  <strong>{s.type}:</strong> {s.score}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
