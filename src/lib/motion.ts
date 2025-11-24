import { Variants } from 'framer-motion'

// Enhanced motion variants for premium feel
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 24 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  exit: { 
    opacity: 0, 
    y: -24,
    transition: { duration: 0.3 }
  }
}

export const fadeInScale: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
}

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

export const scaleOnHover: Variants = {
  hover: { 
    scale: 1.03,
    transition: { duration: 0.2, ease: "easeOut" }
  },
  tap: { 
    scale: 0.98,
    transition: { duration: 0.1 }
  }
}

export const liftOnHover: Variants = {
  hover: { 
    y: -8,
    transition: { duration: 0.3, ease: "easeOut" }
  },
  tap: { 
    y: 0,
    transition: { duration: 0.1 }
  }
}

export const glowOnHover: Variants = {
  hover: { 
    boxShadow: '0 0 40px -10px rgba(59, 130, 246, 0.35)',
    borderColor: 'rgba(255,255,255,0.2)',
    transition: { duration: 0.3 }
  }
}

export const cardHover: Variants = {
  hover: {
    y: -8,
    scale: 1.02,
    boxShadow: '0 20px 40px -20px rgba(59, 130, 246, 0.4)',
    borderColor: 'rgba(255,255,255,0.2)',
    transition: { duration: 0.3, ease: "easeOut" }
  }
}

export const buttonHover: Variants = {
  hover: {
    scale: 1.05,
    boxShadow: '0 10px 30px -10px rgba(59, 130, 246, 0.4)',
    transition: { duration: 0.2 }
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 }
  }
}

export const parallaxVariants: Variants = {
  initial: { y: 0 },
  animate: { 
    y: -20,
    transition: { 
      duration: 20, 
      repeat: Infinity, 
      repeatType: "reverse",
      ease: "linear"
    }
  }
}

export const shimmerAnimation = {
  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 2s infinite'
}

export const typewriterVariants: Variants = {
  initial: { width: 0 },
  animate: { 
    width: "100%",
    transition: { 
      duration: 2,
      ease: "easeInOut",
      delay: 0.5
    }
  }
}

export const accordionVariants: Variants = {
  closed: { 
    height: 0,
    opacity: 0,
    transition: { duration: 0.3, ease: "easeInOut" }
  },
  open: { 
    height: "auto",
    opacity: 1,
    transition: { duration: 0.3, ease: "easeInOut" }
  }
}
