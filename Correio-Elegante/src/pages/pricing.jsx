import { useEffect, useState } from "react";
import "../App.css";

export default function Pricing({ goToHome }) {
  const [hearts, setHearts] = useState([]);
  const [selected, setSelected] = useState(null);

  const [senderType, setSenderType] = useState("anonimo");
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [fileName, setFileName] = useState("");

  const plans = [
    {
      emoji: "💌",
      title: "opção",
      price: "R$ 2,00",
      desc: "!!A ser decidido!!",
    },
    {
      emoji: "❤️",
      title: "opção",
      price: "R$ 4,00",
      desc: "!!A ser decidido!!",
    },
    {
      emoji: "🎁",
      title: "opção",
      price: "R$ 6,00",
      desc: "!!A ser decidido!!",
    },
    {
      emoji: "🔥",
      title: "opção",
      price: "R$ 10,00",
      desc: "!!A ser decidido!!",
    },
  ];
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      senderType,
      senderName: senderType === "identificado" ? "Nome aqui" : "Anônimo",
      receiverName: document.querySelector('input[placeholder="Nome da pessoa"]').value,
      plan: selected.title,
      message: document.querySelector("textarea").value,
      paymentMethod,
    };

    try {
      fetch("http://localhost:3001/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Pedido enviado 💘");
      } else {
        alert("Erro ao enviar 😢");
      }
    } catch (err) {
      console.error(err);
      alert("Backend não está rodando");
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
              key={plan.title}
              className={`plan-card ${selected?.title === plan.title ? "selected" : ""}`}
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

              <form
                onSubmit={handleSubmit}
              >
                <div className="radio-group">
                  <label
                    className={`radio-option ${senderType === "identificado" ? "active" : ""
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
                    className={`radio-option ${senderType === "anonimo" ? "active" : ""
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
                      className={`payment-option ${paymentMethod === "pix" ? "active" : ""
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
                      className={`payment-option ${paymentMethod === "especie" ? "active" : ""
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
                      <div className="pix-top">
                        <h3>💘 Chave Pix</h3>
                        <span>Pagamento online</span>
                      </div>

                      <div className="pix-key">correioeleganteetemaa@gmail.com</div>

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
                        O pagamento deverá ser entregue presencialmente
                        para os representantes dos 3 Anos.
                      </p>
                    </div>
                  )}
                </div>

                <button type="submit" className="confirm-btn">
                  Confirmar pedido 💘
                </button>
              </form>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}