import { Layers, Shield, Users } from "lucide-react";

export const AGENTS = [
    { id: "architect", name: "Architectural Agent", icon: <Layers size={18} />, color: "blue", desc: "Maps structural tiers & stack" },
    { id: "security", name: "Security Sentinel", icon: <Shield size={18} />, color: "red", desc: "Queries OSV.dev & GHSA" },
    { id: "onboarding", name: "DX Specialist", icon: <Users size={18} />, color: "purple", desc: "Builds setup & remediation paths" }
];
