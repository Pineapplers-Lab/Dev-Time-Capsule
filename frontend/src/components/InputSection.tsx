"use client";

import { useState, useRef, useEffect } from "react";
import { Link2, Upload, Terminal, Github, ArrowRight } from "lucide-react";
import { runAnalysis } from "@/lib/api";

type InputMode = "url" | "upload" | "paste";

interface InputSectionProps {
  setView: (view: "input" | "loading" | "result") => void;
  setResult: (result: any) => void;
}

export default function InputSection({ setView, setResult }: InputSectionProps) {
  const [repoUrl, setRepoUrl] = useState("");
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [pastedJson, setPastedJson] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>("url");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setFileContent(content);
        setFileName(file.name);
        setRepoUrl("");
        setPastedJson("");
        handleSubmit(content);
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (manualContent?: string) => {
    const activeContent = manualContent || pastedJson || fileContent;
    if (!repoUrl && !activeContent) return;

    setView("loading");

    try {
      const result = await runAnalysis({
        repoUrl,
        manifestContent: activeContent || undefined,
      });
      await new Promise((r) => setTimeout(r, 800));
      setResult(result);
      setView("result");
    } catch (err) {
      console.error(err);
      setView("input");
    }
  };

  // auto-submit on paste
  useEffect(() => {
    if (inputMode === "paste" && pastedJson.trim()) {
      handleSubmit(pastedJson);
    }
  }, [pastedJson, inputMode]);

  return (
    <div className="flex-1 flex flex-col justify-start px-4 md:px-0">
      <div className="max-w-[700px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-[36px] md:text-[42px] leading-tight font-bold tracking-tight mb-2">
            Unlock the <span className="text-(--primary)">blueprint.</span>
          </h1>
          <p className="text-[16px] md:text-[18px] text-(--gray) font-medium tracking-tight">
            AI-powered codebase insights for rapid onboarding.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[40px] border border-(--light-gray) shadow-xl shadow-black/5 p-6 md:p-10 flex flex-col gap-6">
          {/* Mode toggle */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex bg-(--light-bg) p-1 rounded-2xl border border-(--light-gray)">
              {[
                { id: "url", label: "URL", icon: <Link2 size={15} /> },
                { id: "upload", label: "File", icon: <Upload size={15} /> },
                { id: "paste", label: "JSON", icon: <Terminal size={15} /> },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setInputMode(mode.id as InputMode)}
                  className={`flex items-center gap-2 px-5 py-2 text-[13px] font-bold transition-all rounded-xl ${inputMode === mode.id
                    ? "bg-white text-black shadow-sm border border-black/5"
                    : "text-(--gray) hover:text-black"
                    }`}
                >
                  {mode.icon} {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input area */}
          <div className="flex items-center w-full min-h-[120px]">
            {inputMode === "url" && (
              <div className="relative w-full flex items-center">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-(--gray) group-focus-within:text-(--primary)">
                  <Github size={22} />
                </div>
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full pr-12 pl-14 py-4 text-lg md:text-xl font-medium bg-(--light-bg) rounded-3xl outline-none border-2 border-transparent focus:border-(--primary) focus:bg-white transition-all placeholder:text-[#D2D2D7]"
                  placeholder="Paste repository link..."
                  autoFocus
                />
                <button
                  onClick={() => handleSubmit()}
                  disabled={!repoUrl}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-(--primary) text-white rounded-full hover:bg-(--primary-hover) transition-colors"
                  aria-label="Generate Audit"
                >
                  <ArrowRight size={18} />
                </button>
              </div>
            )}

            {inputMode === "upload" && (
              <div className="relative w-full flex items-center">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="group w-full py-6 md:py-8 rounded-3xl border-2 border-dashed border-(--light-gray) bg-(--light-bg) hover:bg-white hover:border-(--primary) transition-all flex flex-col items-center cursor-pointer"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".json,.yml,.yaml"
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-2">
                    <Upload size={22} className="text-(--primary)" />
                  </div>
                  <span className="text-[14px] md:text-[15px] font-bold text-(--foreground)">
                    {fileName || "Upload package.json / manifest"}
                  </span>
                  <span className="text-[12px] md:text-[13px] text-(--gray) mt-1">
                    Drag & drop or click to browse
                  </span>
                </div>
                {/* Action icon */}
                {fileContent && (
                  <button
                    onClick={() => handleSubmit(fileContent)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-(--primary) text-white rounded-full hover:bg-(--primary-hover) transition-colors"
                    aria-label="Generate Audit"
                  >
                    <ArrowRight size={18} />
                  </button>
                )}
              </div>
            )}

            {inputMode === "paste" && (
              <div className="relative w-full flex items-center">
                <textarea
                  value={pastedJson}
                  onChange={(e) => setPastedJson(e.target.value)}
                  className="w-full h-32 md:h-40 p-4 md:p-6 bg-(--light-bg) rounded-3xl outline-none text-base md:text-sm font-mono border-2 border-transparent focus:border-(--primary) focus:bg-white transition-all resize-none"
                  placeholder='{ "dependencies": { ... } }'
                />
                {pastedJson.trim() && (
                  <button
                    onClick={() => handleSubmit(pastedJson)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-(--primary) text-white rounded-full hover:bg-(--primary-hover) transition-colors"
                    aria-label="Generate Audit"
                  >
                    <ArrowRight size={18} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
