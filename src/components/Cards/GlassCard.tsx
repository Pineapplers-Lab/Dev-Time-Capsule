import React, { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<'div'> {
    title?: string;
    children?: ReactNode;
}

const GlassCard: React.FC<GlassCardProps> = ({ title, children, className, ...props }) => {
    return (
        <motion.div
            className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-lg ${className || ''}`}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.2 }}
            {...props}
        >
            {title && <h3 className="text-xl font-semibold mb-4">{title}</h3>}
            {children}
        </motion.div>
    );
};

export default GlassCard;
