import { useEffect, useState } from "react";
import "../manutencao.css";

export default function Manutencao({ goToHome }) {
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    function spawnHeart() {
      const id = Math.random().toString(36).substr(2, 9);
      const newHeart = {
        id,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: 16 + Math.random() * 26,
        char: Math.random() > 0.5 ? "❤" : "♥",
      };
      setHearts((prev) => [...prev, newHeart].slice(-110));
      setTimeout(() => {
        setHearts((prev) => prev.filter((heart) => heart.id !== id));
      }, 5000);
    }
    const interval = setInterval(spawnHeart, 90);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pricing-page">
      <div className="binary-bg" />
      <div className="heart-bg">
        {hearts.map((h) => (
          <span
            key={h.id}
            className="heart"
            style={{ left: `${h.x}px`, top: `${h.y}px`, fontSize: `${h.size}px` }}
          >
            {h.char}
          </span>
        ))}
      </div>

      <main
        className="checkout-shell"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh"
        }}
      >
        <div className="maintenance-card">
          <div className="maintenance-icon">🔧</div>
          <h1>Encerrado</h1>
          <p>
            O prazo de envio das cartas acabou<br />
            Em breve as mensagens serão entregues. 💘
          </p>
          <button
            className="back-btn"
            onClick={() => window.location.href = "https://www.google.com"}
            type="button"
          >
            ← Sair
          </button>
        </div>
      </main>
    </div>
  );
}