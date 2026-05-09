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

        {/* HERO CENTRAL */}
        <section className="hero">

          <div className="hero-left">

            <span className="badge">
              3 ANOS 2026 • Dia dos Namorados
            </span>

            <h1>Correio Elegante</h1>

            <p className="hero-text">
              !!"A SER ADICIONADO"!!
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor dolore magna aliqua.
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris modo consequa"
            </p>

          </div>

        </section>

        {/* CARDS */}
        <section className="topics">

          <div className="topic topic-red">
            <h2>Como funciona</h2>
            <p>!!"A SER ADICIONADO"!!
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor dolore magna aliqua.
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris modo consequa"
            </p>
          </div>

          <div className="topic topic-dark">
            <h2>Como participar</h2>
            <p>!!"A SER ADICIONADO"!!
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor dolore magna aliqua.
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris modo consequa"</p>
          </div>

          <div className="topic topic-gold">
            <h2>Importante</h2>
            <p>!!"A SER ADICIONADO"!!
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor dolore magna aliqua.
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris modo consequa"</p>
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

          <button className="highlight-btn">
            Acessar tabela de preços
          </button>

        </section>

      </main>
    </div>
  );
}