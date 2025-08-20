'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { pageVariants, getAnimationVariants } from '@/lib/animations'

interface PageTransitionProps {
  children: React.ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={getAnimationVariants(pageVariants)}
        initial="initial"
        animate="animate"
        exit="exit"
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
