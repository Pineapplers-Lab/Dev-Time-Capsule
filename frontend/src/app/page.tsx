"use client";

import { useState } from "react";
import Header from "@/components/Header";
import InputSection from "@/components/InputSection";
import LoadingState from "@/components/LoadingState";
import ResultView from "@/components/ResultView";

export default function Home() {
  const [view, setView] = useState<"input" | "loading" | "result">("input");
  const [result, setResult] = useState<any>(null);

  return (
    <main className="min-h-screen flex flex-col justify-center items-center px-4 md:px-8">
      {view === "input" && (
        <div className="w-full max-w-[1100px] flex flex-col gap-8">
          <Header view={view} setView={setView} />
          <InputSection setView={setView} setResult={setResult} />
        </div>
      )}

      {view === "loading" && <LoadingState />}

      {view === "result" && result && (
        <ResultView result={result} setView={setView} />
      )}
    </main>
  );
}
