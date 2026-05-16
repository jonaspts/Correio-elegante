import { useEffect, useState } from "react";

export default function Home({ goToPricing = () => { }, goToAdmin = () => { } }) {
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


      <button className="admin-btn" onClick={goToAdmin}>
        Admin
      </button>

      <main className="container">
        {/* HERO */}
        <section className="hero">
          <div className="hero-content">
            <div className="brand-badge">
              <span className="brand-dot" />
              <p>3º anos • Dia dos Namorados 2026</p>
            </div>

            <h1 className="hero-title">Correio Elegante</h1>

            <p className="hero-description">
              Sistema oficial do Dia dos Namorados da ETEMAA.
              Mensagens podem ser enviadas de forma anônima ou identificada,
              organizadas e entregues durante o evento.
            </p>

            <button className="hero-cta-btn" onClick={goToPricing}>
              <span>Ver opções</span>
              <span className="btn-icon">💘</span>
            </button>
          </div>
        </section>

        {/* INFO CARDS */}
        <section className="info-section">
          <div className="info-card info-card-primary">
            <div className="info-header">
              <span className="info-badge">Sistema oficial</span>
            </div>
            <h2 className="info-title">Plataforma do evento</h2>
            <p className="info-text">
              O Sistema pode apresentar instabilidades (devido a alta taxa de Usuários usando) ou falhas pontuais.
              Em caso de qualquer erro ou comportamento inesperado,
              entre em contato imediatamente com os representantes do 3º ano para que o problema seja verificado e resolvido o quanto antes.
            </p>
          </div>

          <div className="info-card info-card-warning">
            <h2 className="info-title">⚠️ Importante</h2>
            <p className="info-text">
              Todas as mensagens passam por análise antes da entrega.
              Conteúdos ofensivos ou fora das regras serão bloqueados
              para manter um ambiente seguro e respeitoso.
            </p>
          </div>
        </section>

        {/* FEATURES */}
        <section className="features-section">
          <div className="section-header">
            <span className="section-tag">Como funciona</span>
            <h2 className="section-title">Não fique com dúvidas</h2>
          </div>

          <div className="features-grid">
            <article className="feature-card feature-card-red">
              <div className="feature-icon">💌</div>
              <h3 className="feature-title">Envio anônimo</h3>
              <p className="feature-text">Você pode enviar mensagens sem revelar sua identidade.</p>
            </article>

            <article className="feature-card feature-card-dark">
              <div className="feature-icon">📋</div>
              <h3 className="feature-title">Organização</h3>
              <p className="feature-text">Todas as mensagens são registradas e separadas por turma</p>
            </article>

            <article className="feature-card feature-card-gold">
              <div className="feature-icon">🎓</div>
              <h3 className="feature-title">Evento escolar</h3>
              <p className="feature-text">Sistema feito exclusivamente para o evento da escola.</p>
            </article>
          </div>
        </section>

        {/* STEPS */}
        <section className="steps-section">
          <div className="section-header">
            <span className="section-tag">Como participar</span>
            <h2 className="section-title">Como enviar sua mensagem</h2>
          </div>

          <div className="steps-grid">
            <article className="step-card">
              <div className="step-number">01</div>
              <h3 className="step-title">Escolha a opção</h3>
              <p className="step-text">Selecione o tipo de envio disponível.</p>
            </article>

            <article className="step-card">
              <div className="step-number">02</div>
              <h3 className="step-title">Preencha os dados</h3>
              <p className="step-text">Nome, turma, destinatário e mensagem.</p>
            </article>

            <article className="step-card">
              <div className="step-number">03</div>
              <h3 className="step-title">Envio automático</h3>
              <p className="step-text">A mensagem é registrada no sistema do evento.</p>
            </article>

            <article className="step-card">
              <div className="step-number">04</div>
              <h3 className="step-title">Entrega final</h3>
              <p className="step-text">As mensagens são entregues no evento.</p>
            </article>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="cta-section">
          <div className="cta-content">
            <span className="cta-tag">Preparado para Escolher?</span>
            <h2 className="cta-title">Participe do Correio Elegante</h2>
            <p className="cta-text">
              Escolha uma opção e envie sua mensagem para participar do evento.
            </p>
            <button className="cta-button" onClick={goToPricing}>
              <span>Ver opções</span>
              <span className="btn-icon">💘</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}