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
    <div className="page">
      <div className="binary-bg" />

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
          <div className="hero-copy">

            <div className="brand">
              <span className="brand-dot" />
              <p>3º anos • Dia dos Namorados 2026</p>
            </div>

            <h1>Correio Elegante</h1>

            <p className="hero-text">
              Sistema oficial do Dia dos Namorados da ETEMAA.
              Mensagens podem ser enviadas de forma anônima ou identificada,
              organizadas e entregues durante o evento.
            </p>

          </div>

          <aside className="hero-panel">

            <div className="glass-card big-card">
              <span className="mini-badge">Sistema oficial</span>

              <h2>Plataforma do evento</h2>

              <p>
                O Sistema pode apresentar instabilidades (devido a alta taxa de Usuários usando) ou falhas pontuais.
                Em caso de qualquer erro ou comportamento inesperado,
                entre em contato imediatamente com os representantes do 3º ano para que o problema seja verificado e resolvido o quanto antes.
              </p>
            </div>

            <div className="glass-card mini-card warning-card">
              <h2>⚠️ Importante ⚠️</h2>
              <h3>Todas as mensagens passam por análise antes da entrega.
                Conteúdos ofensivos ou fora das regras serão bloqueados
                para manter um ambiente seguro e respeitoso.</h3>
            </div>

          </aside>
        </section>

        {/* FEATURES */}
        <section className="section">
          <div className="section-heading">
            <span>Como funciona</span>
            <h2>Não fique com dúvidas</h2>
          </div>

          <div className="feature-grid">

            <article className="feature feature-red">
              <h3>Envio anônimo</h3>
              <p>Você pode enviar mensagens sem revelar sua identidade.</p>
            </article>

            <article className="feature feature-dark">
              <h3>Organização</h3>
              <p>Todas as mensagens são registradas e separadas por destino.</p>
            </article>

            <article className="feature feature-gold">
              <h3>Evento escolar</h3>
              <p>Sistema feito exclusivamente para o evento da escola.</p>
            </article>

          </div>
        </section>

        {/* STEPS */}
        <section className="section">
          <div className="section-heading">
            <span>COMO PARTICIPAR</span>
            <h2>Como enviar sua mensagem</h2>
          </div>

          <div className="steps-grid">

            <article className="step-card">
              <span className="step-number">01</span>
              <h3>Escolha a opção</h3>
              <p>Selecione o tipo de envio disponível.</p>
            </article>

            <article className="step-card">
              <span className="step-number">02</span>
              <h3>Preencha os dados</h3>
              <p>Nome, turma, destinatário e mensagem.</p>
            </article>

            <article className="step-card">
              <span className="step-number">03</span>
              <h3>Envio automático</h3>
              <p>A mensagem é registrada no sistema do evento.</p>
            </article>

            <article className="step-card">
              <span className="step-number">04</span>
              <h3>Entrega final</h3>
              <p>As mensagens são entregues no evento.</p>
            </article>

          </div>
        </section>

        {/* CTA */}
        <section className="cta-strip">
          <div>
            <span className="cta-label">Preparado para Escolher?</span>
            <h2>Participe do Correio Elegante</h2>
            <p>
              Escolha uma opção e envie sua mensagem para participar do evento.
            </p>
          </div>

          <button className="cta-btn" onClick={goToPricing}>
            Ver opções 💘
          </button>
        </section>

      </main>
    </div>
  );
}