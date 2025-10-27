import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  CheckIcon,
  CalendarIcon,
  ChartBarIcon,
  UsersIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline';
import { Button } from '../ui';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Navigation = ({ onSearchOpen, onQuickAction }) => {
  const { user } = useAuth();
  const { theme, toggleTheme, getThemeIcon, getThemeLabel, isDark } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Tasks', href: '/tasks', icon: CheckIcon },
    { name: 'Calendar', href: '/calendar', icon: CalendarIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
    { name: 'Teams', href: '/teams', icon: UsersIcon },
    { name: 'Settings', href: '/settings', icon: CogIcon },
  ];
  
  const isActive = (href) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };
  
  const NavItem = ({ item, mobile = false }) => {
    const active = isActive(item.href);
    const Icon = item.icon;
    
    const baseClasses = mobile
      ? 'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200'
      : 'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200';
    
    const activeClasses = active
      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
      : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900 dark:text-secondary-400 dark:hover:bg-secondary-800 dark:hover:text-secondary-100';
    
    return (
      <Link
        to={item.href}
        className={`${baseClasses} ${activeClasses}`}
        onClick={() => mobile && setIsMobileMenuOpen(false)}
      >
        <Icon className={`${mobile ? 'w-5 h-5' : 'w-4 h-4'} mr-3 flex-shrink-0`} />
        {item.name}
        {active && (
          <motion.div
            layoutId="activeIndicator"
            className="ml-auto w-2 h-2 bg-primary-600 rounded-full"
          />
        )}
      </Link>
    );
  };
  
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-secondary-200 lg:dark:border-secondary-700 lg:bg-white lg:dark:bg-secondary-900">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-6 py-4 border-b border-secondary-200 dark:border-secondary-700">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <CheckIcon className="w-5 h-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-secondary-900 dark:text-secondary-100">
                Taskly
              </span>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </nav>
          
          {/* User Profile & Theme Toggle */}
          <div className="flex-shrink-0 p-4 border-t border-secondary-200 dark:border-secondary-700">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                leftIcon={
                  getThemeIcon() === 'sun' ? <SunIcon className="w-4 h-4" /> :
                  getThemeIcon() === 'moon' ? <MoonIcon className="w-4 h-4" /> :
                  <ComputerDesktopIcon className="w-4 h-4" />
                }
              >
                {getThemeLabel()}
              </Button>
            </div>
            
            {user && (
              <Link to="/profile" className="flex items-center hover:bg-secondary-50 dark:hover:bg-secondary-800 rounded-lg p-2 transition-colors">
                <img
                  className="w-8 h-8 rounded-full"
                  src={user.avatar || '/img/placeholder-user.png'}
                  alt={user.fullname}
                />
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100 truncate">
                    {user.fullname}
                  </p>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 truncate">
                    @{user.username}
                  </p>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-secondary-900 border-b border-secondary-200 dark:border-secondary-700">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <CheckIcon className="w-5 h-5 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold text-secondary-900 dark:text-secondary-100">
              Taskly
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              leftIcon={
                getThemeIcon() === 'sun' ? <SunIcon className="w-4 h-4" /> :
                getThemeIcon() === 'moon' ? <MoonIcon className="w-4 h-4" /> :
                <ComputerDesktopIcon className="w-4 h-4" />
              }
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              leftIcon={isMobileMenuOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
            />
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white dark:bg-secondary-900 border-b border-secondary-200 dark:border-secondary-700"
          >
            <nav className="px-4 py-4 space-y-1">
              {navigationItems.map((item) => (
                <NavItem key={item.name} item={item} mobile />
              ))}
              
              {user && (
                <div className="pt-4 mt-4 border-t border-secondary-200 dark:border-secondary-700">
                  <Link 
                    to="/profile" 
                    className="flex items-center px-4 py-3 hover:bg-secondary-50 dark:hover:bg-secondary-800 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <img
                      className="w-10 h-10 rounded-full"
                      src={user.avatar || '/img/placeholder-user.png'}
                      alt={user.fullname}
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                        {user.fullname}
                      </p>
                      <p className="text-xs text-secondary-500 dark:text-secondary-400">
                        @{user.username}
                      </p>
                    </div>
                  </Link>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-secondary-900 border-t border-secondary-200 dark:border-secondary-700 z-50">
        <nav className="flex">
          {navigationItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex-1 flex flex-col items-center py-2 px-1 text-xs transition-colors duration-200 ${
                  active
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-secondary-500 dark:text-secondary-400'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="truncate">{item.name}</span>
                {active && (
                  <motion.div
                    layoutId="mobileActiveIndicator"
                    className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary-600 rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default Navigation;