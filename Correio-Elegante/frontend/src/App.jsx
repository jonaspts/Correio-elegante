import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import Home from "./pages/home";
import Pricing from "./pages/pricing";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");

  const pageVariants = {
    initial: (direction) => ({
      opacity: 0,
      x: direction === "home" ? -100 : 100,
    }),

    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },

    exit: (direction) => ({
      opacity: 0,
      x: direction === "home" ? 100 : -100,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
      },
    }),
  };

  return (
    <div className="app-container">
      <AnimatePresence mode="wait">
        {currentPage === "home" ? (
          <motion.div
            key="home"
            custom="home"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="page-wrapper"
          >
            <Home goToPricing={() => setCurrentPage("pricing")} />
          </motion.div>
        ) : (
          <motion.div
            key="pricing"
            custom="pricing"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="page-wrapper"
          >
            <Pricing goToHome={() => setCurrentPage("home")} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}