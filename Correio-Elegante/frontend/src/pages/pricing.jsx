import { useEffect, useState, useRef } from "react";
import "../App.css";

export default function Pricing({ goToHome }) {
  const [hearts, setHearts] = useState([]);
  const [selected, setSelected] = useState(null);

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [lastSend, setLastSend] = useState(0);

  const [senderType, setSenderType] = useState("anonimo");
  const [receiverType, setReceiverType] = useState("anonimo");
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [fileName, setFileName] = useState("");

  const [senderName, setSenderName] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [message, setMessage] = useState("");
  const [course, setCourse] = useState("");
  const [classroom, setClassroom] = useState("");


  const formRef = useRef(null);

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

  useEffect(() => {
    if (senderType === "anonimo") {
      setSenderName("");
    }
  }, [senderType]);

  useEffect(() => {
    if (receiverType === "anonimo") {
      setCourse("");
      setClassroom("");
    }
  }, [receiverType]);

  const handlePlanSelect = (plan) => {
    setSelected(plan);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    const now = Date.now();
    if (now - lastSend < 5000) {
      alert("Espere alguns segundos antes de enviar novamente");
      return;
    }

    if (!selected) {
      alert("Escolha uma opção antes de enviar");
      return;
    }

    if (!receiverName.trim() || !message.trim()) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    if (senderType === "identificado" && !senderName.trim()) {
      alert("Digite seu nome");
      return;
    }

    if (receiverType === "identificado" && !course) {
      alert("Selecione o curso");
      return;
    }

    if (receiverType === "identificado" && !classroom) {
      alert("Selecione a turma");
      return;
    }

    if (paymentMethod === "pix" && !fileName) {
      alert("Envie o comprovante do Pix");
      return;
    }
    try {
      setLoading(true);

      const res = await fetch("https://correio-elegante-7atm.onrender.com/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

      setLastSend(now);
      setSent(true);

      setTimeout(() => {
        setSent(false);
        setSelected(null);
        setSenderType("anonimo");
        setReceiverType("anonimo");
        setPaymentMethod("pix");
        setFileName("");
        setSenderName("");
        setReceiverName("");
        setMessage("");
        setCourse("");
        setClassroom("");
      }, 2200);
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

      {sent && (
        <div className="success-overlay">
          <div className="success-box">
            <div className="success-badge">✓</div>
            <h2>Pedido enviado!</h2>
            <p>Seu correio elegante foi registrado com sucesso.</p>
          </div>
        </div>
      )}

      <main className="checkout-shell">
        <section className="hero-column">
          <button className="back-btn" onClick={goToHome} type="button">
            ← Voltar
          </button>

          <section className="pricing-hero">
            <span className="badge">💘 Correio Elegante • 3º anos 2026</span>
            <h1>Tabela de Opções</h1>
            <p>
              Escolha uma opção, preencha os dados e participe do Correio Elegante da escola.
            </p>
          </section>

          <section className="plans-grid">
            {plans.map((plan) => (
              <article
                key={plan.id}
                className={`plan-card ${selected?.id === plan.id ? "selected" : ""}`}
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
                  onClick={() => handlePlanSelect(plan)}
                  disabled={loading}
                >
                  Escolher opção
                </button>
              </article>
            ))}
          </section>
        </section>

        <aside ref={formRef} className={`checkout-panel ${selected ? "open" : ""}`}>
          {!selected ? (
            <div className="panel-empty">
              <div>
                <h2>Escolha uma opção para começar</h2>
                <p>O formulário vai aparecer aqui ao lado.</p>
              </div>
            </div>
          ) : (
            <div className="form-card">
              <div className="form-header">
                <span className="selected-emoji">{selected.emoji}</span>
                <div>
                  <p className="form-small">Produto escolhido</p>
                  <h2>{selected.title}</h2>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="elegant-form">
                {/* Seção Remetente */}
                <div className="form-section">
                  <h3>💌 Remetente</h3>

                  <div className="input-group">
                    <label>Tipo de envio</label>
                    <div className="radio-group">
                      <label
                        className={`radio-option ${senderType === "identificado" ? "active" : ""}`}
                      >
                        <input
                          type="radio"
                          name="senderType"
                          value="identificado"
                          checked={senderType === "identificado"}
                          onChange={(e) => setSenderType(e.target.value)}
                        />
                        Identificado
                      </label>

                      <label
                        className={`radio-option ${senderType === "anonimo" ? "active" : ""}`}
                      >
                        <input
                          type="radio"
                          name="senderType"
                          value="anonimo"
                          checked={senderType === "anonimo"}
                          onChange={(e) => setSenderType(e.target.value)}
                        />
                        Anônimo
                      </label>
                    </div>
                  </div>

                  {senderType === "identificado" && (
                    <div className="input-group">
                      <label>Seu nome</label>
                      <input
                        type="text"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="Digite seu nome completo"
                      />
                    </div>
                  )}
                </div>

                <div className="form-section-divider" />

                {/* Seção Destinatário */}
                <div className="form-section">
                  <h3>🎯 Destinatário</h3>

                  <div className="input-group">
                    <label>Nome do destinatário</label>
                    <input
                      type="text"
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      placeholder="Para quem será enviado"
                    />
                  </div>

                  <div className="input-group">
                    <label>Turma/Curso</label>
                    <div className="radio-group">
                      <label
                        className={`radio-option ${course === "ADM" ? "active" : ""}`}
                      >
                        <input
                          type="radio"
                          name="course"
                          value="ADM"
                          checked={course === "ADM"}
                          onChange={(e) => {
                            setCourse(e.target.value);
                            setClassroom("");
                            setReceiverType("identificado");
                          }}
                        />
                        ADM
                      </label>

                      <label
                        className={`radio-option ${course === "DS" ? "active" : ""}`}
                      >
                        <input
                          type="radio"
                          name="course"
                          value="DS"
                          checked={course === "DS"}
                          onChange={(e) => {
                            setCourse(e.target.value);
                            setClassroom("");
                            setReceiverType("identificado");
                          }}
                        />
                        DS
                      </label>

                      <label
                        className={`radio-option ${receiverType === "anonimo" ? "active" : ""}`}
                      >
                        <input
                          type="radio"
                          name="course"
                          value=""
                          checked={receiverType === "anonimo"}
                          onChange={() => {
                            setReceiverType("anonimo");
                            setCourse("");
                            setClassroom("");
                          }}
                        />
                        Anônimo
                      </label>
                    </div>
                  </div>

                  {course && receiverType === "identificado" && (
                    <div className="input-group">
                      <label>Turma do destinatário</label>
                      <div className="class-grid">
                        {["1A", "1B", "2A", "2B", "3A", "3B"].map((t) => {
                          const full = `${t}-${course}`;
                          return (
                            <button
                              key={full}
                              type="button"
                              className={`class-btn ${classroom === full ? "active" : ""}`}
                              onClick={() => setClassroom(full)}
                            >
                              {full}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="input-group">
                    <label>Sua mensagem</label>
                    <textarea
                      rows="5"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Escreva sua mensagem carinhosa..."
                    />
                  </div>
                </div>

                <div className="form-section-divider" />

                {/* Seção Pagamento */}
                <div className="form-section">
                  <h3>💳 Pagamento</h3>

                  <div className="input-group">
                    <label>Forma de pagamento</label>
                    <div className="payment-options">
                      <label
                        className={`payment-option ${paymentMethod === "pix" ? "active" : ""}`}
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
                  </div>

                  {paymentMethod === "pix" && (
                    <div className="pix-box">
                      <h3>💘 Chave Pix</h3>
                      <div className="pix-key">correioeleganteetemaa@gmail.com</div>
                      <p className="pix-warning">
                        Após realizar o pagamento, envie o comprovante abaixo.
                      </p>

                      <label className="upload-area">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) =>
                            setFileName(e.target.files[0] ? e.target.files[0].name : "")
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
                        O pagamento deverá ser entregue presencialmente para os representantes
                        dos 3º Anos.
                      </p>
                    </div>
                  )}
                </div>

                <button type="submit" className="confirm-btn" disabled={loading}>
                  {loading ? "Enviando..." : "Confirmar pedido 💘"}
                </button>
              </form>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}