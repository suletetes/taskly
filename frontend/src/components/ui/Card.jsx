import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  variant = 'default',
  padding = 'md',
  interactive = false,
  className = '',
  onClick,
  ...props
}) => {
  const baseClasses = 'bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-xl transition-all duration-200';
  
  const variants = {
    default: 'shadow-soft',
    elevated: 'shadow-medium hover:shadow-large',
    outlined: 'border-2 shadow-none',
    flat: 'shadow-none border-none',
  };
  
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  const interactiveClasses = interactive 
    ? 'cursor-pointer hover:shadow-medium hover:border-secondary-300 dark:hover:border-secondary-600' 
    : '';
  
  const classes = `${baseClasses} ${variants[variant]} ${paddings[padding]} ${interactiveClasses} ${className}`;
  
  const CardComponent = interactive ? motion.div : 'div';
  const motionProps = interactive ? {
    whileHover: { scale: 1.02, y: -2 },
    whileTap: { scale: 0.98 },
  } : {};
  
  return (
    <CardComponent
      className={classes}
      onClick={onClick}
      {...motionProps}
      {...props}
    >
      {children}
    </CardComponent>
  );
};

// Card sub-components
Card.Header = ({ children, className = '', ...props }) => (
  <div className={`flex items-center justify-between mb-4 ${className}`} {...props}>
    {children}
  </div>
);

Card.Title = ({ children, className = '', ...props }) => (
  <h3 className={`text-lg font-semibold text-secondary-900 dark:text-secondary-100 ${className}`} {...props}>
    {children}
  </h3>
);

Card.Subtitle = ({ children, className = '', ...props }) => (
  <p className={`text-sm text-secondary-500 dark:text-secondary-400 ${className}`} {...props}>
    {children}
  </p>
);

Card.Content = ({ children, className = '', ...props }) => (
  <div className={`${className}`} {...props}>
    {children}
  </div>
);

Card.Actions = ({ children, className = '', align = 'right', ...props }) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  };
  
  return (
    <div className={`flex items-center gap-2 mt-4 ${alignClasses[align]} ${className}`} {...props}>
      {children}
    </div>
  );
};

Card.Footer = ({ children, className = '', ...props }) => (
  <div className={`mt-4 pt-4 border-t border-secondary-200 dark:border-secondary-700 ${className}`} {...props}>
    {children}
  </div>
);

export default Card;