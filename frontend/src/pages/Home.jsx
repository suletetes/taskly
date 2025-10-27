import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  ChartBarIcon,
  UsersIcon,
  ArrowRightIcon,
  SparklesIcon,
  Bars3Icon,
  XMarkIcon,
  PlayIcon,
  StarIcon,
  ShieldCheckIcon,
  BoltIcon,
  DevicePhoneMobileIcon,
  CloudIcon
} from '@heroicons/react/24/outline';
import { 
  CheckCircleIcon as CheckCircleIconSolid,
  StarIcon as StarIconSolid 
} from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SafeImage from '../components/common/SafeImage';

const Home = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    // Simulate loading users for showcase
    setTimeout(() => {
      setUsers([
        { id: 1, name: 'John Doe', avatar: '/img/placeholder-user.png', tasksCompleted: 145, role: 'Product Manager' },
        { id: 2, name: 'Jane Smith', avatar: '/img/placeholder-user.png', tasksCompleted: 238, role: 'Designer' },
        { id: 3, name: 'Mike Johnson', avatar: '/img/placeholder-user.png', tasksCompleted: 192, role: 'Developer' },
        { id: 4, name: 'Sarah Wilson', avatar: '/img/placeholder-user.png', tasksCompleted: 156, role: 'Marketing Lead' }
      ]);
      setUsersLoading(false);
    }, 1000);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    con
      icon: ChartBarIcon,
      title: 'Analytics',
      description: 'Get detailed reports on your productivity patterns and identify areas for improvement.',
      color: 'text-primary-600'
    },
    {
      icon: UsersIcon,
      title: 'Collaboration',
      description: 'Work together with your team. Share tasks, assign responsibilities, and achieve goals together.',
      color: 'text-warning-600'
    }
  ];

  const navigation = [
    { name: 'Features', href: '#features' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-secondary-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-secondary-900 shadow-sm border-b border-secondary-200 dark:border-secondary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <SparklesIcon className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-xl font-bold text-secondary-900 dark:text-secondary-100">
                  Taskly
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6 space-x-3">
                {user ? (
                  <Link
                    to="/dashboard"
                    className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 p-2"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-secondary-200 dark:border-secondary-700">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
                <div className="pt-4 pb-3 border-t border-secondary-200 dark:border-secondary-700">
                  {user ? (
                    <Link
                      to="/dashboard"
                      className="bg-primary-600 text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-700 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <div className="space-y-2">
                      <Link
                        to="/login"
                        className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/signup"
                        className="bg-primary-600 text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-700 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Get Started
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 to-primary-100 dark:from-secondary-900 dark:to-secondary-800 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <h1 className="text-4xl lg:text-6xl font-bold text-secondary-900 dark:text-secondary-100 mb-6">
                Organize Your
                <span className="text-primary-600 block">Productivity</span>
              </h1>
              <p className="text-xl text-secondary-600 dark:text-secondary-400 mb-8 max-w-lg">
                Transform the way you work with Taskly. Create, organize, and complete tasks with
                an intuitive interface designed for modern productivity.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {user ? (
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
                  >
                    Go to Dashboard
                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/signup"
                      className="inline-flex items-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
                    >
                      Get Started Free
                      <ArrowRightIcon className="w-5 h-5 ml-2" />
                    </Link>
                    <Link
                      to="/login"
                      className="inline-flex items-center px-8 py-4 border-2 border-primary-600 text-primary-600 font-semibold rounded-lg hover:bg-primary-600 hover:text-white transition-colors"
                    >
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10">
                <SafeImage
                  src="/img/task--main.jpg"
                  fallbackSrc="/img/placeholder-user.png"
                  className="w-full h-auto rounded-2xl shadow-2xl"
                  alt="Taskly Dashboard Preview"
                  width="600"
                  height="400"
                />
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary-200 rounded-full opacity-20"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-secondary-200 rounded-full opacity-20"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section id="about" className="py-20 bg-white dark:bg-secondary-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <SparklesIcon className="w-12 h-12 text-primary-600 mx-auto mb-6" />
            <blockquote className="text-2xl lg:text-3xl font-medium text-secondary-700 dark:text-secondary-300 mb-8 italic">
              "It is not that we have a short time to live, but that we waste a lot of it.
              Life is long enough if it were all well invested."
            </blockquote>
            <cite className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
              — Seneca
            </cite>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-secondary-50 dark:bg-secondary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">
              Everything You Need to Stay Productive
            </h2>
            <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto">
              Powerful features designed to help you organize your work and achieve your goals faster.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-secondary-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className={`w-12 h-12 ${feature.color} mb-4`}>
                    <Icon className="w-full h-full" />
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-secondary-600 dark:text-secondary-400">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Users Section */}
      <section className="py-20 bg-white dark:bg-secondary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">
              Join Our Productive Community
            </h2>
            <p className="text-xl text-secondary-600 dark:text-secondary-400">
              See what our users are accomplishing with Taskly
            </p>
          </motion.div>

          {usersLoading ? (
            <div className="flex justify-center">
              <LoadingSpinner size="medium" />
            </div>
          ) : users && users.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {users.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-secondary-50 dark:bg-secondary-800 rounded-xl p-6 text-center"
                >
                  <SafeImage
                    src={user.avatar}
                    fallbackSrc="/img/placeholder-user.png"
                    className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
                    alt={user.name}
                    width="64"
                    height="64"
                  />
                  <h3 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                    {user.name}
                  </h3>
                  <p className="text-secondary-600 dark:text-secondary-400 text-sm">
                    {user.tasksCompleted} tasks completed
                  </p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-xl text-secondary-500 dark:text-secondary-400">
                No users found. Be the first to join Taskly!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Productivity?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Join thousands of users who have already improved their workflow with Taskly.
            </p>
            {!user && (
              <Link
                to="/signup"
                className="inline-flex items-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition-colors shadow-lg hover:shadow-xl"
              >
                Start Your Free Trial
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-secondary-900 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <SparklesIcon className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-xl font-bold text-white">
                  Taskly
                </span>
              </div>
              <p className="text-secondary-400 mb-4 max-w-md">
                Transform the way you work with Taskly. Create, organize, and complete tasks with
                an intuitive interface designed for modern productivity.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="text-secondary-400 hover:text-primary-400 transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#about" className="text-secondary-400 hover:text-primary-400 transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <Link to="/login" className="text-secondary-400 hover:text-primary-400 transition-colors">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="text-secondary-400 hover:text-primary-400 transition-colors">
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <ul className="space-y-2">
                <li className="text-secondary-400">
                  support@taskly.com
                </li>
                <li className="text-secondary-400">
                  1-800-TASKLY
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-secondary-800 mt-8 pt-8 text-center">
            <p className="text-secondary-400">
              © 2024 Taskly. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;