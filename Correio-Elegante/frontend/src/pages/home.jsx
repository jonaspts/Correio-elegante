import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home({ goToPricing = () => { }, goToAdmin = () => { } }) {
  const [hearts, setHearts] = useState([]);

  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  const [profileId, setProfileId] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [phoneFromProfile, setPhoneFromProfile] = useState("");

  const [nome, setNome] = useState("");
  const [turma, setTurma] = useState("");
  const [telefone, setTelefone] = useState("");

  const [cartinhasCompradas, setCartinhasCompradas] = useState(0);
  const [totalGasto, setTotalGasto] = useState(0);

  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [senderCourse, setSenderCourse] = useState("");
  const [popupOrder, setPopupOrder] = useState(null);

  const [orders, setOrders] = useState([]);
  const [showOrdersPopup, setShowOrdersPopup] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const checkTrashOrder = async (userId) => {
    const { data, error } = await supabase
      .from("orders")
      .select("id, rejection_reasons, rejection_note, status, message_status, user_notified")
      .eq("user_id", userId)
      .eq("user_notified", false)
      .or("status.eq.trash,message_status.eq.trash")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Erro ao carregar pedido trash:", error);
      return;
    }

    if (data) {
      setPopupOrder(data);
    }
  };


  const courseOptions = [
    { value: "ADM", label: "Administração" },
    { value: "DS", label: "Des. Sistemas" },
  ];

  const classrooms = ["1A", "1B", "2A", "2B", "3A", "3B"];

  function formatPhone(value = "") {
    let v = value.replace(/\D/g, "").slice(0, 11);

    if (v.length <= 10) {
      v = v.replace(/(\d{2})(\d)/, "($1) $2");
      v = v.replace(/(\d{4})(\d)/, "$1-$2");
    } else {
      v = v.replace(/(\d{2})(\d)/, "($1) $2");
      v = v.replace(/(\d{5})(\d)/, "$1-$2");
    }

    return v;
  }

  async function loadOrders() {
    setLoadingOrders(true);

    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("orders")
      .select(`
  id,
  order_code,
  plan,
  status,
  created_at,
  message,
  sender_type,
  sender_name,
  sender_classroom,
  receiver_type,
  receiver_name,
  course,
  classroom,
  payment_method,
  valor,
  serenata_music
`)
      .eq("user_id", user.id)
      .neq("status", "trash")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setLoadingOrders(false);
      return;
    }

    setOrders(data || []);
    setShowOrdersPopup(true);
    setLoadingOrders(false);
  }


  const handleCloseTrashPopup = async () => {
    if (!popupOrder) return;

    const { error } = await supabase
      .from("orders")
      .update({ user_notified: true })
      .eq("id", popupOrder.id);

    if (error) {
      console.error("Erro ao marcar como notificado:", error);
      return;
    }

    setPopupOrder(null);
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

  useEffect(() => {
    let active = true;
    let trashIntervalId;

    async function loadProfile() {

      try {
        setLoadingProfile(true);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!active) return;

        if (!user) {
          setShowInfoPopup(false);
          return;
        }

        const provider = user.app_metadata?.provider;
        const googleUser = provider === "google";
        setIsGoogleUser(googleUser);

        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("id, email, phone, nome, turma, onboarding_completed, cartinhas_compradas")
          .eq("id", user.id)
          .maybeSingle();

        if (!active) return;

        if (error) {
          console.error("Erro ao carregar perfil:", error);
          return;
        }

        const savedPhone = profileData?.phone || "";
        const savedNome = profileData?.nome || "";
        const savedTurma = profileData?.turma || "";

        setProfileId(user.id);
        setProfileEmail(user.email || "");
        setPhoneFromProfile(savedPhone);
        setNome(savedNome);
        setTurma(savedTurma);
        setCartinhasCompradas(profileData?.cartinhas_compradas ?? 0);
        setTelefone(formatPhone(savedPhone || ""));

        const shouldShowPopup =
          !profileData ||
          !profileData.onboarding_completed ||
          !savedNome ||
          !savedTurma ||
          (googleUser && !savedPhone);

        setShowInfoPopup(shouldShowPopup);
        await checkTrashOrder(user.id);

        trashIntervalId = setInterval(() => {
          checkTrashOrder(user.id);
        }, 3000);


      } catch (err) {
        console.error("Erro inesperado ao carregar perfil:", err);
      } finally {
        if (active) setLoadingProfile(false); // 🔥 ESSENCIAL
      }
    }

    loadProfile();

    return () => {
      active = false;
      if (trashIntervalId) clearInterval(trashIntervalId);
    };
  }, []);

  useEffect(() => {

    let active = true;

    async function loadTotalGasto() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active || !user) return;

      const { data, error } = await supabase
        .from("orders")
        .select("valor")
        .eq("user_id", user.id)
        .eq("status", "paid");
      if (!active) return;

      if (error) {
        console.log("Erro ao carregar total gasto:", error.message);
        return;
      }

      const total = (data || []).reduce((acc, item) => {
        const value = Number(item.valor) || 0;
        return acc + value;
      }, 0);

      setTotalGasto(total);
    }

    loadTotalGasto();

    return () => {
      active = false;
    };
  }, []);

  async function handleSaveAdditionalInfo() {
    if (!profileId) return;

    if (!nome.trim() || !turma.trim()) {
      alert("Preencha nome e turma.");
      return;
    }

    if (isGoogleUser && !telefone.trim()) {
      alert("Preencha o telefone.");
      return;
    }

    setSavingProfile(true);

    const phoneToSave = isGoogleUser
      ? telefone.trim()
      : phoneFromProfile || telefone.trim();

    const { error } = await supabase.from("profiles").upsert({
      id: profileId,
      email: profileEmail,
      phone: phoneToSave,
      nome: nome.trim(),
      turma: turma.trim(),
      onboarding_completed: true,
    });

    if (error) {
      alert("Erro ao salvar informações: " + error.message);
      setSavingProfile(false);
      return;
    }

    setPhoneFromProfile(phoneToSave);
    setShowInfoPopup(false);
    setSavingProfile(false);
  }

  const formattedTotalGasto = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(totalGasto);

  return (
    <div className="pricing-page">
      <div className="binary-bg" />

      {/* PERFIL TOPO */}
      {profileId && !loadingProfile && (
        <div
          style={{
            width: "100%",
            position: "relative",
            zIndex: 10,
            padding: "12px 18px",
          }}
        >
          <div
            onClick={() => setShowProfilePanel((prev) => !prev)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              borderRadius: "14px",
              background:
                "linear-gradient(90deg, rgba(255,50,50,0.14), rgba(0,0,0,0.35))",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#fff",
              cursor: "pointer",
              backdropFilter: "blur(14px)",
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: "14px" }}>
                {nome ? `Olá, ${nome}` : profileEmail}
              </div>
              <div style={{ fontSize: "12px", opacity: 0.7 }}>
                {turma ? `Turma: ${turma}` : "Toque para ver seu perfil"}
              </div>
            </div>

            <div style={{ fontSize: "18px", opacity: 0.85 }}>
              {showProfilePanel ? "▲" : "▼"}
            </div>
          </div>

          {showProfilePanel && (
            <div
              style={{
                marginTop: "10px",
                padding: "14px 16px",
                borderRadius: "14px",
                background:
                  "linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
                border: "1px solid rgba(255,255,255,0.10)",
                color: "#fff",
                backdropFilter: "blur(16px)",
              }}
            >
              <div style={{ display: "grid", gap: "10px" }}>
                <div>
                  <div style={{ fontSize: "12px", opacity: 0.6 }}>Nome</div>
                  <div style={{ fontSize: "14px", fontWeight: 600 }}>
                    {nome || "Não informado"}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "12px", opacity: 0.6 }}>Turma</div>
                  <div style={{ fontSize: "14px", fontWeight: 600 }}>
                    {turma || "Não informado"}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "12px", opacity: 0.6 }}>
                    Cartinhas compradas
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 600 }}>
                    {cartinhasCompradas}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "12px", opacity: 0.6 }}>
                    Total gasto
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 600 }}>
                    {formattedTotalGasto}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "12px", opacity: 0.6 }}>Telefone</div>
                  <div style={{ fontSize: "14px", fontWeight: 600 }}>
                    {formatPhone(phoneFromProfile || telefone) || "Não informado"}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "12px", opacity: 0.6 }}>Email</div>
                  <div style={{ fontSize: "14px", fontWeight: 600 }}>
                    {profileEmail || "Não informado"}
                  </div>
                </div>
                <button className="orders-btn" onClick={loadOrders}>
                  📦 Meus pedidos
                </button>
              </div>
            </div>
          )}
        </div>
      )}

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
              • Todas as mensagens passam por análise antes da entrega.
              Conteúdos ofensivos ou fora das regras serão bloqueados
              para manter um ambiente seguro e respeitoso. <br /> <br />
              • Pedidos feitos com falsos comprovantes resultarão em punições. <br />
              Em casos mais graves, haverá o banimento permanente do dispositivo do usuário.
            </p>
          </div>
        </section>

        <section className="features-section">
          <div className="section-header">
            <span className="section-tag">Como funciona</span>
            <h2 className="landing-section-title">Não fique com dúvidas</h2>
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

        <section className="steps-section">
          <div className="section-header">
            <span className="section-tag">Como participar</span>
            <h2 className="landing-section-title">Como enviar sua mensagem</h2>

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
              <p className="step-text">O envio das mensagens ocorrerá pontualmente na data escolhida."</p>
            </article>
          </div>
        </section>

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
      {showInfoPopup && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0, 0, 0, 0.15)",
            backdropFilter: "blur(3px)",
            padding: "20px",
          }}

        >
          <div
            style={{
              width: "100%",
              maxWidth: "460px",
              borderRadius: "20px",
              background: "linear-gradient(145deg, rgba(20, 8, 8, 0.98), rgba(40, 10, 10, 0.96))",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              boxShadow: "0 24px 80px rgba(0, 0, 0, 0.55)",
              padding: "28px",
              color: "#fff",
            }}

          >
            <h2 style={{ margin: 0, fontSize: "1.6rem", fontWeight: "800" }}>
              IMPORTANTE!
            </h2>

            <p style={{ marginTop: 10, fontSize: "14px", opacity: 0.8 }}>
              Preencha <strong>SUAS INFORMAÇÕES</strong> para utilizar o sistema. Esses dados são confidenciais,
              acessíveis apenas aos administradores do evento. <strong>Nenhum dado aqui colocado será usado fora do Correio Elegante.</strong>
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: 16 }}>

              <input
                placeholder="Nome (Apenas admins têm acesso a esse nome)"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                style={{
                  padding: "14px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#fff",
                  outline: "none",
                }}
              />

              <div style={{ display: "grid", gap: "8px" }}>
                <label>Curso</label>

                <div className="payment-options">
                  {courseOptions.map((c) => (
                    <label>
                      <input
                        type="radio"
                        checked={senderCourse === c.value}
                        onChange={() => setSenderCourse(c.value)}
                      />
                      <span>{c.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {senderCourse && (
                <div style={{ marginTop: "10px" }}>
                  <label>Turma</label>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                    {classrooms.map((c) => {
                      const value = `${c}-${senderCourse}`;

                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setTurma(value)}
                          style={{
                            padding: "10px",
                            borderRadius: "10px",
                            border: turma === value ? "2px solid red" : "1px solid gray",
                            background: "rgba(255,255,255,0.05)",
                            color: "#fff",
                          }}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}


              <input
                placeholder="Telefone"
                value={telefone}
                inputMode="numeric"
                onChange={(e) => {
                  let v = e.target.value.replace(/\D/g, ""); // só números

                  // limita tamanho
                  v = v.slice(0, 11);

                  // aplica máscara
                  if (v.length <= 10) {
                    // fixo: (00) 0000-0000
                    v = v.replace(/(\d{2})(\d)/, "($1) $2");
                    v = v.replace(/(\d{4})(\d)/, "$1-$2");
                  } else {
                    // celular: (00) 00000-0000
                    v = v.replace(/(\d{2})(\d)/, "($1) $2");
                    v = v.replace(/(\d{5})(\d)/, "$1-$2");
                  }

                  setTelefone(v);
                }}
                style={{
                  padding: "14px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#fff",
                  outline: "none",
                }}
              />

              <button
                onClick={handleSaveAdditionalInfo}
                disabled={savingProfile}
                style={{
                  padding: "14px",
                  borderRadius: "12px",
                  border: "none",
                  background: "linear-gradient(135deg, #ff2d2d, #b30000)",
                  color: "#fff",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                {savingProfile ? "Salvando..." : "Continuar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {popupOrder && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>❌ Sua carta foi rejeitada</h2>

            <p>Motivos:</p>
            <ul>
              {(popupOrder.rejection_reasons || []).map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>

            {popupOrder.rejection_note && <p>{popupOrder.rejection_note}</p>}

            <button onClick={handleCloseTrashPopup}>
              Entendi
            </button>
          </div>
        </div>
      )}

      {showOrdersPopup && (
        <div className="orders-overlay" onClick={() => setShowOrdersPopup(false)}>
          <div className="orders-modal" onClick={(e) => e.stopPropagation()}>

            <div className="orders-header">
              <h2>📦 Meus pedidos</h2>
              <h6>OBS:
                <br />
                -pedidos pendentes = não analisados ainda
                <br />
                -o total gasto e as cartinhas são adicionados após a verificação final das cartinhas.</h6>
              <button onClick={() => setShowOrdersPopup(false)}>✖</button>
            </div>

            <div className="orders-body">

              {loadingOrders ? (
                <p>Carregando...</p>
              ) : orders.length === 0 ? (
                <p style={{ opacity: 0.6 }}>Nenhum pedido encontrado</p>
              ) : (
                orders.map((o) => {
                  const code = o.order_code ?? (o.id?.slice(0, 6) || "SEM-ID");

                  return (
                    <div key={o.id} className="order-card">
                      <div className="order-title">{o.plan}</div>
                      <div className="order-code">#{code}</div>

                      <div className={`order-status status-${o.status}`}>
                        {o.status}
                      </div>

                      <button
                        className="order-details-btn"
                        onClick={() => setSelectedOrder(o)}
                      >
                        Ver detalhes
                      </button>
                    </div>
                  );
                })
              )}

            </div>
          </div>
        </div>
      )}
      {selectedOrder && (
        <div className="orders-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="orders-modal" onClick={(e) => e.stopPropagation()}>

            <div className="orders-header">
              <h2>📜 Detalhes da carta</h2>
              <button onClick={() => setSelectedOrder(null)}>✖</button>
            </div>

            <div className="orders-body">

              <p><strong>Plano:</strong> {selectedOrder.plan}</p>
              <p><strong>Mensagem:</strong> {selectedOrder.message}</p>

              <p><strong>Remetente:</strong>
                {selectedOrder.sender_type === "anonimo"
                  ? "Anônimo"
                  : selectedOrder.sender_name}
              </p>

              <p><strong>Turma remetente:</strong> {selectedOrder.sender_classroom || "—"}</p>

              <p><strong>Destinatário:</strong> {selectedOrder.receiver_name}</p>

              <p><strong>Curso:</strong> {selectedOrder.course || "—"}</p>
              <p><strong>Turma destino:</strong> {selectedOrder.classroom || "—"}</p>

              <p><strong>Pagamento:</strong> {selectedOrder.payment_method}</p>

              <p><strong>Serenata:</strong> {selectedOrder.serenata_music || "Não adicionada"}</p>

              <p><strong>Valor:</strong> R$ {selectedOrder.valor}</p>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
