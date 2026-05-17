import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
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
  const [proofUrl, setProofUrl] = useState("");
  const [fileUploading, setFileUploading] = useState(false);

  const [senderName, setSenderName] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [message, setMessage] = useState("");

  const [senderCourse, setSenderCourse] = useState("");
  const [senderClassroom, setSenderClassroom] = useState("");

  const [course, setCourse] = useState("");
  const [classroom, setClassroom] = useState("");

  const [orderCode, setOrderCode] = useState("");
  const [fileName, setFileName] = useState("");
  const [proofFile, setProofFile] = useState(null);

  const formRef = useRef(null);

  const plans = [
    {
      id: "p1",
      emoji: "💌",
      title: "Carta",
      price: "R$ 1,00",
      features: ["1 Carta",],
    },
    {
      id: "p2",
      emoji: "💌 + 🍭",
      title: "Carta com Pirulito",
      price: "R$ 2,00",
      features: ["1 Carta", "1 Pirulito",],
    },
    {
      id: "p3",
      emoji: "💌 + 🍬",
      title: "carta com bombom",
      price: "R$ 3,00",
      features: ["1 Carta", "1 bombom", ],
    },

  ];

  const gerarCodigoPedido = () => {
    const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let codigo = "CARTA-";
    for (let i = 0; i < 6; i++) {
      const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
      codigo += caracteres[indiceAleatorio];
    }
    return codigo;
  };

  useEffect(() => {
    if (senderType === "anonimo") {
      setSenderName("");
      setSenderCourse("");
      setSenderClassroom("");
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

  async function uploadProof(file) {
    if (!file) return null;

    setFileUploading(true);

    const fileName = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("proofs")
      .upload(fileName, file, {
        upsert: false,
      });

    if (error) {
      console.error(error);
      setFileUploading(false);
      return null;
    }

    const { data } = supabase.storage.from("proofs").getPublicUrl(fileName);

    setFileUploading(false);

    return data.publicUrl;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    const now = Date.now();
    if (now - lastSend < 5000) {
      alert("Aguarde alguns segundos antes de enviar novamente");
      return;
    }

    if (!selected) return alert("Escolha um plano");
    if (!receiverName.trim()) return alert("Digite o nome");
    if (!message.trim()) return alert("Digite a mensagem");

    if (senderType === "identificado") {
      if (!senderName.trim()) {
        return alert("Digite seu nome completo");
      }

      if (senderCourse && !senderClassroom) {
        return alert("Selecione a turma do remetente");
      }
    }

    if (receiverType === "identificado" && !course) {
      return alert("Selecione o curso");
    }

    if (receiverType === "identificado" && course && !classroom) {
      return alert("Selecione a turma");
    }

    if (paymentMethod === "pix" && !proofUrl) {
      return alert("Envie o comprovante do Pix");
    }

    try {
      setLoading(true);

      const code = gerarCodigoPedido();

      const { data, error } = await supabase.from("orders").insert([
        {
          plan: selected.title,
          sender_type: senderType,
          sender_name: senderType === "anonimo" ? null : senderName,
          sender_classroom:
            senderType === "anonimo" ? null : senderCourse ? senderClassroom : null,
          receiver_type: receiverType,
          receiver_name: receiverName,
          course: receiverType === "anonimo" ? null : course || null,
          classroom: receiverType === "anonimo" ? null : course ? classroom : null,
          message,
          payment_method: paymentMethod,
          proof_url: proofUrl,
          order_code: code,
          status: "pending",
        },
      ]);

      console.log("ERROR:", error);
      console.log("DATA:", data);

      if (error) throw error;

      setOrderCode(code);
      setLastSend(now);
      setSent(true);

      setTimeout(() => {
        setSent(false);
        setSelected(null);
        setSenderType("anonimo");
        setReceiverType("anonimo");
        setPaymentMethod("pix");
        setFileName("");
        setProofFile(null);
        setProofUrl("");
        setSenderName("");
        setSenderCourse("");
        setSenderClassroom("");
        setReceiverName("");
        setMessage("");
        setCourse("");
        setClassroom("");
        setOrderCode("");
      }, 2500);
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar pedido.");
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
            <h2>Processando pedido...</h2>
            <p>Aguarde enquanto registramos sua mensagem 💘</p>
          </div>
        </div>
      )}

      {sent && (
        <div className="success-overlay">
          <div className="success-box">
            <div className="success-badge">✓</div>
            <h2>Pedido enviado com sucesso!</h2>
            <p>Seu correio elegante foi registrado e será entregue em breve.</p>
          </div>
        </div>
      )}

      <main className="checkout-shell">
        <section className="hero-column">
          <button className="back-btn" onClick={goToHome} type="button">
            ← Voltar para início
          </button>

          <section className="pricing-hero">
            <span className="badge">💘 Correio Elegante • Turmas 3º Anos 2026</span>
            <h1>Tabela de Opções</h1>
            <p>
              Selecione a opção ideal para enviar sua mensagem especial.
              Preencha os dados e participe do Correio Elegante da ETEMAA.
            </p>
          </section>

          <section className="plans-grid">
            {plans.map((plan) => (
              <article
                key={plan.id}
                className={`plan-card ${selected?.id === plan.id ? "selected" : ""} ${
                  plan.highlighted ? "highlighted" : ""
                }`}
              >
                {plan.highlighted && <div className="popular-badge">Mais Popular</div>}

                <div className="plan-top">
                  <span className="plan-emoji">{plan.emoji}</span>
                  <span className="plan-price">{plan.price}</span>
                </div>

                <h2>{plan.title}</h2>

                <ul className="plan-features">
                  {plan.features.map((feature, idx) => (
                    <li key={idx}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M13.5 4.5L6 12L2.5 8.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  className="select-btn"
                  onClick={() => handlePlanSelect(plan)}
                  disabled={loading}
                >
                  {selected?.id === plan.id ? "Selecionado ✓" : "Selecionar plano"}
                </button>
              </article>
            ))}
          </section>
        </section>

        <aside ref={formRef} className={`checkout-panel ${selected ? "open" : ""}`}>
          {!selected ? (
            <div className="panel-empty">
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h2>Selecione um plano</h2>
                <p>Escolha uma das opções ao lado para preencher o formulário de pedido.</p>
              </div>
            </div>
          ) : (
            <div className="form-card">
              <div className="form-header">
                <span className="selected-emoji">{selected.emoji}</span>
                <div>
                  <p className="form-small">Plano Selecionado</p>
                  <h2>{selected.title}</h2>
                  <p className="form-price">{selected.price}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="elegant-form">
                <div className="form-section">
                  <h3>
                    <span className="section-icon">💌</span>
                    Informações de quem envia
                  </h3>

                  <div className="input-group">
                    <label htmlFor="sender-type">Tipo de envio</label>
                    <div className="radio-group">
                      <label
                        className={`radio-option ${
                          senderType === "identificado" ? "active" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="senderType"
                          id="sender-identificado"
                          value="identificado"
                          checked={senderType === "identificado"}
                          onChange={(e) => setSenderType(e.target.value)}
                        />
                        <span>Identificado</span>
                      </label>

                      <label
                        className={`radio-option ${senderType === "anonimo" ? "active" : ""}`}
                      >
                        <input
                          type="radio"
                          name="senderType"
                          id="sender-anonimo"
                          value="anonimo"
                          checked={senderType === "anonimo"}
                          onChange={(e) => setSenderType(e.target.value)}
                        />
                        <span>Anônimo</span>
                      </label>
                    </div>
                  </div>

                  {senderType === "identificado" && (
                    <>
                      <div className="input-group">
                        <label htmlFor="sender-name">Seu nome completo</label>
                        <input
                          type="text"
                          id="sender-name"
                          value={senderName}
                          onChange={(e) => setSenderName(e.target.value)}
                          placeholder="Digite seu nome completo"
                        />
                      </div>

                      <div className="input-group">
                        <label htmlFor="sender-course">Curso do remetente</label>
                        <div className="radio-group">
                          <label
                            className={`radio-option ${
                              senderCourse === "ADM" ? "active" : ""
                            }`}
                          >
                            <input
                              type="radio"
                              name="senderCourse"
                              id="sender-course-adm"
                              value="ADM"
                              checked={senderCourse === "ADM"}
                              onChange={(e) => {
                                setSenderCourse(e.target.value);
                                setSenderClassroom("");
                              }}
                            />
                            <span>Administração</span>
                          </label>

                          <label
                            className={`radio-option ${
                              senderCourse === "DS" ? "active" : ""
                            }`}
                          >
                            <input
                              type="radio"
                              name="senderCourse"
                              id="sender-course-ds"
                              value="DS"
                              checked={senderCourse === "DS"}
                              onChange={(e) => {
                                setSenderCourse(e.target.value);
                                setSenderClassroom("");
                              }}
                            />
                            <span>Des. Sistemas</span>
                          </label>

                          <label
                            className={`radio-option ${
                              senderCourse === "" ? "active" : ""
                            }`}
                          >
                            <input
                              type="radio"
                              name="senderCourse"
                              id="sender-course-none"
                              value=""
                              checked={senderCourse === ""}
                              onChange={() => {
                                setSenderCourse("");
                                setSenderClassroom("");
                              }}
                            />
                            <span>Não informar</span>
                          </label>
                        </div>
                      </div>

                      {senderCourse && (
                        <div className="input-group">
                          <label htmlFor="sender-classroom">Turma do remetente</label>
                          <div className="class-grid">
                            {["1A", "1B", "2A", "2B", "3A", "3B"].map((t) => {
                              const full = `${t}-${senderCourse}`;
                              return (
                                <button
                                  key={full}
                                  type="button"
                                  className={`class-btn ${
                                    senderClassroom === full ? "active" : ""
                                  }`}
                                  onClick={() => setSenderClassroom(full)}
                                >
                                  {full}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="form-divider" />

                <div className="form-section">
                  <h3>
                    <span className="section-icon">🎯</span>
                    Informações do Destinatário
                  </h3>

                  <div className="input-group">
                    <label htmlFor="receiver-name">Nome do destinatário *</label>
                    <input
                      type="text"
                      id="receiver-name"
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      placeholder="Para quem será enviada a mensagem"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="course">Curso</label>
                    <div className="radio-group">
                      <label className={`radio-option ${course === "ADM" ? "active" : ""}`}>
                        <input
                          type="radio"
                          name="course"
                          id="course-adm"
                          value="ADM"
                          checked={course === "ADM"}
                          onChange={(e) => {
                            setCourse(e.target.value);
                            setClassroom("");
                            setReceiverType("identificado");
                          }}
                        />
                        <span>Administração</span>
                      </label>

                      <label className={`radio-option ${course === "DS" ? "active" : ""}`}>
                        <input
                          type="radio"
                          name="course"
                          id="course-ds"
                          value="DS"
                          checked={course === "DS"}
                          onChange={(e) => {
                            setCourse(e.target.value);
                            setClassroom("");
                            setReceiverType("identificado");
                          }}
                        />
                        <span>Des. Sistemas</span>
                      </label>

                      <label
                        className={`radio-option ${receiverType === "anonimo" ? "active" : ""}`}
                      >
                        <input
                          type="radio"
                          name="course"
                          id="course-none"
                          value=""
                          checked={receiverType === "anonimo"}
                          onChange={() => {
                            setReceiverType("anonimo");
                            setCourse("");
                            setClassroom("");
                          }}
                        />
                        <span>Não informar</span>
                      </label>
                    </div>
                  </div>

                  {course && receiverType === "identificado" && (
                    <div className="input-group">
                      <label htmlFor="classroom">Turma do destinatário</label>
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
                    <label htmlFor="message">Sua mensagem *</label>
                    <textarea
                      id="message"
                      rows="5"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Escreva aqui sua mensagem especial..."
                      required
                    />
                    <span className="input-hint">{message.length}/500 caracteres</span>
                  </div>
                </div>

                <div className="form-divider" />

                <div className="form-section">
                  <h3>
                    <span className="section-icon">💳</span>
                    Forma de Pagamento
                  </h3>

                  <div className="input-group">
                    <label htmlFor="payment">Método de pagamento</label>
                    <div className="payment-options">
                      <label className={`payment-option ${paymentMethod === "pix" ? "active" : ""}`}>
                        <input
                          type="radio"
                          name="payment"
                          id="payment-pix"
                          value="pix"
                          checked={paymentMethod === "pix"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <div className="payment-content">
                          <span className="payment-icon">🔑</span>
                          <span>Pix</span>
                        </div>
                      </label>

                      <label
                        className={`payment-option ${
                          paymentMethod === "especie" ? "active" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          id="payment-cash"
                          value="especie"
                          checked={paymentMethod === "especie"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <div className="payment-content">
                          <span className="payment-icon">💵</span>
                          <span>Espécie</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {paymentMethod === "pix" && (
                    <div className="pix-box">
                      <div className="pix-header">
                        <h4>Chave Pix para pagamento</h4>
                      </div>

                      <div className="pix-key-container">
                        <div className="pix-key">correioeleganteetemaa@gmail.com</div>
                        <button
                          type="button"
                          className="copy-btn"
                          onClick={() => {
                            navigator.clipboard.writeText("correioeleganteetemaa@gmail.com");
                            alert("Chave Pix copiada!");
                          }}
                        >
                          Copiar
                        </button>
                      </div>

                      <p className="pix-instruction">
                        Realize o pagamento no valor de <strong>{selected.price}</strong> e
                        envie o comprovante abaixo.
                      </p>

                      <label className="upload-area">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;

                            setFileName(file.name);
                            setProofFile(file);

                            const url = await uploadProof(file);
                            setProofUrl(url);
                          }}
                        />
                        <div className="upload-content">
                          {fileName ? (
                            <>
                              <span className="upload-icon success">📎</span>
                              <strong>{fileName}</strong>
                              <p>Arquivo anexado com sucesso</p>
                            </>
                          ) : (
                            <>
                              <span className="upload-icon">📤</span>
                              <strong>Clique para enviar o comprovante</strong>
                              <p>Aceito: PNG, JPG ou PDF (máx. 10MB)</p>
                            </>
                          )}
                        </div>
                      </label>
                    </div>
                  )}

                  {paymentMethod === "especie" && (
                    <div className="cash-box">
                      <div className="cash-icon">💵</div>
                      <h4>Pagamento em dinheiro</h4>

                      {orderCode && (
                        <div className="order-code-box">
                          <p className="order-code-label">Código do seu pedido:</p>
                          <div className="order-code-display">
                            <strong>{orderCode}</strong>
                            <button
                              type="button"
                              className="copy-code-btn"
                              onClick={() => {
                                navigator.clipboard.writeText(orderCode);
                                alert("Código copiado!");
                              }}
                            >
                              📋
                            </button>
                          </div>
                          <p className="order-code-hint">
                            Guarde este código para acompanhar seu pedido
                          </p>
                        </div>
                      )}

                      <p>
                        O pagamento no valor de <strong>{selected.price}</strong> deverá
                        ser entregue presencialmente para os representantes dos 3º Anos.
                      </p>

                      <div className="info-alert">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path
                            d="M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M8 11V8M8 5h.01"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                        <span>**Algum aviso vai estar aqui**</span>
                      </div>
                    </div>
                  )}
                </div>

                <button type="submit" className="confirm-btn" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="btn-spinner"></span>
                      Processando...
                    </>
                  ) : (
                    <>Confirmar pedido 💘</>
                  )}
                </button>
              </form>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}