"use client";

import Image from "next/image";
import { Github, Linkedin, ArrowLeft } from "lucide-react";
import { Button } from "../ui/Button";

type View = "input" | "loading" | "result";

interface HeaderProps {
  view: View;
  setView: (view: View) => void;
}

export default function Header({ view, setView }: HeaderProps) {
  return (
    <header className="flex items-center justify-between mb-6 md:mb-8">
      <button
        type="button"
        onClick={() => setView("input")}
        className="flex items-center gap-2 group focus:outline-none"
        aria-label="Go to home"
      >
        <Image
          src="/favicon.ico"
          alt="DevCapsule logo"
          width={36}
          height={36}
          className="rounded-sm"
          priority
        />
        <span className="text-[20px] font-semibold tracking-tight text-neutral-900">
          DevCapsule
        </span>
      </button>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-4 py-1.5 shadow-sm">
          <a
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="p-1.5 text-neutral-400 transition-colors hover:text-neutral-900"
          >
            <Github size={18} />
          </a>

          <span className="mx-1 h-3 w-px bg-neutral-200" />

          <a
            href="https://linkedin.com/"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="p-1.5 text-neutral-400 transition-colors hover:text-[#0077B5]"
          >
            <Linkedin size={18} />
          </a>
        </div>

        {view === "result" && (
          <Button
            variant="dark"
            size="sm"
            onClick={() => setView("input")}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            New Audit
          </Button>
        )}
      </div>
    </header>
  );
}
