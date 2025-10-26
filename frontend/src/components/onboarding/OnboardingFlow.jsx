import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  XMarkIcon,
  SparklesIcon,
  CheckSquareIcon,
  ChartBarIcon,
  UsersIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Taskly!',
    description: 'Let\'s get you set up with everything you need to boost your productivity.',
    icon: SparklesIcon,
    content: 'WelcomeStep'
  },
  {
    id: 'profile',
    title: 'Complete Your Profile',
    description: 'Tell us a bit about yourself to personalize your experience.',
    icon: CheckSquareIcon,
    content: 'ProfileStep'
  },
  {
    id: 'preferences',
    title: 'Set Your Preferences',
    description: 'Customize Taskly to match your workflow and style.',
    icon: CogIcon,
    content: 'PreferencesStep'
  },
  {
    id: 'first-task',
    title: 'Create Your First Task',
    description: 'Let\'s start with creating your first task to get familiar with the interface.',
    icon: CheckSquareIcon,
    content: 'FirstTaskStep'
  },
  {
    id: 'features',
    title: 'Explore Key Features',
    description: 'Discover the powerful features that will help you stay organized.',
    icon: ChartBarIcon,
    content: 'FeaturesStep'
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'Welcome to your new productivity hub. Let\'s get started!',
    icon: CheckIcon,
    content: 'CompleteStep'
  }
];

// Welcome Step Component
const WelcomeStep = ({ onNext }) => (
  <div className="text-center">
    <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
      <SparklesIcon className="w-12 h-12 text-white" />
    </div>
    
    <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">
      Welcome to Taskly!
    </h2>
    
    <p className="text-secondary-600 dark:text-secondary-400 mb-8 max-w-md mx-auto">
      We're excited to help you organize your tasks, boost your productivity, and achieve your goals. 
      This quick setup will take just a few minutes.
    </p>
    
    <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
      <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-4">
        <CheckSquareIcon className="w-6 h-6 text-primary-600 mx-auto mb-2" />
        <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100">Task Management</p>
      </div>
      <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-4">
        <ChartBarIcon className="w-6 h-6 text-primary-600 mx-auto mb-2" />
        <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100">Analytics</p>
      </div>
      <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-4">
        <UsersIcon className="w-6 h-6 text-primary-600 mx-auto mb-2" />
        <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100">Collaboration</p>
      </div>
      <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-4">
        <CogIcon className="w-6 h-6 text-primary-600 mx-auto mb-2" />
        <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100">Customization</p>
      </div>
    </div>
    
    <Button onClick={onNext} size="lg" className="w-full max-w-xs">
      Let's Get Started
      <ArrowRightIcon className="w-4 h-4 ml-2" />
    </Button>
  </div>
);

// Profile Step Component
const ProfileStep = ({ onNext, onPrev }) => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    jobTitle: user?.jobTitle || '',
    company: user?.company || '',
    timezone: user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUser(formData);
    onNext();
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckSquareIcon className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
          Complete Your Profile
        </h2>
        <p className="text-secondary-600 dark:text-secondary-400">
          Help us personalize your experience
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-secondary-100"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
            Job Title
          </label>
          <input
            type="text"
            value={formData.jobTitle}
            onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
            className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-secondary-100"
            placeholder="e.g. Product Manager"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
            Company
          </label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-secondary-100"
            placeholder="Enter your company name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
            Timezone
          </label>
          <select
            value={formData.timezone}
            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
            className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-secondary-100"
          >
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Europe/London">London</option>
            <option value="Europe/Paris">Paris</option>
            <option value="Asia/Tokyo">Tokyo</option>
          </select>
        </div>

        <div className="flex space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onPrev} className="flex-1">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button type="submit" className="flex-1">
            Continue
            <ArrowRightIcon className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </form>
    </div>
  );
};

