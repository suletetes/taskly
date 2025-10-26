import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

const Input = forwardRef(({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  helperText,
  leftIcon,
  rightIcon,
  disabled = false,
  required = false,
  className = '',
  inputClassName = '',
  id,
  name,
  ...props
}, ref) => {
  const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseInputClasses = 'block w-full px-3 py-2 text-sm bg-white dark:bg-secondary-800 border rounded-lg shadow-sm placeholder-secondary-400 dark:placeholder-secondary-500 focus:outline-none focus:ring-2 transition-colors duration-200';
  
  const inputStates = {
    default: 'border-secondary-300 dark:border-secondary-600 focus:ring-primary-500 focus:border-primary-500',
    error: 'border-error-300 dark:border-error-600 focus:ring-error-500 focus:border-error-500',
    disabled: 'bg-secondary-50 dark:bg-secondary-900 cursor-not-allowed opacity-50',
  };
  
  const getInputState = () => {
    if (disabled) return 'disabled';
    if (error) return 'error';
    return 'default';
  };
  
  const inputClasses = `${baseInputClasses} ${inputStates[getInputState()]} ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} ${inputClassName}`;
  
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1"
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-secondary-400 dark:text-secondary-500 w-4 h-4">
              {leftIcon}
            </span>
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={inputClasses}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <span className="text-secondary-400 dark:text-secondary-500 w-4 h-4">
              {rightIcon}
            </span>
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1"
        >
          {error && (
            <p className="text-sm text-error-600 dark:text-error-400">
              {error}
            </p>
          )}
          {!error && helperText && (
            <p className="text-sm text-secondary-500 dark:text-secondary-400">
              {helperText}
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;