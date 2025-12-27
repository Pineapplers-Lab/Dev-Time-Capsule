app/
 ├─ page.tsx                        # Main entry page, handles upload & view switching
 └─ api/
     └─ scan/
         └─ route.ts                 # API endpoint calling orchestrator

agents/                              # Multi-agent analysis modules
 ├─ repoMapper.ts                    # Clones repo, maps folder/file structure
 ├─ dependencyAgent.ts               # Fetches dependency tree, OSV.dev & GitHub advisories
 ├─ semanticsAgent.ts                # Extracts functions, classes, relationships
 ├─ architectureAgent.ts             # Generates architecture tiers & component mapping
 ├─ securityAgent.ts                 # Static analysis + Gemini API audit simulation
 └─ verificationAgent.ts             # Cross-checks outputs, ensures JSON consistency

orchestrator/
 └─ scanOrchestrator.ts              # Coordinates all agents, manages data flow & sequencing

components/
 ├─ Navbar.tsx
 ├─ Tabs/
 │   ├─ TabSelector.tsx
 │   ├─ OverviewTab.tsx
 │   ├─ AnatomyTab.tsx
 │   └─ SecurityTab.tsx
 ├─ Cards/
 │   ├─ GlassCard.tsx
 │   └─ MetricCard.tsx
 └─ Buttons/
     └─ AppleButton.tsx

utils/
 ├─ scanHelpers.ts                   # Helpers for async calls, JSON merging, step simulation
 └─ apiClients.ts                     # Gemini API client, OSV/GitHub clients

types/
 └─ index.ts                         # ScanResult type & agent-specific types
