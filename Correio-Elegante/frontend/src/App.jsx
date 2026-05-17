import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "./lib/supabase";

import Home from "./pages/home";
import Pricing from "./pages/pricing";
import Admin from "./pages/admin";
import Login from "./pages/login";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔐 pega sessão inicial
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // 🔄 escuta mudanças (login/logout/Google login)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const pageVariants = {
    initial: { opacity: 0, x: 80 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.35 } },
    exit: { opacity: 0, x: -80, transition: { duration: 0.25 } },
  };

  // ⏳ loading inicial (evita piscar login errado)
  if (loading) {
    return (
      <div className="app-container">
        <p style={{ color: "white", textAlign: "center" }}>Carregando...</p>
      </div>
    );
  }

  // 🔐 BLOQUEIO: não logado → Login
  if (!user) {
    return (
      <div className="app-container">
        <AnimatePresence mode="wait">
          <motion.div
            key="login"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Login />
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // 🚀 LOGADO → APP NORMAL
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
              user={user}
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