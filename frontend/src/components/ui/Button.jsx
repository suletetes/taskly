import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm hover:shadow-md',
    secondary: 'bg-secondary-100 text-secondary-900 hover:bg-secondary-200 dark:bg-secondary-800 dark:text-secondary-100 dark:hover:bg-secondary-700 focus:ring-secondary-500',
    outline: 'border border-secondary-300 text-secondary-700 hover:bg-secondary-50 dark:border-secondary-600 dark:text-secondary-300 dark:hover:bg-secondary-800 focus:ring-secondary-500',
    ghost: 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900 dark:text-secondary-400 dark:hover:bg-secondary-800 dark:hover:text-secondary-100 focus:ring-secondary-500',
    danger: 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500 shadow-sm hover:shadow-md',
  };
  
  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-4 py-2 text-base',
    xl: 'px-6 py-3 text-base',
  };
  
  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-5 h-5',
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  const LoadingSpinner = () => (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={`${iconSizes[size]} mr-2`}
    >
      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </motion.div>
  );
  
  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {!loading && leftIcon && (
        <span className={`${iconSizes[size]} mr-2 flex-shrink-0`}>
          {leftIcon}
        </span>
      )}
      <span className="flex-1">{children}</span>
      {!loading && rightIcon && (
        <span className={`${iconSizes[size]} ml-2 flex-shrink-0`}>
          {rightIcon}
        </span>
      )}
    </motion.button>
  );
};

export default Button;