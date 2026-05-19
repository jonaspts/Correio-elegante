import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "./lib/supabase";

import Home from "./pages/home";
import Pricing from "./pages/pricing";
import Admin from "./pages/admin";
import Login from "./pages/login";
import manutencao from "./pages/manutencao";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(true);

  // 🔐 pega perfil (role)
  async function fetchProfile(userId) {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    setRole(data?.role || "user");
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      setUser(u);

      if (u) fetchProfile(u.id);

      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const u = session?.user ?? null;
        setUser(u);

        if (u) fetchProfile(u.id);
        else setRole("user");
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const pageVariants = {
    initial: { opacity: 0, x: 80 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.35 } },
    exit: { opacity: 0, x: -80, transition: { duration: 0.25 } },
  };

  if (loading) {
    return (
      <div className="app-container">
        <p style={{ color: "white", textAlign: "center" }}>
          Carregando...
        </p>
      </div>
    );
  }

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
              role={role}
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

        {currentPage === "admin" && role === "admin" && (
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