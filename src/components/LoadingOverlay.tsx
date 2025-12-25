import { motion } from "framer-motion";

export const LoadingOverlay = ({ scanStep }: { scanStep: string }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-white/80 backdrop-blur-2xl z-[100] flex flex-col items-center justify-center">
        <div className="w-full max-w-xs flex flex-col items-center gap-8">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="relative">
                <div className="w-20 h-20 border-4 border-gray-100 rounded-full" />
                <div className="absolute inset-0 w-20 h-20 border-4 border-t-blue-600 rounded-full" />
            </motion.div>
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold tracking-tight">Syncing Capsule</h3>
                <p className="text-sm font-bold text-blue-600 uppercase tracking-widest animate-pulse">{scanStep}</p>
            </div>
        </div>
    </motion.div>
);
