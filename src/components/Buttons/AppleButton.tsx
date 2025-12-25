import { motion } from "framer-motion";

export const AppleButton = ({ children, onClick, disabled, variant = 'primary' }: any) => (
    <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        disabled={disabled}
        className={`
      px-6 py-3 rounded-full text-[14px] font-semibold transition-all flex items-center gap-2
      ${variant === 'primary' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}
      disabled:opacity-50 disabled:cursor-not-allowed
    `}
    >
        {children}
    </motion.button>
);