// Preferences Step Component
const PreferencesStep = ({ onNext, onPrev }) => {
  const [preferences, setPreferences] = useState({
    theme: 'system',
    notifications: {
      email: true,
      push: true,
      desktop: true
    },
    workingHours: {
      start: '09:00',
      end: '17:00'
    },
    weekStart: 'monday'
  });

  const handleSubmit = () => {
    // Save preferences
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    onNext();
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CogIcon className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
          Set Your Preferences
        </h2>
        <p className="text-secondary-600 dark:text-secondary-400">
          Customize Taskly to match your workflow
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-3">
            Theme Preference
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['light', 'dark', 'system'].map((theme) => (
              <button
                key={theme}
                type="button"
                onClick={() => setPreferences({ ...preferences, theme })}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  preferences.theme === theme
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-secondary-200 dark:border-secondary-600 hover:border-secondary-300'
                }`}
              >
                <div className="text-sm font-medium capitalize">{theme}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-3">
            Notifications
          </label>
          <div className="space-y-2">
            {Object.entries(preferences.notifications).map(([key, value]) => (
              <label key={key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    notifications: {
                      ...preferences.notifications,
                      [key]: e.target.checked
                    }
                  })}
                  className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-secondary-700 dark:text-secondary-300 capitalize">
                  {key} notifications
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-3">
            Working Hours
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-secondary-500 mb-1">Start</label>
              <input
                type="time"
                value={preferences.workingHours.start}
                onChange={(e) => setPreferences({
                  ...preferences,
                  workingHours: {
                    ...preferences.workingHours,
                    start: e.target.value
                  }
                })}
                className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-secondary-100"
              />
            </div>
            <div>
              <label className="block text-xs text-secondary-500 mb-1">End</label>
              <input
                type="time"
                value={preferences.workingHours.end}
                onChange={(e) => setPreferences({
                  ...preferences,
                  workingHours: {
                    ...preferences.workingHours,
                    end: e.target.value
                  }
                })}
                className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-secondary-100"
              />
            </div>
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <Button variant="outline" onClick={onPrev} className="flex-1">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleSubmit} className="flex-1">
            Continue
            <ArrowRightIcon className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Complete Step Component
const CompleteStep = ({ onComplete }) => (
  <div className="text-center">
    <div className="w-24 h-24 bg-gradient-to-br from-success-500 to-success-600 rounded-full flex items-center justify-center mx-auto mb-6">
      <CheckIcon className="w-12 h-12 text-white" />
    </div>
    
    <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">
      You're All Set!
    </h2>
    
    <p className="text-secondary-600 dark:text-secondary-400 mb-8 max-w-md mx-auto">
      Welcome to your new productivity hub! You can always change these settings later in your profile.
    </p>
    
    <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-6 mb-8 max-w-md mx-auto">
      <h3 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-3">
        Quick Tips to Get Started:
      </h3>
      <ul className="text-sm text-secondary-600 dark:text-secondary-400 space-y-2 text-left">
        <li>• Create your first task using the "+" button</li>
        <li>• Explore different views: List, Board, Calendar</li>
        <li>• Set up your first project to organize tasks</li>
        <li>• Check out the Analytics page for insights</li>
      </ul>
    </div>
    
    <Button onClick={onComplete} size="lg" className="w-full max-w-xs">
      Start Using Taskly
      <ArrowRightIcon className="w-4 h-4 ml-2" />
    </Button>
  </div>
);

// Main Onboarding Flow Component
const OnboardingFlow = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [isVisible, setIsVisible] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useLocalStorage('hasCompletedOnboarding', false);

  // Don't show onboarding if already completed
  if (hasCompletedOnboarding) {
    return null;
  }

  const currentStepData = ONBOARDING_STEPS[currentStep];

  const handleNext = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setHasCompletedOnboarding(true);
    setIsVisible(false);
    if (onComplete) {
      onComplete();
    }
  };

  const handleSkip = () => {
    setHasCompletedOnboarding(true);
    setIsVisible(false);
    if (onComplete) {
      onComplete();
    }
  };

  const renderStepContent = () => {
    switch (currentStepData.content) {
      case 'WelcomeStep':
        return <WelcomeStep onNext={handleNext} />;
      case 'ProfileStep':
        return <ProfileStep onNext={handleNext} onPrev={handlePrev} />;
      case 'PreferencesStep':
        return <PreferencesStep onNext={handleNext} onPrev={handlePrev} />;
      case 'CompleteStep':
        return <CompleteStep onComplete={handleComplete} />;
      default:
        return <div>Step content not found</div>;
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white dark:bg-secondary-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-secondary-200 dark:border-secondary-700">
            <div className="flex items-center space-x-4">
              <div className="flex space-x-1">
                {ONBOARDING_STEPS.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStep
                        ? 'bg-primary-600'
                        : completedSteps.has(index)
                        ? 'bg-success-500'
                        : 'bg-secondary-300 dark:bg-secondary-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-secondary-500 dark:text-secondary-400">
                Step {currentStep + 1} of {ONBOARDING_STEPS.length}
              </span>
            </div>
            
            <button
              onClick={handleSkip}
              className="text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          {currentStep < ONBOARDING_STEPS.length - 1 && (
            <div className="px-6 pb-6">
              <button
                onClick={handleSkip}
                className="text-sm text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300 transition-colors"
              >
                Skip onboarding
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingFlow;