import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "../lib/supabase";
import "../App.css";

// ========================================
// COMPONENTES AUXILIARES
// ========================================

const LoadingOverlay = () => (
  <div className="loading-overlay">
    <div className="loading-box">
      <div className="spinner" />
      <h2>Processando pedido...</h2>
      <p>Aguarde enquanto registramos sua mensagem 💘</p>
    </div>
  </div>
);

const SuccessOverlay = ({ orderCode, paymentMethod, onClose }) => (
  <div className="success-overlay">
    <div className="success-box">
      <div className="success-badge">✓</div>
      <h2>Pedido enviado com sucesso!</h2>
      <p>Seu correio elegante foi registrado e será entregue na data marcada</p>
      
      {paymentMethod === "especie" && orderCode && (
        <div className="success-code-section">
          <p className="success-code-label">Código do seu pedido:</p>
          <div className="success-code-display">
            <strong>{orderCode}</strong>
            <button
              type="button"
              className="copy-success-btn"
              onClick={() => {
                navigator.clipboard.writeText(orderCode);
                alert("Código copiado!");
              }}
            >
              📋 Copiar
            </button>
          </div>
          <p className="success-code-hint">Guarde este código para apresentar no pagamento</p>
        </div>
      )}
      
      <button 
        type="button" 
        className="success-close-btn"
        onClick={onClose}
      >
        Concluído
      </button>
    </div>
  </div>
);

const HeartBackground = ({ hearts }) => (
  <div className="heart-bg">
    {hearts.map((h) => (
      <span
        key={h.id}
        className="heart"
        style={{ left: `${h.x}px`, top: `${h.y}px`, fontSize: `${h.size}px` }}
      >
        {h.char}
      </span>
    ))}
  </div>
);

const CountdownTimer = ({ timeLeft }) => (
  <div className="countdown-container">
    <div className="countdown-title">Prazo de envio das cartas</div>
    <div className="countdown-timer">
      <div className="countdown-item">
        <div className="countdown-value">{String(timeLeft.days).padStart(2, "0")}</div>
        <div className="countdown-label">Dias</div>
      </div>
      <div className="countdown-separator">:</div>
      <div className="countdown-item">
        <div className="countdown-value">{String(timeLeft.hours).padStart(2, "0")}</div>
        <div className="countdown-label">Horas</div>
      </div>
      <div className="countdown-separator">:</div>
      <div className="countdown-item">
        <div className="countdown-value">{String(timeLeft.minutes).padStart(2, "0")}</div>
        <div className="countdown-label">Min</div>
      </div>
      <div className="countdown-separator">:</div>
      <div className="countdown-item">
        <div className="countdown-value">{String(timeLeft.seconds).padStart(2, "0")}</div>
        <div className="countdown-label">Seg</div>
      </div>
    </div>
  </div>
);

const ProfilePanel = ({
  profileId,
  loadingProfile,
  nome,
  turma,
  profileEmail,
  cartinhasCompradas,
  formattedTotalGasto,
  phoneFromProfile,
  telefone,
  showProfilePanel,
  setShowProfilePanel,
}) => {
  if (!profileId || loadingProfile) return null;

  return (
    <div className="profile-wrapper">
      <div onClick={() => setShowProfilePanel((prev) => !prev)} className="profile-header">
        <div>
          <div className="profile-name">{nome ? `Olá, ${nome}` : profileEmail}</div>
          <div className="profile-subtitle">
            {turma ? `Turma: ${turma}` : "Toque para ver seu perfil"}
          </div>
        </div>
        <div className="profile-toggle">{showProfilePanel ? "▲" : "▼"}</div>
      </div>
      {showProfilePanel && (
        <div className="profile-panel">
          <div className="profile-grid">
            <div className="profile-item">
              <div className="profile-label">Nome</div>
              <div className="profile-value">{nome || "Não informado"}</div>
            </div>
            <div className="profile-item">
              <div className="profile-label">Turma</div>
              <div className="profile-value">{turma || "Não informado"}</div>
            </div>
            <div className="profile-item">
              <div className="profile-label">Cartinhas compradas</div>
              <div className="profile-value">{cartinhasCompradas}</div>
            </div>
            <div className="profile-item">
              <div className="profile-label">Total gasto</div>
              <div className="profile-value">{formattedTotalGasto}</div>
            </div>
            <div className="profile-item">
              <div className="profile-label">Telefone</div>
              <div className="profile-value">{phoneFromProfile || telefone || "Não informado"}</div>
            </div>
            <div className="profile-item">
              <div className="profile-label">Email</div>
              <div className="profile-value">{profileEmail || "Não informado"}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PlanCard = ({ plan, selected, loading, onSelect }) => {
  const isSelected = selected?.id === plan.id;

  return (
    <article className={`plan-card ${isSelected ? "selected" : ""}`}>
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
        onClick={() => onSelect(plan)}
        disabled={loading}
      >
        {isSelected ? "Selecionado ✓" : "Selecionar plano"}
      </button>
    </article>
  );
};

const PromoBlock = () => (
  <div className="promo-block">
    <div className="promo-icon">🎁</div>
    <h3>Concorra a uma Cesta Especial!</h3>
    <p>
      A pessoa que mais gastar no <strong>Correio Elegante</strong> ganhará uma cesta repleta de
      surpresas. Quanto mais você enviar mensagens, maiores são suas chances!
    </p>
    <div className="promo-footer">
      <span className="promo-badge">💝 Acumule gastos</span>
      <span className="promo-badge">🏆 Único ganhador</span>
    </div>
  </div>
);

const RadioGroup = ({ options, value, onChange, name }) => (
  <div className="radio-group">
    {options.map((option) => (
      <label key={option.value} className={`radio-option ${value === option.value ? "active" : ""}`}>
        <input
          type="radio"
          name={name}
          value={option.value}
          checked={value === option.value}
          onChange={(e) => onChange(e.target.value)}
        />
        <span>{option.label}</span>
      </label>
    ))}
  </div>
);

const ClassroomGrid = ({ course, classroom, onSelect }) => {
  const classrooms = ["1A", "1B", "2A", "2B", "3A", "3B"];

  return (
    <div className="class-grid">
      {classrooms.map((t) => {
        const full = `${t}-${course}`;
        return (
          <button
            key={full}
            type="button"
            className={`class-btn ${classroom === full ? "active" : ""}`}
            onClick={() => onSelect(full)}
          >
            {full}
          </button>
        );
      })}
    </div>
  );
};

const PixPayment = ({ selectedPrice, fileName, onFileChange }) => (
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
      Realize o pagamento no valor de <strong>{selectedPrice}</strong> e envie o comprovante
      abaixo.
    </p>
    <label className="upload-area">
      <input type="file" accept="image/*,.pdf" onChange={onFileChange} />
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
);

const CashPayment = ({ selectedPrice }) => (
  <div className="cash-box">
    <div className="cash-icon">💵</div>
    <h4>Pagamento em dinheiro</h4>
    <p>
      O pagamento no valor de <strong>{selectedPrice}</strong> deverá ser entregue presencialmente
      para os representantes dos 3º Anos.
    </p>
    <p className="cash-info-text">
      ℹ️ O código do pedido será exibido após a confirmação
    </p>
    <div className="info-alert">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path d="M8 11V8M8 5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span>Traga o valor exato para facilitar o pagamento</span>
    </div>
  </div>
);

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function Pricing({ goToHome }) {
  // Estados de UI
  const [hearts, setHearts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [lastSend, setLastSend] = useState(0);
  const [fileUploading, setFileUploading] = useState(false);

  // Estados do formulário
  const [senderType, setSenderType] = useState("anonimo");
  const [receiverType, setReceiverType] = useState("anonimo");
  const [paymentMethod, setPaymentMethod] = useState("pix");
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
  const [proofUrl, setProofUrl] = useState("");
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [serenataMusic, setSerenataMusic] = useState("");

  // Estados do perfil
  const [nome, setNome] = useState("");
  const [turma, setTurma] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cartinhasCompradas, setCartinhasCompradas] = useState(0);
  const [totalGasto, setTotalGasto] = useState(0);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [profileId, setProfileId] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [phoneFromProfile, setPhoneFromProfile] = useState("");
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [addSerenata, setAddSerenata] = useState(false);

  // Estado do contador regressivo
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const formRef = useRef(null);
  const MAX_SENDS = 2;
  const COOLDOWN_TIME = 7 * 60 * 1000;

  // ========================================
  // DADOS ESTÁTICOS
  // ========================================

  const plans = [
    {
      id: "p1",
      emoji: "💌",
      title: "Cartinha",
      price: "R$ 1,00",
      features: ["1 Carta"],
    },
    {
      id: "p2",
      emoji: "💌 + 🍭",
      title: "Cartinha com Pirulito",
      price: "R$ 2,00",
      features: ["1 Carta", "1 Pirulito"],
    },
    {
      id: "p3",
      emoji: "💌 + 🍬",
      title: "Cartinha com Bombom",
      price: "R$ 3,00",
      features: ["1 Carta", "1 Bombom"],
    },
    {
      id: "p4",
      emoji: "💌🍭🍬",
      title:"Cartinha com mini Buquê",
      price: "R$ 0,00",
      features: ["1 Carta", "1 Pirulito", "1 Bombom"],
    },

  const courseOptions = [
    { value: "ADM", label: "Administração" },
    { value: "DS", label: "Des. Sistemas" },
  ];

  const senderCourseOptions = [
    { value: "ADM", label: "Administração" },
    { value: "DS", label: "Des. Sistemas" },
    { value: "", label: "Não informar" },
  ];

  const senderTypeOptions = [
    { value: "identificado", label: "Identificado" },
    { value: "anonimo", label: "Anônimo" },
  ];

  const paymentOptions = [
    { value: "pix", label: "Pix", icon: "🔑" },
    { value: "especie", label: "Espécie", icon: "💵" },
  ];

  // ========================================
  // FUNÇÕES AUXILIARES
  // ========================================

  const gerarCodigoPedido = useCallback(() => {
    const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let codigo = "CARTA-";
    for (let i = 0; i < 6; i++) {
      const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
      codigo += caracteres[indiceAleatorio];
    }
    return codigo;
  }, []);

  const uploadProof = useCallback(async (file) => {
    if (!file) return null;

    try {
      setFileUploading(true);
      const fileName = `${Date.now()}-${file.name}`;

      const { error } = await supabase.storage
        .from("proofs")
        .upload(fileName, file, { upsert: false });

      if (error) {
        console.error(error);
        return null;
      }

      const { data } = supabase.storage.from("proofs").getPublicUrl(fileName);
      return data.publicUrl;
    } catch (err) {
      console.error(err);
      return null;
    } finally {
      setFileUploading(false);
    }
  }, []);

  const resetForm = useCallback(() => {
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
    setSerenataMusic("");
  }, []);

  const handleSuccessClose = useCallback(() => {
    setSent(false);
    resetForm();
  }, [resetForm]);

  // ========================================
  // HANDLERS
  // ========================================
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const stored = JSON.parse(localStorage.getItem("ce_cooldown") || "{}");

      if (!stored.cooldownUntil) {
        setCooldownLeft(0);
        return;
      }

      const remaining = stored.cooldownUntil - Date.now();

      if (remaining <= 0) {
        localStorage.removeItem("ce_cooldown");
        setCooldownLeft(0);
      } else {
        setCooldownLeft(Math.ceil(remaining / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handlePlanSelect = useCallback((plan) => {
    setSelected(plan);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Arquivo muito grande. Máximo 10MB.");
      return;
    }

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Formato inválido.");
      return;
    }

    setProofFile(file);
    setFileName(file.name);
  }, []);

  const handleSenderCourseChange = useCallback((value) => {
    setSenderCourse(value);
    setSenderClassroom("");
  }, []);

  const handleCourseChange = useCallback((value) => {
    setCourse(value);
    setClassroom("");
    setReceiverType("identificado");
  }, []);

  function getCooldownData() {
    return JSON.parse(localStorage.getItem("ce_cooldown") || "{}");
  }

  function registerSend() {
    const data = getCooldownData();
    const sends = data.sends || [];
    const recentSends = sends.filter(
      (timestamp) => Date.now() - timestamp < COOLDOWN_TIME
    );

    recentSends.push(Date.now());

    if (recentSends.length >= MAX_SENDS) {
      const cooldownUntil = Date.now() + COOLDOWN_TIME;
      localStorage.setItem(
        "ce_cooldown",
        JSON.stringify({
          sends: [],
          cooldownUntil,
        })
      );

      return {
        cooldown: true,
        cooldownUntil,
      };
    }

    localStorage.setItem(
      "ce_cooldown",
      JSON.stringify({
        sends: recentSends,
        cooldownUntil: null,
      })
    );

    return {
      cooldown: false,
    };
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading || fileUploading || savingProfile) return;

    const cooldownData = getCooldownData();

    if (
      cooldownData.cooldownUntil &&
      Date.now() < cooldownData.cooldownUntil
    ) {
      const remaining = Math.ceil(
        (cooldownData.cooldownUntil - Date.now()) / 1000
      );

      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;

      alert(
        `Você atingiu o limite de envios.\nAguarde ${minutes}m ${seconds}s para enviar novamente.`
      );

      return;
    }

    const now = Date.now();

    if (now - lastSend < 5000) {
      alert("Aguarde alguns segundos antes de enviar novamente");
      return;
    }

    if (!selected) {
      alert("Escolha um plano");
      return;
    }

    if (!receiverName.trim()) {
      alert("Digite o nome do destinatário");
      return;
    }

    const cleanMessage = message.trim();

    if (!cleanMessage) {
      alert("Digite a mensagem");
      return;
    }

    if (cleanMessage.length < 3) {
      alert("Mensagem muito curta");
      return;
    }

    if (cleanMessage.length > 500) {
      alert("Mensagem muito grande");
      return;
    }

    if (senderType === "identificado") {
      if (!senderName.trim()) {
        alert("Digite seu nome completo");
        return;
      }

      if (senderCourse && !senderClassroom) {
        alert("Selecione a turma do remetente");
        return;
      }
    }

    if (receiverType === "identificado" && !course) {
      alert("Selecione o curso");
      return;
    }

    if (receiverType === "identificado" && course && !classroom) {
      alert("Selecione a turma");
      return;
    }

    let finalProofUrl = null;

    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Você precisa estar logado.");
        setLoading(false);
        return;
      }

      if (paymentMethod === "pix") {
        if (!proofFile) {
          alert("Envie o comprovante");
          return;
        }

        finalProofUrl = await uploadProof(proofFile);

        if (!finalProofUrl) {
          alert("Erro no upload do comprovante");
          return;
        }
      }

      const valorMap = {
        p1: 1,
        p2: 2,
        p3: 3,
        p4: 7,
      };

      const valor = valorMap[selected?.id] ?? 0;

      let code = null;

      if (paymentMethod === "especie") {
        code = gerarCodigoPedido();
      }

      const { error } = await supabase.from("orders").insert([
        {
          user_id: user.id,
          plan: selected.title,
          sender_type: senderType,
          sender_name:
            senderType === "anonimo"
              ? null
              : senderName.trim(),
          sender_classroom:
            senderType === "anonimo"
              ? null
              : senderCourse
                ? senderClassroom
                : null,
          receiver_type: receiverType,
          receiver_name: receiverName.trim(),
          course:
            receiverType === "anonimo"
              ? null
              : course || null,
          classroom:
            receiverType === "anonimo"
              ? null
              : course
                ? classroom
                : null,
          message: cleanMessage,
          serenata_music: serenataMusic || null,
          payment_method: paymentMethod,
          proof_url: finalProofUrl,
          order_code: code,
          status: "pending",
          valor,
        },
      ]);

      if (error) {
        throw error;
      }

      registerSend();
      setOrderCode(code || "");
      setLastSend(now);
      setSent(true);

    } catch (err) {
      console.error(err);
      alert(err?.message || "Erro ao enviar pedido.");
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // EFFECTS
  // ========================================

  // Contador regressivo
  useEffect(() => {
    const deadline = new Date("2026-06-10T23:59:59").getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = deadline - now;

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  // Carregar perfil
  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoadingProfile(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active || !user) {
        setLoadingProfile(false);
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
        alert("Erro ao carregar perfil: " + error.message);
        setLoadingProfile(false);
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
      setTelefone(savedPhone || "");

      const shouldShowPopup =
        !profileData ||
        !profileData.onboarding_completed ||
        !savedNome ||
        !savedTurma ||
        (googleUser && !savedPhone);

      setShowInfoPopup(shouldShowPopup);
      setLoadingProfile(false);
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  // Carregar total gasto
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

  // Animação de corações
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

  // Reset de campos baseado no tipo
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

  // ========================================
  // FORMATAÇÃO
  // ========================================

  const formattedTotalGasto = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(totalGasto);

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="pricing-page">
      <div className="binary-bg" />
      <HeartBackground hearts={hearts} />

      {loading && <LoadingOverlay />}
      {sent && (
        <SuccessOverlay 
          orderCode={orderCode} 
          paymentMethod={paymentMethod}
          onClose={handleSuccessClose}
        />
      )}

      <main className="checkout-shell">
        {/* COLUNA PRINCIPAL */}
        <section className="hero-column">
          <button className="back-btn" onClick={goToHome} type="button">
            ← Voltar para início
          </button>

          <ProfilePanel
            profileId={profileId}
            loadingProfile={loadingProfile}
            nome={nome}
            turma={turma}
            profileEmail={profileEmail}
            cartinhasCompradas={cartinhasCompradas}
            formattedTotalGasto={formattedTotalGasto}
            phoneFromProfile={phoneFromProfile}
            telefone={telefone}
            showProfilePanel={showProfilePanel}
            setShowProfilePanel={setShowProfilePanel}
          />

          <CountdownTimer timeLeft={timeLeft} />

          <div className="pricing-hero">
            <span className="badge">💘 Correio Elegante • Turmas 3º Anos 2026</span>
            <h1>Tabela de Opções</h1>
            <p>
              Selecione a opção ideal para enviar sua mensagem especial. Preencha os dados e
              participe do Correio Elegante da ETEMAA.
            </p>
          </div>

          <div className="plans-grid">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                selected={selected}
                loading={loading}
                onSelect={handlePlanSelect}
              />
            ))}
          </div>

          <PromoBlock />
        </section>

        {/* COLUNA DO FORMULÁRIO */}
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
                {/* SEÇÃO: Quem envia */}
                <div className="form-section">
                  <h3>
                    <span className="section-icon">💌</span> Informações de quem envia
                  </h3>

                  <div className="input-group">
                    <label htmlFor="sender-type">Tipo de envio</label>
                    <RadioGroup
                      options={senderTypeOptions}
                      value={senderType}
                      onChange={setSenderType}
                      name="senderType"
                    />
                  </div>

                  {senderType === "identificado" && (
                    <>
                      <div className="input-group">
                        <label htmlFor="sender-name">Seu nome</label>
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
                        <RadioGroup
                          options={senderCourseOptions}
                          value={senderCourse}
                          onChange={handleSenderCourseChange}
                          name="senderCourse"
                        />
                      </div>

                      {senderCourse && (
                        <div className="input-group">
                          <label htmlFor="sender-classroom">Turma do remetente</label>
                          <ClassroomGrid
                            course={senderCourse}
                            classroom={senderClassroom}
                            onSelect={setSenderClassroom}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="form-divider" />

                {/* SEÇÃO: Destinatário */}
                <div className="form-section">
                  <h3>
                    <span className="section-icon">🎯</span> Informações do Destinatário
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
                    <RadioGroup
                      options={courseOptions}
                      value={course}
                      onChange={handleCourseChange}
                      name="course"
                    />
                  </div>

                  {course && receiverType === "identificado" && (
                    <div className="input-group">
                      <label htmlFor="classroom">Turma do destinatário</label>
                      <ClassroomGrid course={course} classroom={classroom} onSelect={setClassroom} />
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
                  
                  {selected?.title?.toLowerCase().includes("serenata") && (
                    <div className="input-group">
                      <label htmlFor="serenata-music">Música da serenata 🎶</label>
                      <input
                        type="text"
                        id="serenata-music"
                        value={serenataMusic}
                        onChange={(e) => setSerenataMusic(e.target.value)}
                        placeholder="Ex: Perfect - Ed Sheeran"
                      />
                    </div>
                  )}
                </div>

                <div className="form-divider" />

                {/* SEÇÃO: Pagamento */}
                <div className="form-section">
                  <h3>
                    <span className="section-icon">💳</span> Forma de Pagamento
                  </h3>

                  <div className="input-group">
                    <label htmlFor="payment">Método de pagamento</label>
                    <div className="payment-options">
                      {paymentOptions.map((option) => (
                        <label
                          key={option.value}
                          className={`payment-option ${paymentMethod === option.value ? "active" : ""}`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            value={option.value}
                            checked={paymentMethod === option.value}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                          />
                          <div className="payment-content">
                            <span className="payment-icon">{option.icon}</span>
                            <span>{option.label}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {paymentMethod === "pix" && (
                    <PixPayment
                      selectedPrice={selected.price}
                      fileName={fileName}
                      onFileChange={handleFileChange}
                    />
                  )}

                  {paymentMethod === "especie" && (
                    <CashPayment selectedPrice={selected.price} />
                  )}
                </div>

                <button
                  type="submit"
                  className="confirm-btn"
                  disabled={loading || fileUploading || cooldownLeft > 0}
                >
                  {loading ? (
                    <>
                      <span className="btn-spinner"></span>
                      Processando...
                    </>
                  ) : cooldownLeft > 0 ? (
                    <>
                      Aguarde {Math.floor(cooldownLeft / 60)}:
                      {String(cooldownLeft % 60).padStart(2, "0")}
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
