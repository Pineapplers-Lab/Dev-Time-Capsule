import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface StepCardProps extends HTMLMotionProps<'div'> {
    step: number;
    title: string;
    description: string;
    completed?: boolean;
}

const StepCard: React.FC<StepCardProps> = ({ step, title, description, completed = false, className, ...props }) => {
    return (
        <motion.div
            className={`flex items-start gap-4 p-4 border rounded-xl shadow-sm ${completed ? 'border-green-500 bg-green-900/20' : 'border-gray-700 bg-gray-800'
                } ${className || ''}`}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            {...props}
        >
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white bg-indigo-600">
                {step}
            </div>
            <div>
                <h4 className="text-lg font-semibold">{title}</h4>
                <p className="text-gray-300 text-sm">{description}</p>
            </div>
        </motion.div>
    );
};

export default StepCard;
