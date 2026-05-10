import { useState } from "react";

export default function Pricing({ goToHome }) {
  const [selected, setSelected] = useState(null);

  const plans = [
    {
      id: 1,
      title: "💌 Mensagem Simples",
      desc: "Envio básico de mensagem anônima durante o evento.",
      price: "R$ 2,00",
    },
    {
      id: 2,
      title: "💖 Mensagem Especial",
      desc: "Mensagem com destaque e prioridade na entrega.",
      price: "R$ 4,00",
    },
    {
      id: 3,
      title: "🔥 Mensagem Premium",
      desc: "Mensagem personalizada com efeito especial no sistema.",
      price: "R$ 6,00",
    },
    {
      id: 4,
      title: "👑 Mensagem VIP",
      desc: "Máxima prioridade + destaque + entrega diferenciada.",
      price: "R$ 10,00",
    },
  ];

  return (
    <div className="pricing-page">

      {/* fundo reutilizado */}
      <div className="binary-bg" />
      <div className="heart-bg" />

      <div className="container">

        {/* topo */}
        <div className="pricing-header">

          <h1>💌 Tabela de Preços</h1>

          <p>
            Escolha o tipo de mensagem ideal para participar do Correio Elegante.
            Cada opção oferece uma experiência diferente dentro do evento.
          </p>

          <button className="back-btn" onClick={goToHome}>
            ⬅ Voltar
          </button>

        </div>

        {/* cards */}
        <div className="pricing-grid">

          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`pricing-card ${selected === plan.id ? "active" : ""}`}
              onClick={() => setSelected(plan.id)}
            >

              <h2>{plan.title}</h2>

              <p>{plan.desc}</p>

              <span className="price">{plan.price}</span>

              <button className="select-btn">
                Escolher esse 💘
              </button>

            </div>
          ))}

        </div>

      </div>
    </div>
  );
}