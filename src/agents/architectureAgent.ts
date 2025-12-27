import fs from "fs";
import path from "path";

interface ArchitectureItem {
    architecture_tier: string; // Frontend / Backend / Config / Scripts
    component: string;         // filename
    purpose: string;           // e.g., "Logic", "UI", "Config"
    analysis: string;          // optional notes
}

export async function architectureAgent(repoPath: string): Promise<ArchitectureItem[]> {
    const architecture: ArchitectureItem[] = [];

    const walk = (dir: string) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                walk(fullPath);
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
                let tier = "Backend";
                let purpose = "Logic";

                // Frontend detection
                if (ext === ".tsx" || ext === ".jsx" || dir.includes("components") || dir.includes("pages")) {
                    tier = "Frontend";
                    purpose = "UI";
                }

                // Config files
                if ([".json", ".config.js", ".yaml", ".yml", ".env"].includes(ext) || entry.name.includes("config")) {
                    tier = "Config";
                    purpose = "Configuration";
                }

                // Scripts
                if (ext === ".sh" || ext === ".bat" || ext === ".py") {
                    tier = "Scripts";
                    purpose = "Automation / Script";
                }

                architecture.push({
                    architecture_tier: tier,
                    component: path.relative(repoPath, fullPath),
                    purpose,
                    analysis: `File type: ${ext || "unknown"}`
                });
            }
        }
    };

    walk(repoPath);
    return architecture;
}
