import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { getTechIcon } from '../../utils/icons';

interface TechCardProps extends HTMLMotionProps<'div'> {
  tech: string;
  description?: string;
}

const TechCard: React.FC<TechCardProps> = ({ tech, description, className, ...props }) => {
  const Icon = getTechIcon(tech);

  return (
    <motion.div
      className={`flex items-center gap-4 bg-gray-800 p-4 rounded-xl shadow-md ${className || ''}`}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {Icon && <Icon className="w-10 h-10 text-indigo-400" />}
      <div>
        <h4 className="text-lg font-semibold">{tech}</h4>
        {description && <p className="text-gray-300 text-sm">{description}</p>}
      </div>
    </motion.div>
  );
};

export default TechCard;
