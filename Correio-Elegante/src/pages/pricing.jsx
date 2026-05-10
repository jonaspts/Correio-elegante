import { useEffect, useMemo, useState } from "react";

const initialForm = {
  senderType: "anonimo",
  senderName: "",
  recipient: "",
  className: "",
  message: "",
};

export default function Pricing({ goToHome = () => {} }) {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [hearts, setHearts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState("form");

  useEffect(() => {
    function spawnHeart() {
      const id = Math.random().toString(36).slice(2, 9);

      const newHeart = {
        id,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: 14 + Math.random() * 22,
        char: Math.random() > 0.5 ? "❤" : "♥",
      };

      setHearts((prev) => [...prev, newHeart].slice(-90));

      setTimeout(() => {
        setHearts((prev) => prev.filter((heart) => heart.id !== id));
      }, 5000);
    }

    const interval = setInterval(spawnHeart, 120);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!proofFile) {
      setProofPreview("");
      return;
    }

    const url = URL.createObjectURL(proofFile);
    setProofPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [proofFile]);

  const plans = useMemo(
    () => [
      {
        id: 1,
        title: "💌 Básico",
        price: "R$ 2,00",
        desc: "Envio simples da mensagem durante o evento.",
        tag: "Mais econômico",
      },
      {
        id: 2,
        title: "💖 Destaque",
        price: "R$ 4,00",
        desc: "Mensagem com mais presença dentro do evento.",
        tag: "Equilíbrio ideal",
      },
      {
        id: 3,
        title: "🔥 Premium",
        price: "R$ 6,00",
        desc: "Mensagem com destaque especial e prioridade.",
        tag: "Mais visível",
      },
      {
        id: 4,
        title: "👑 VIP",
        price: "R$ 10,00",
        desc: "O maior destaque da experiência.",
        tag: "Máximo destaque",
      },
    ],
    []
  );

  function openPlan(plan) {
    setSelectedPlan(plan);
    setForm(initialForm);
    setProofFile(null);
    setProofPreview("");
    setError("");
    setStep("form");
  }

  function closeModal() {
    setSelectedPlan(null);
    setForm(initialForm);
    setProofFile(null);
    setProofPreview("");
    setError("");
    setStep("form");
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!proofFile) {
      setError("Anexe o comprovante de pagamento para continuar.");
      return;
    }

    if (form.senderType === "nome" && !form.senderName.trim()) {
      setError("Informe o nome de quem está enviando.");
      return;
    }

    if (!form.recipient.trim()) {
      setError("Informe o destinatário.");
      return;
    }

    if (!form.className.trim()) {
      setError("Informe a turma.");
      return;
    }

    if (!form.message.trim()) {
      setError("Escreva a mensagem.");
      return;
    }

    setError("");
    setStep("success");
  }

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
        <section className="pricing-hero">
          <span className="badge">💘 Correio Elegante 2026</span>

          <h1>Tabela de Opções</h1>

          <p className="pricing-text">
            Escolha a opção ideal para sua mensagem e siga para o formulário
            com os dados do pedido e o comprovante de pagamento.
          </p>

          <button className="secondary-btn pricing-back-btn" onClick={goToHome}>
            Voltar para a página inicial
          </button>
        </section>

        <section className="pricing-grid">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className="pricing-card"
              onClick={() => openPlan(plan)}
            >
              <div className="pricing-card-top">
                <span className="pricing-tag">{plan.tag}</span>
                <span className="pricing-price">{plan.price}</span>
              </div>

              <h2>{plan.title}</h2>
              <p>{plan.desc}</p>

              <button className="primary-btn pricing-select-btn">
                Escolher esse 💘
              </button>
            </article>
          ))}
        </section>

        {selectedPlan && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal pricing-modal" onClick={(e) => e.stopPropagation()}>
              {step === "form" ? (
                <>
                  <div className="modal-top">
                    <span className="mini-badge">Produto escolhido</span>
                    <h2>{selectedPlan.title}</h2>
                    <p>{selectedPlan.desc}</p>
                  </div>

                  <div className="modal-selected-plan">
                    <span>Plano selecionado</span>
                    <strong>{selectedPlan.price}</strong>
                  </div>

                  <form onSubmit={handleSubmit} className="pricing-form">
                    <label className="field-label">Quem está enviando?</label>
                    <div className="modal-row">
                      <button
                        type="button"
                        className={`modal-option-btn ${form.senderType === "nome" ? "active" : ""}`}
                        onClick={() => setForm((prev) => ({ ...prev, senderType: "nome" }))}
                      >
                        Nome
                      </button>

                      <button
                        type="button"
                        className={`modal-option-btn ${form.senderType === "anonimo" ? "active" : ""}`}
                        onClick={() => setForm((prev) => ({ ...prev, senderType: "anonimo" }))}
                      >
                        Anônimo
                      </button>
                    </div>

                    {form.senderType === "nome" && (
                      <>
                        <label className="field-label">Seu nome</label>
                        <input
                          className="modal-input"
                          type="text"
                          placeholder="Digite seu nome"
                          value={form.senderName}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, senderName: e.target.value }))
                          }
                        />
                      </>
                    )}

                    <label className="field-label">Para quem será enviado?</label>
                    <input
                      className="modal-input"
                      type="text"
                      placeholder="Nome do destinatário"
                      value={form.recipient}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, recipient: e.target.value }))
                      }
                    />

                    <label className="field-label">Turma</label>
                    <input
                      className="modal-input"
                      type="text"
                      placeholder="Ex: 3A"
                      value={form.className}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, className: e.target.value }))
                      }
                    />

                    <label className="field-label">Mensagem</label>
                    <textarea
                      className="modal-textarea"
                      placeholder="Escreva sua mensagem..."
                      value={form.message}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, message: e.target.value }))
                      }
                    />

                    <label className="field-label">Comprovante de pagamento</label>
                    <div className="proof-box">
                      <input
                        className="proof-input"
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                      />

                      <p className="proof-hint">
                        Anexe uma imagem ou PDF do comprovante para liberar o pedido.
                      </p>

                      {proofFile && (
                        <div className="proof-file">
                          <span>📎 {proofFile.name}</span>

                          {proofPreview && proofFile.type.startsWith("image/") && (
                            <img src={proofPreview} alt="Prévia do comprovante" />
                          )}
                        </div>
                      )}
                    </div>

                    {error && <p className="form-error">⚠️ {error}</p>}

                    <div className="modal-actions">
                      <button
                        type="button"
                        className="modal-cancel-btn"
                        onClick={closeModal}
                      >
                        Cancelar
                      </button>

                      <button type="submit" className="modal-confirm-btn">
                        Confirmar pedido 💌
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="success-state">
                  <span className="success-badge">Pedido enviado</span>
                  <h2>Pagamento anexado com sucesso</h2>
                  <p>
                    O pedido foi registrado com o comprovante anexado. Agora ele pode ser conferido
                    manualmente ou conectado depois ao sistema da planilha.
                  </p>

                  <div className="success-summary">
                    <strong>{selectedPlan.title}</strong>
                    <span>{selectedPlan.price}</span>
                  </div>

                  <div className="modal-actions">
                    <button className="modal-cancel-btn" onClick={closeModal}>
                      Fechar
                    </button>
                    <button className="modal-confirm-btn" onClick={closeModal}>
                      Novo pedido
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}