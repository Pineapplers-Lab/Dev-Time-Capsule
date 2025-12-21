interface AnalysisInput {
  repoUrl?: string;
  manifestContent?: string;
}

export async function runAnalysis({ repoUrl, manifestContent }: AnalysisInput) {
  const res = await fetch("/api/run-analysis", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repoUrl, manifestContent }),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.error || "Unknown error");
  return data;
}
