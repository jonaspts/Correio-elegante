import { useEffect, useState } from "react";
import "../App.css";

export default function Pricing({ goToHome }) {
  const [hearts, setHearts] = useState([]);
  const [selected, setSelected] = useState(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [lastSend, setLastSend] = useState(0);

  const [senderType, setSenderType] = useState("anonimo");
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [fileName, setFileName] = useState("");

  const plans = [
    {
      id: "p1",
      emoji: "💌",
      title: "Mensagem Simples",
      price: "R$ 2,00",
      desc: "!!A ser decidido!!",
    },
    {
      id: "p2",
      emoji: "❤️",
      title: "Mensagem Premium",
      price: "R$ 4,00",
      desc: "!!A ser decidido!!",
    },
    {
      id: "p3",
      emoji: "🎁",
      title: "Combo Especial",
      price: "R$ 6,00",
      desc: "!!A ser decidido!!",
    },
    {
      id: "p4",
      emoji: "🔥",
      title: "Ultra Destaque",
      price: "R$ 10,00",
      desc: "!!A ser decidido!!",
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    const now = Date.now();

    if (loading) return;

    if (now - lastSend < 5000) {
      alert("Espere alguns segundos antes de enviar novamente");
      return;
    }

    const receiverName = document.querySelector(
      'input[placeholder="Nome da pessoa"]'
    )?.value;

    const message = document.querySelector("textarea")?.value;

    const senderNameInput = document.querySelector(
      'input[placeholder="Digite seu nome"]'
    )?.value;

    if (!selected) {
      alert("Escolha uma opção antes de enviar");
      return;
    }

    if (!receiverName || !message) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    if (senderType === "identificado" && !senderNameInput) {
      alert("Digite seu nome");
      return;
    }

    if (paymentMethod === "pix" && !fileName) {
      alert("Envie o comprovante do Pix");
      return;
    }

    const payload = {
      senderType,
      senderName: senderType === "identificado" ? senderNameInput : "Anônimo",
      receiverName,
      plan: selected.title,
      message,
      paymentMethod,
    };

    try {
      setLoading(true);

      const res = await fetch("https://SEU-BACKEND.onrender.com/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseText = await res.text();
      let responseData = null;

      try {
        responseData = responseText ? JSON.parse(responseText) : null;
      } catch {
        responseData = null;
      }

      if (!res.ok) {
        throw new Error(responseData?.error || "Erro no backend");
      }

      setSuccess(true);
      setLastSend(now);

      setTimeout(() => {
        setSuccess(false);
      }, 3000);

      setSelected(null);
      setFileName("");
      setSenderType("anonimo");
      setPaymentMethod("pix");

      const nameInput = document.querySelector(
        'input[placeholder="Digite seu nome"]'
      );
      if (nameInput) nameInput.value = "";

      const receiverInput = document.querySelector(
        'input[placeholder="Nome da pessoa"]'
      );
      if (receiverInput) receiverInput.value = "";

      const textarea = document.querySelector("textarea");
      if (textarea) textarea.value = "";
    } catch (err) {
      console.error(err);
      alert("Backend não está rodando");
    } finally {
      setLoading(false);
    }
  };

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

      {loading && (
        <div className="loading-overlay">
          <div className="loading-box">
            <div className="spinner" />
            <h2>Enviando pedido...</h2>
            <p>Aguarde um momento 💘</p>
          </div>
        </div>
      )}

      {success && (
        <div className="success-overlay">
          <div className="success-box">
            <h2>💘 Pedido enviado!</h2>
            <p>Seu correio elegante foi registrado com sucesso.</p>
          </div>
        </div>
      )}

      <main className="pricing-container">
        <button className="back-btn" onClick={goToHome} type="button">
          ← Voltar
        </button>

        <section className="pricing-hero">
          <span className="badge">💘 Correio Elegante • 3 anos 2026</span>

          <h1>Tabela de Opções</h1>

          <p>
            Escolha uma opção, preencha os dados e participe do Correio Elegante
            da escola.
          </p>
        </section>

        <section className="plans-grid">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={`plan-card ${
                selected?.id === plan.id ? "selected" : ""
              }`}
            >
              <div className="plan-top">
                <span className="plan-emoji">{plan.emoji}</span>
                <span className="plan-price">{plan.price}</span>
              </div>

              <h2>{plan.title}</h2>
              <p>{plan.desc}</p>

              <button
                type="button"
                className="select-btn"
                onClick={() => setSelected(plan)}
                disabled={loading}
              >
                Escolher opção
              </button>
            </article>
          ))}
        </section>

        {selected && (
          <section className="form-wrapper">
            <div className="form-card">
              <div className="form-header">
                <span className="selected-emoji">{selected.emoji}</span>

                <div>
                  <p className="form-small">Produto escolhido</p>
                  <h2>{selected.title}</h2>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="radio-group">
                  <label
                    className={`radio-option ${
                      senderType === "identificado" ? "active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="tipo"
                      value="identificado"
                      checked={senderType === "identificado"}
                      onChange={(e) => setSenderType(e.target.value)}
                    />
                    Nome identificado
                  </label>

                  <label
                    className={`radio-option ${
                      senderType === "anonimo" ? "active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="tipo"
                      value="anonimo"
                      checked={senderType === "anonimo"}
                      onChange={(e) => setSenderType(e.target.value)}
                    />
                    Anônimo
                  </label>
                </div>

                {senderType === "identificado" && (
                  <div className="input-group">
                    <label>Seu nome</label>
                    <input type="text" placeholder="Digite seu nome" />
                  </div>
                )}

                <div className="input-group">
                  <label>Para quem será enviado</label>
                  <input type="text" placeholder="Nome da pessoa" />
                </div>

                <div className="double-input">
                  <div className="input-group">
                    <label>Turma</label>
                    <input type="text" placeholder="Ex: 2ºB" />
                  </div>
                </div>

                <div className="input-group">
                  <label>Mensagem</label>
                  <textarea rows="5" placeholder="Escreva sua mensagem..." />
                </div>

                <div className="payment-box">
                  <h3>💳 Forma de pagamento</h3>

                  <div className="payment-options">
                    <label
                      className={`payment-option ${
                        paymentMethod === "pix" ? "active" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="pix"
                        checked={paymentMethod === "pix"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      Pix
                    </label>

                    <label
                      className={`payment-option ${
                        paymentMethod === "especie" ? "active" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="especie"
                        checked={paymentMethod === "especie"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      Em espécie
                    </label>
                  </div>

                  {paymentMethod === "pix" && (
                    <div className="pix-box">
                      <h3>💘 Chave Pix</h3>
                      <span>Pagamento online</span>

                      <div className="pix-key">
                        correioeleganteetemaa@gmail.com
                      </div>

                      <p className="pix-warning">
                        Após realizar o pagamento, envie o comprovante abaixo.
                      </p>

                      <label className="upload-area">
                        <input
                          type="file"
                          onChange={(e) =>
                            setFileName(
                              e.target.files[0] ? e.target.files[0].name : ""
                            )
                          }
                        />

                        <div>
                          <strong>
                            {fileName
                              ? "📎 " + fileName
                              : "Clique para enviar o comprovante"}
                          </strong>
                          <p>PNG, JPG ou PDF</p>
                        </div>
                      </label>
                    </div>
                  )}

                  {paymentMethod === "especie" && (
                    <div className="cash-box">
                      <h3>💵 Pagamento em espécie</h3>
                      <p>
                        O pagamento deverá ser entregue presencialmente para os
                        representantes dos 3 anos.
                      </p>
                    </div>
                  )}
                </div>

                <button type="submit" className="confirm-btn" disabled={loading}>
                  {loading ? "Enviando..." : "Confirmar pedido 💘"}
                </button>
              </form>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}