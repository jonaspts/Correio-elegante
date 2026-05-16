import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import Home from "./pages/home";
import Pricing from "./pages/pricing";
import Admin from "./pages/admin";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");

  const pageVariants = {
    initial: {
      opacity: 0,
      x: 80,
    },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.35 },
    },
    exit: {
      opacity: 0,
      x: -80,
      transition: { duration: 0.25 },
    },
  };

  return (
    <div className="app-container">
      <AnimatePresence mode="wait">

        {currentPage === "home" && (
          <motion.div
            key="home"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Home
              goToPricing={() => setCurrentPage("pricing")}
              goToAdmin={() => setCurrentPage("admin")}
            />
          </motion.div>
        )}

        {currentPage === "pricing" && (
          <motion.div
            key="pricing"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Pricing goToHome={() => setCurrentPage("home")} />
          </motion.div>
        )}

        {currentPage === "admin" && (
          <motion.div
            key="admin"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Admin goToHome={() => setCurrentPage("home")} />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}