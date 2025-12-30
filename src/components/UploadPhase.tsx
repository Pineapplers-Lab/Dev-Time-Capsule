"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Github, UploadCloud, Target } from "lucide-react";
import { useState } from "react";

export default function UploadPhase({ performScan, securityScore }: any) {
  const [activeTab, setActiveTab] = useState<"repo" | "file">("repo");
  const [repoUrl, setRepoUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <motion.div
      className="relative min-h-screen flex items-center justify-center px-4 sm:px-6"
      style={{
        backgroundImage: "url(/image.png)",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Light overlay */}
      <div className="absolute inset-0 bg-black/25 sm:bg-black/30 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center gap-8 sm:gap-12">
        {/* Heading */}
        <motion.h1
          className="text-3xl sm:text-5xl font-semibold tracking-tight text-white text-center"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          Upload Your <span className="text-blue-400">Codebase</span>
        </motion.h1>

        {/* Segmented Control */}
        <div className="relative flex bg-white/80 backdrop-blur-xl rounded-full p-1 shadow-lg w-full max-w-xs sm:max-w-sm">
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="absolute top-1 bottom-1 w-1/2 rounded-full bg-white shadow"
            style={{ left: activeTab === "repo" ? "4px" : "50%" }}
          />

          <button
            onClick={() => setActiveTab("repo")}
            className="relative z-10 flex-1 py-2 text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Github size={16} />
            Repo
          </button>

          <button
            onClick={() => setActiveTab("file")}
            className="relative z-10 flex-1 py-2 text-sm font-semibold flex items-center justify-center gap-2"
          >
            <UploadCloud size={16} />
            Upload
          </button>
        </div>

        {/* Upload Area */}
        <AnimatePresence mode="wait">
          {activeTab === "repo" ? (
            <motion.div
              key="repo"
              className="w-full max-w-2xl bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl flex items-center gap-4"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
            >
              <Github className="text-gray-400 shrink-0" />

              <input
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="github.com/username/repo"
                className="flex-1 bg-transparent outline-none text-base sm:text-lg"
              />

              <motion.button
                onClick={() => performScan(repoUrl, null)}
                disabled={!repoUrl}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-black text-white flex items-center justify-center shadow-lg disabled:opacity-40"
                aria-label="Analyze repository"
              >
                <UploadCloud size={18} />
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="file"
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                setFile(e.dataTransfer.files[0]);
              }}
              className={`w-full max-w-2xl rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center transition-all border-2 border-dashed ${dragging
                  ? "border-blue-400 bg-blue-400/10 scale-[1.02]"
                  : "border-white/50 bg-white/10"
                }`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
            >
              <UploadCloud className="mx-auto mb-3 sm:mb-4 text-white" size={36} />
              <p className="text-white text-base sm:text-lg font-medium">
                Drag and drop your archive
              </p>
              <p className="text-xs sm:text-sm text-white/70 mt-1">
                ZIP, TAR, or GZ supported
              </p>

              {file && (
                <motion.div
                  className="mt-3 text-sm text-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {file.name}
                </motion.div>
              )}

              <motion.button
                onClick={() => performScan("", file)}
                disabled={!file}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-5 h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-white text-black flex items-center justify-center shadow-lg mx-auto disabled:opacity-40"
                aria-label="Analyze file"
              >
                <UploadCloud size={18} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Score */}
        {securityScore !== undefined && (
          <motion.div
            className="w-full max-w-2xl bg-white/90 backdrop-blur-xl rounded-2xl p-4 sm:p-5 shadow-lg flex items-center gap-3 sm:gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Target className="text-blue-600" />
            <div className="flex-1">
              <div className="text-xs uppercase tracking-widest text-gray-500">
                Health Score
              </div>
              <div className="text-xl sm:text-2xl font-semibold">
                {securityScore}%
              </div>
              <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-blue-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${securityScore}%` }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
