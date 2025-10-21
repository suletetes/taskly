import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    x: -20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    x: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    x: 20,
    scale: 0.98
  }
}

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4
}

// Slide transition variants
const slideVariants = {
  initial: {
    x: '100%'
  },
  in: {
    x: 0
  },
  out: {
    x: '-100%'
  }
}

// Fade transition variants
const fadeVariants = {
  initial: {
    opacity: 0
  },
  in: {
    opacity: 1
  },
  out: {
    opacity: 0
  }
}

// Scale transition variants
const scaleVariants = {
  initial: {
    opacity: 0,
    scale: 0.8
  },
  in: {
    opacity: 1,
    scale: 1
  },
  out: {
    opacity: 0,
    scale: 1.2
  }
}

// Page transition wrapper
export const PageTransition = ({ children, variant = 'default' }) => {
  const location = useLocation()
  
  const getVariants = () => {
    switch (variant) {
      case 'slide':
        return slideVariants
      case 'fade':
        return fadeVariants
      case 'scale':
        return scaleVariants
      default:
        return pageVariants
    }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={getVariants()}
        transition={pageTransition}
        style={{ width: '100%', height: '100%' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Stagger animation for lists
export const StaggerContainer = ({ children, staggerDelay = 0.1 }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay
      }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  )
}

// Individual item animation for stagger
export const StaggerItem = ({ children, delay = 0 }) => {
  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20 
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay,
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  }

  return (
    <motion.div variants={itemVariants}>
      {children}
    </motion.div>
  )
}

// Hover animations
export const HoverScale = ({ children, scale = 1.05 }) => (
  <motion.div
    whileHover={{ scale }}
    whileTap={{ scale: 0.95 }}
    transition={{ type: 'spring', stiffness: 300 }}
  >
    {children}
  </motion.div>
)

// Loading animation
export const LoadingDots = () => {
  const dotVariants = {
    initial: { y: 0 },
    animate: { y: -10 }
  }

  const dotTransition = {
    duration: 0.5,
    repeat: Infinity,
    repeatType: 'reverse',
    ease: 'easeInOut'
  }

  return (
    <div className="loading-dots" style={{ display: 'flex', gap: '4px' }}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          variants={dotVariants}
          initial="initial"
          animate="animate"
          transition={{
            ...dotTransition,
            delay: index * 0.1
          }}
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#007bff'
          }}
        />
      ))}
    </div>
  )
}

// Card flip animation
export const FlipCard = ({ children, isFlipped = false }) => {
  const flipVariants = {
    front: { rotateY: 0 },
    back: { rotateY: 180 }
  }

  return (
    <motion.div
      variants={flipVariants}
      animate={isFlipped ? 'back' : 'front'}
      transition={{ duration: 0.6 }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </motion.div>
  )
}

// Slide up animation for modals
export const SlideUpModal = ({ children, isOpen }) => {
  const modalVariants = {
    hidden: {
      y: '100%',
      opacity: 0
    },
    visible: {
      y: 0,
      opacity: 1
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ type: 'spring', damping: 25, stiffness: 500 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PageTransition