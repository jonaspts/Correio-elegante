// Home.jsx
import { useEffect, useState } from "react";

export default function Home({ goToPricing = () => {} }) {
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    function spawnHeart() {
      const id = Math.random().toString(36).substr(2, 9);

      const newHeart = {
        id,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: 10 + Math.random() * 20,
        char: Math.random() > 0.5 ? "❤" : "♥",
      };

      setHearts((prev) => {
        const updated = [...prev, newHeart];
        return updated.slice(-120);
      });

      setTimeout(() => {
        setHearts((prev) => prev.filter((h) => h.id !== id));
      }, 5000);
    }

    const interval = setInterval(spawnHeart, 70);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page">
      <div className="binary-bg" />

      {/* corações */}
      <div className="heart-bg">
        {hearts.map((h) => (
          <span
            key={h.id}
            className="heart"
            style={{
              left: `${h.x}px`,
              top: `${h.y}px`,
              fontSize: `${h.size}px`,
            }}
          >
            {h.char}
          </span>
        ))}
      </div>

      <main className="container">
        {/* HERO */}
        <section className="hero">
          <div className="hero-left">
            <span className="badge">
              3 ANOS 2026 • Dia dos Namorados
            </span>

            <h1>Correio Elegante</h1>

            <p className="hero-text">
              Envie mensagens anônimas, divertidas e especiais durante o evento.
              Uma experiência moderna, organizada e elegante para todos os alunos.
            </p>

            <div className="hero-buttons">
              <button className="primary-btn">
                Enviar mensagem
              </button>

              <button
                className="secondary-btn"
                onClick={goToPricing}
              >
                Ver preços
              </button>
            </div>
          </div>

          
        </section>

        {/* tópicos */}
        <section className="topics">
          <div className="topic">
            <h2>Como funciona</h2>
            <p>
              Escolha uma opção, escreva sua mensagem e envie para o destinatário.
              Todo o processo será feito de forma simples e organizada.
            </p>
          </div>

          <div className="topic">
            <h2>Como participar</h2>
            <p>
              Os participantes poderão escolher diferentes tipos de envio e personalização
              para suas mensagens durante o evento.
            </p>
          </div>

          <div className="topic">
            <h2>Privacidade</h2>
            <p>
              As mensagens permanecem anônimas e o sistema prioriza respeito,
              segurança e organização.
            </p>
          </div>
        </section>

        {/* destaque */}
        <section className="highlight">
          <div className="highlight-content">
            <h2>Pronto para participar?</h2>

            <p>
              Confira as opções disponíveis e escolha a melhor forma de enviar sua mensagem.
            </p>
          </div>

          <button
            className="highlight-btn"
            onClick={goToPricing}
          >
            Acessar tabela de preços
          </button>
        </section>
      </main>
    </div>
  );
}