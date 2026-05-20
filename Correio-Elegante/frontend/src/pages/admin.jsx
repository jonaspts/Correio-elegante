import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import "../Admin.css";

const STATUS_CONFIG = {
  pending: {
    label: "Pendente",
    icon: "⏳",
    color: "#FFC864",
    bgColor: "rgba(255, 200, 100, 0.1)",
  },
  paid: {
    label: "Pago",
    icon: "✅",
    color: "#64FFAA",
    bgColor: "rgba(100, 255, 170, 0.1)",
  },
  delivered: {
    label: "Entregue",
    icon: "📬",
    color: "#6496FF",
    bgColor: "rgba(100, 150, 255, 0.1)",
  },
  trash: {
    label: "Lixeira",
    icon: "🗑️",
    color: "#FF6464",
    bgColor: "rgba(255, 100, 100, 0.1)",
  },
};

export default function Admin({ goToHome }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' ou 'list'

  const [adminAccess, setAdminAccess] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "";

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: "easeIn" } },
  };

  function normalizeText(value) {
    return String(value || "").toLowerCase().trim();
  }

  async function fetchOrders(showLoading = false) {
    if (showLoading) setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("orders")
      .select(`
      id,
      order_code,
      receiver_name,
      sender_name,
      sender_type,
      plan,
      valor,
      classroom,
      course,
      payment_method,
      proof_url,
      message,
      serenata_music,
      status,
      previous_status,
      created_at
    `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setErrorMessage("Erro ao carregar pedidos.");
      if (showLoading) setLoading(false);
      return;
    }

    setOrders(data || []);
    if (showLoading) setLoading(false);
  }

  useEffect(() => {
    if (!adminAccess) return;

    (async () => {
      await fetchOrders(true);
    })();

    const interval = setInterval(() => {
      fetchOrders(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [adminAccess]);

  function handlePasswordSubmit(e) {
    e.preventDefault();

    if (!ADMIN_PASSWORD) {
      setPasswordError("Senha do admin não configurada no .env");
      return;
    }

    if (adminPassword.trim() === ADMIN_PASSWORD.trim()) {
      setPasswordError("");
      setAdminAccess(true);
      return;
    }

    setPasswordError("Senha incorreta");
  }

  async function updateStatus(id, newStatus) {
    const currentOrder = orders.find((order) => order.id === id);
    if (!currentOrder) return;

    setActionLoading(true);

    const { error } = await supabase
      .from("orders")
      .update({
        previous_status: currentOrder.status || null,
        status: newStatus,
      })
      .eq("id", id);

    setActionLoading(false);

    if (error) {
      alert("Erro ao atualizar status");
      console.error(error);
      return;
    }

    await fetchOrders();
    setExpandedOrder(id);
  }

  async function moveToTrash(id) {
    const ok = confirm("Mover este pedido para a lixeira?");
    if (!ok) return;

    await updateStatus(id, "trash");
  }

  async function undoStatus(order) {
    if (!order?.previous_status) return;

    setActionLoading(true);

    const { error } = await supabase
      .from("orders")
      .update({
        status: order.previous_status,
        previous_status: null,
      })
      .eq("id", order.id);

    setActionLoading(false);

    if (error) {
      alert("Erro ao desfazer");
      console.error(error);
      return;
    }

    await fetchOrders();
  }

  function formatDate(dateString) {
    if (!dateString) return "—";
    const date = new Date(dateString);

    return date.toLocaleString("pt-BR", {
      timeZone: "America/Recife",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatTime(dateString) {
    if (!dateString) return "—";

    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Agora";
    if (minutes < 60) return `${minutes}min`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  }

  const filteredOrders = useMemo(() => {
    const searchLower = normalizeText(search);

    return orders
      .filter((order) => {
        if (filter === "all") return order.status !== "trash";
        return order.status === filter;
      })
      .filter((order) => {
        if (!searchLower) return true;

        return (
          normalizeText(order.order_code).includes(searchLower) ||
          normalizeText(order.receiver_name).includes(searchLower) ||
          normalizeText(order.sender_name).includes(searchLower) ||
          normalizeText(order.plan).includes(searchLower) ||
          normalizeText(order.classroom).includes(searchLower)
        );
      });
  }, [orders, filter, search]);
  
  const stats = useMemo(() => {
    const activeOrders = orders.filter((o) => o.status !== "trash");

    const totalRevenue = activeOrders.reduce(
      (sum, order) => sum + Number(order.valor || 0),
      0
    );

    return {
      total: activeOrders.length,
      pending: activeOrders.filter((o) => o.status === "pending").length,
      paid: activeOrders.filter((o) => o.status === "paid").length,
      delivered: activeOrders.filter((o) => o.status === "delivered").length,
      trash: orders.filter((o) => o.status === "trash").length,
      totalRevenue,
    };
  }, [orders]);

  if (!adminAccess) {
    return (
      <motion.div
        key="admin-password"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="admin-login-page"
      >
        <div className="admin-login-card">
          <div className="login-icon-wrapper">
            <div className="login-icon">🔐</div>
          </div>

          <h1 className="login-title">Painel Administrativo</h1>
          <p className="login-subtitle">Digite a senha para acessar o sistema</p>

          <form onSubmit={handlePasswordSubmit} className="login-form">
            <div className="input-wrapper">
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Senha de acesso"
                autoComplete="current-password"
                className="login-input"
              />
            </div>

            {passwordError && (
              <div className="error-message">{passwordError}</div>
            )}

            <button type="submit" className="login-submit-btn">
              <span>Entrar no Painel</span>
              <span className="btn-arrow">→</span>
            </button>

            <button type="button" onClick={goToHome} className="login-back-btn">
              ← Voltar para início
            </button>
          </form>
        </div>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <motion.div
        key="admin-loading"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="admin-loading-page"
      >
        <div className="loading-content">
          <div className="loading-spinner-modern"></div>
          <p className="loading-text">Carregando pedidos...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="admin-panel"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="admin-dashboard"
    >
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content-wrapper">
          <div className="header-left">
            <button className="back-button" onClick={goToHome}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Início
            </button>
            <div className="header-title-group">
              <h1 className="dashboard-title">
                <span className="title-icon">📦</span>
                Gerenciador de Entregas
              </h1>
              <p className="dashboard-subtitle">Correio Elegante 2026</p>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card-modern">
            <div className="stat-header">
              <span className="stat-icon-modern">📊</span>
              <span className="stat-label-modern">Total de Pedidos</span>
            </div>
            <div className="stat-value-modern">{stats.total}</div>
            <div className="stat-footer">Ativos no sistema</div>
          </div>

          <div className="stat-card-modern stat-pending">
            <div className="stat-header">
              <span className="stat-icon-modern">⏳</span>
              <span className="stat-label-modern">Pendentes</span>
            </div>
            <div className="stat-value-modern">{stats.pending}</div>
            <div className="stat-footer">Aguardando pagamento</div>
          </div>

          <div className="stat-card-modern stat-paid">
            <div className="stat-header">
              <span className="stat-icon-modern">✅</span>
              <span className="stat-label-modern">Pagos</span>
            </div>
            <div className="stat-value-modern">{stats.paid}</div>
            <div className="stat-footer">Confirmados</div>
          </div>

          <div className="stat-card-modern stat-delivered">
            <div className="stat-header">
              <span className="stat-icon-modern">📬</span>
              <span className="stat-label-modern">Entregues</span>
            </div>
            <div className="stat-value-modern">{stats.delivered}</div>
            <div className="stat-footer">Completados</div>
          </div>

          <div className="stat-card-modern stat-revenue">
            <div className="stat-header">
              <span className="stat-icon-modern">💰</span>
              <span className="stat-label-modern">Receita Total</span>
            </div>
            <div className="stat-value-modern">R$ {stats.totalRevenue.toFixed(2)}</div>
            <div className="stat-footer">Valor arrecadado</div>
          </div>

          <div className="stat-card-modern stat-trash">
            <div className="stat-header">
              <span className="stat-icon-modern">🗑️</span>
              <span className="stat-label-modern">Lixeira</span>
            </div>
            <div className="stat-value-modern">{stats.trash}</div>
            <div className="stat-footer">Arquivados</div>
          </div>
        </div>
      </section>

      {/* Controls */}
      <section className="controls-section">
        <div className="controls-wrapper">
          {/* Search */}
          <div className="search-wrapper">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="2" />
              <path d="M12 12L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por código, nome, turma..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input-modern"
            />
            {search && (
              <button className="search-clear-btn" onClick={() => setSearch("")}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="filters-wrapper">
            <button
              className={`filter-chip ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              <span className="filter-dot"></span>
              Todos
            </button>
            <button
              className={`filter-chip ${filter === "pending" ? "active" : ""}`}
              onClick={() => setFilter("pending")}
            >
              <span className="filter-dot pending"></span>
              Pendentes
            </button>
            <button
              className={`filter-chip ${filter === "paid" ? "active" : ""}`}
              onClick={() => setFilter("paid")}
            >
              <span className="filter-dot paid"></span>
              Pagos
            </button>
            <button
              className={`filter-chip ${filter === "delivered" ? "active" : ""}`}
              onClick={() => setFilter("delivered")}
            >
              <span className="filter-dot delivered"></span>
              Entregues
            </button>
            <button
              className={`filter-chip ${filter === "trash" ? "active" : ""}`}
              onClick={() => setFilter("trash")}
            >
              <span className="filter-dot trash"></span>
              Lixeira
            </button>
          </div>
        </div>
      </section>

      {/* Orders */}
      <section className="orders-section">
        {errorMessage && (
          <div className="error-banner">{errorMessage}</div>
        )}

        {filteredOrders.length === 0 ? (
          <div className="empty-state-modern">
            <div className="empty-icon-modern">📭</div>
            <h3 className="empty-title">Nenhum pedido encontrado</h3>
            <p className="empty-description">
              {search ? "Tente ajustar sua busca" : "Não há pedidos nesta categoria"}
            </p>
          </div>
        ) : (
          <div className="orders-grid-modern">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                isExpanded={expandedOrder === order.id}
                onToggleExpand={() =>
                  setExpandedOrder((prev) =>
                    prev === order.id ? null : order.id
                  )
                }
                
                onUpdateStatus={updateStatus}
                onMoveToTrash={moveToTrash}
                onUndo={undoStatus}
                actionLoading={actionLoading}
                formatDate={formatDate}
                formatTime={formatTime}
              />
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
}

// Componente de Card de Pedido
function OrderCard({
  order,
  isExpanded,
  onToggleExpand,
  onUpdateStatus,
  onMoveToTrash,
  onUndo,
  actionLoading,
  formatDate,
  formatTime,
}) {
  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

  return (
    <div className={`order-card-modern status-${order.status} ${isExpanded ? "expanded" : ""}`}>
      {/* Header */}
      <div className="order-card-header">
        <div className="order-card-top">
          <div className="order-badge-group">
            <span className={`status-badge status-${order.status}`}>
              <span className="badge-icon">{status.icon}</span>
              <span className="badge-text">{status.label}</span>
            </span>
            <span className="order-code-badge">#{order.order_code || "—"}</span>
          </div>
          <span className="order-time-badge">{formatTime(order.created_at)}</span>
        </div>

        <div className="order-quick-info">
          <div className="info-item">
            <span className="info-label">Para</span>
            <span className="info-value">{order.receiver_name || "—"}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Plano</span>
            <span className="info-value">{order.plan || "—"}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Valor</span>
            <span className="info-value">R$ {Number(order.valor || 0).toFixed(2)}</span>
          </div>
        </div>

        <button
          className="expand-toggle"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}
        >
          {isExpanded ? "Fechar" : "Ver mais"}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Details */}
      {isExpanded && (
        <div className="order-card-body">
          <div className="details-grid">
            {/* Remetente */}
            <div className="detail-section">
              <h4 className="section-title">
                <span className="section-icon">💌</span>
                Remetente
              </h4>
              <div className="detail-rows">
                <div className="detail-row">
                  <span className="detail-key">Tipo</span>
                  <span className="detail-value">
                    {order.sender_type === "identificado" ? "Identificado" : "Anônimo"}
                  </span>
                </div>
                {order.sender_name && (
                  <div className="detail-row">
                    <span className="detail-key">Nome</span>
                    <span className="detail-value">{order.sender_name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Destinatário */}
            <div className="detail-section">
              <h4 className="section-title">
                <span className="section-icon">🎯</span>
                Destinatário
              </h4>
              <div className="detail-rows">
                <div className="detail-row">
                  <span className="detail-key">Nome</span>
                  <span className="detail-value">{order.receiver_name || "—"}</span>
                </div>
                {order.course && (
                  <div className="detail-row">
                    <span className="detail-key">Curso</span>
                    <span className="detail-value">{order.course}</span>
                  </div>
                )}
                {order.classroom && (
                  <div className="detail-row">
                    <span className="detail-key">Turma</span>
                    <span className="detail-value">{order.classroom}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Pagamento */}
            <div className="detail-section">
              <h4 className="section-title">
                <span className="section-icon">💳</span>
                Pagamento
              </h4>
              <div className="detail-rows">
                <div className="detail-row">
                  <span className="detail-key">Método</span>
                  <span className="detail-value">
                    {order.payment_method === "pix" ? "PIX" : "Espécie"}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-key">Data</span>
                  <span className="detail-value">{formatDate(order.created_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mensagem */}
          <div className="message-section">
            <h4 className="section-title">
              <span className="section-icon">✉️</span>
              Mensagem
            </h4>
            <div className="message-content">
              {order.message || "Sem mensagem"}
            </div>
          </div>
          {order.serenata_music && (
            <div className="message-section">
              <h4 className="section-title">
                <span className="section-icon">🎵</span>
                Serenata
              </h4>

              <div className="message-content">
                {order.serenata_music}
              </div>
            </div>
          )}

          {/* Comprovante */}
          {order.payment_method === "pix" && order.proof_url && (
            <div className="proof-section">
              <h4 className="section-title">
                <span className="section-icon">📎</span>
                Comprovante
              </h4>
              <details className="proof-toggle">
                <summary className="proof-summary">Ver comprovante</summary>
                <div className="proof-wrapper">
                  <img src={order.proof_url} alt="Comprovante" className="proof-img" />
                  <a href={order.proof_url} target="_blank" rel="noreferrer" className="proof-link">
                    Abrir em nova aba →
                  </a>
                </div>
              </details>
            </div>
          )}

          {/* Actions */}
          <div className="actions-section">
            <h4 className="section-title">
              <span className="section-icon">⚙️</span>
              Ações
            </h4>

            <div className="status-buttons">
              <button
                className={`status-action-btn pending ${order.status === "pending" ? "active" : ""}`}
                onClick={() => onUpdateStatus(order.id, "pending")}
                disabled={actionLoading}
              >
                <span>⏳</span>
                Pendente
              </button>
              <button
                className={`status-action-btn paid ${order.status === "paid" ? "active" : ""}`}
                onClick={() => onUpdateStatus(order.id, "paid")}
                disabled={actionLoading}
              >
                <span>✅</span>
                Pago
              </button>
              <button
                className={`status-action-btn delivered ${order.status === "delivered" ? "active" : ""}`}
                onClick={() => onUpdateStatus(order.id, "delivered")}
                disabled={actionLoading}
              >
                <span>📬</span>
                Entregue
              </button>
            </div>

            <div className="utility-buttons">
              <button
                className="utility-btn undo-btn"
                onClick={() => onUndo(order)}
                disabled={!order.previous_status || actionLoading}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8H13M3 8L7 4M3 8L7 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Desfazer
              </button>
              <button
                className="utility-btn trash-btn"
                onClick={() => onMoveToTrash(order.id)}
                disabled={actionLoading}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 4H13M5 4V3C5 2.44772 5.44772 2 6 2H10C10.5523 2 11 2.44772 11 3V4M6 7V11M10 7V11M4 4H12V13C12 13.5523 11.5523 14 11 14H5C4.44772 14 4 13.5523 4 13V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Lixeira
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}