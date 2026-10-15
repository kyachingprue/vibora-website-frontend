import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUp } from 'lucide-react'

/**
 * Appears at the bottom-right once the user scrolls past the hero/banner.
 * On small devices it sits above the fixed bottom navigation.
 */
export default function ScrollToTop({ threshold = 420 }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="to-top"
          type="button"
          aria-label="Scroll to top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          initial={{ opacity: 0, y: 24, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          className="fixed bottom-24 right-4 z-40 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-brand-600 text-white shadow-xl hover:bg-brand-700 md:bottom-8 md:right-8"
        >
          <ArrowUp className="h-6 w-6" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
