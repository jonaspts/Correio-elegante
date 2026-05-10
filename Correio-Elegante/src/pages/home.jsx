import { useEffect, useState } from "react";

export default function Home() {
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    function spawnHeart() {
      const id = Math.random().toString(36).substr(2, 9);

      setHearts((prev) => [
        ...prev,
        {
          id,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: 20 + Math.random() * 40,
          char: Math.random() > 0.5 ? "❤" : "♥",
        },
      ].slice(-110));

      setTimeout(() => {
        setHearts((prev) =>
          prev.filter((heart) => heart.id !== id)
        );
      }, 5000);
    }

    const interval = setInterval(spawnHeart, 10);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page">

      {/* fundo */}
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

      {/* conteúdo */}
      <main className="container">

        {/* HERO */}
        <section className="hero">

          <div className="hero-left">

            <span className="badge">
              3 ANOS 2026 • Dia dos Namorados
            </span>

            <h1>Correio Elegante</h1>

            <p className="hero-text">
              !!"A SER ADICIONADO"!!
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>

          </div>

        </section>

        {/* TOPICS */}
        <section className="topics">

          {/* COMO FUNCIONA */}
          <div className="topic topic-red steps">

            <h2>Como funciona</h2>

            <div className="steps-grid">

              <div className="step">
                <span>1</span>
                <p>Escolha o tipo de mensagem</p>
              </div>

              <div className="step">
                <span>2</span>
                <p>Escreva sua mensagem anônima</p>
              </div>

              <div className="step">
                <span>3</span>
                <p>Envie pelo sistema do evento</p>
              </div>

              <div className="step">
                <span>4</span>
                <p>A mensagem será entregue no dia</p>
              </div>

            </div>

          </div>

          {/* COMO PARTICIPAR */}
          <div className="topic topic-dark">

            <h2>Como participar</h2>

            <p>
              !!"A SER ADICIONADO"!!
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Sed do eiusmod tempor incididunt ut labore.
            </p>

          </div>

          {/* IMPORTANTE */}
          <div className="topic topic-gold">

            <h2>Importante</h2>

            <p>
              !!"A SER ADICIONADO"!!
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Sed do eiusmod tempor incididunt ut labore.
            </p>

          </div>

        </section>

        {/* HIGHLIGHT */}
        <section className="highlight">

          <div className="highlight-content">

            <h2>Pronto para participar?</h2>

            <p>
              Confira as opções disponíveis e escolha a melhor forma de enviar sua mensagem.
            </p>

          </div>

          <button className="highlight-btn">
            Acessar tabela de preços
          </button>

        </section>

      </main>
    </div>
  );
}