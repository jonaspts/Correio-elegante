import { useState } from "react";
import Home from "./pages/Home";
import Pricing from "./pages/pricing";

export default function App() {
  const [page, setPage] = useState("home");

  return (
    <>
      {page === "home" && <Home goToPricing={() => setPage("pricing")} />}
      {page === "pricing" && <Pricing goToHome={() => setPage("home")} />}
    </>
  );
}