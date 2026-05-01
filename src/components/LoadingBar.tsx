'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useIsFetching } from '@tanstack/react-query'

export function LoadingBar() {
  const isFetching = useIsFetching()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isFetching > 0) {
      setShow(true)
    } else {
      const timer = setTimeout(() => setShow(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isFetching])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100] h-1 bg-blue-100"
        >
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, ease: 'easeInOut' }}
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600"
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
