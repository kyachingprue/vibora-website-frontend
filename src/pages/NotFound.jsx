import { Link } from "react-router";
import { motion } from "motion/react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <SEO title="Page not found" />
      <motion.h1 initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }} className="bg-gradient-to-br from-violet-600 to-pink-500 bg-clip-text text-8xl font-black text-transparent">
        404
      </motion.h1>
      <p className="mt-3 text-lg font-semibold text-black dark:text-white">This page doesn't exist.</p>
      <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">The link may be broken or the page may have moved.</p>
      <Button asChild><Link to="/">Back to home</Link></Button>
    </div>
  );
}
