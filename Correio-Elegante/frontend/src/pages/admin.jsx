import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import "../App.css";

export default function Admin({ goToHome }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);

  async function fetchOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setOrders(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  async function updateStatus(id, newStatus) {
    const order = orders.find((o) => o.id === id);

    const { error } = await supabase
      .from("orders")
      .update({
        status: newStatus,
        previous_status: order?.status || null,
      })
      .eq("id", id);

    if (error) {
      alert("Erro ao atualizar status");
      return;
    }

    fetchOrders();
  }

  async function deleteOrder(id) {
    if (!confirm("Tem certeza que deseja deletar este pedido? Esta ação não pode ser desfeita.")) {
      return;
    }

    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Erro ao deletar pedido");
      return;
    }

    setExpandedOrder(null);
    fetchOrders();
  }

  async function undoStatus(order) {
    if (!order?.previous_status) return;

    const { error } = await supabase
      .from("orders")
      .update({
        status: order.previous_status,
        previous_status: null,
      })
      .eq("id", order.id);

    if (error) {
      alert("Erro ao desfazer");
      return;
    }

    fetchOrders();
  }

  function formatDate(dateString) {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleString("pt-BR", {
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
    if (minutes < 60) return `${minutes}min atrás`;
    if (hours < 24) return `${hours}h atrás`;
    return `${days}d atrás`;
  }

  const filteredOrders = orders
    .filter((order) => {
      if (filter === "all") return true;
      return order.status === filter;
    })
    .filter((order) => {
      const searchLower = search.toLowerCase();
      return (
        order.order_code?.toLowerCase().includes(searchLower) ||
        order.receiver_name?.toLowerCase().includes(searchLower) ||
        order.sender_name?.toLowerCase().includes(searchLower)
      );
    });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    paid: orders.filter((o) => o.status === "paid").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return "⏳";
      case "paid":
        return "✅";
      case "delivered":
        return "📬";
      default:
        return "📋";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "Pendente";
      case "paid":
        return "Pago";
      case "delivered":
        return "Entregue";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="loading-spinner"></div>
        <p>Carregando pedidos...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* HEADER */}
      <header className="admin-header">
        <button className="back-btn" onClick={goToHome} type="button">
          ← Voltar para início
        </button>
        
        <div className="admin-header-content">
          <h1>
            <span className="header-icon">📦</span>
            Painel Administrativo
          </h1>
          <p className="header-subtitle">Gerenciamento de Pedidos • Correio Elegante 2026</p>
        </div>
      </header>

      {/* STATS */}
      <section className="admin-stats">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>

        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <span className="stat-value">{stats.pending}</span>
            <span className="stat-label">Pendentes</span>
          </div>
        </div>

        <div className="stat-card paid">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <span className="stat-value">{stats.paid}</span>
            <span className="stat-label">Pagos</span>
          </div>
        </div>

        <div className="stat-card delivered">
          <div className="stat-icon">📬</div>
          <div className="stat-content">
            <span className="stat-value">{stats.delivered}</span>
            <span className="stat-label">Entregues</span>
          </div>
        </div>
      </section>

      {/* CONTROLS */}
      <section className="admin-controls">
        <div className="search-container">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16ZM18 18l-4-4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <input
            className="admin-search"
            placeholder="Pesquisar por código, nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="search-clear"
              onClick={() => setSearch("")}
            >
              ✕
            </button>
          )}
        </div>

        <div className="admin-filters">
          <button
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            Todos
          </button>
          <button
            className={`filter-btn ${filter === "pending" ? "active" : ""}`}
            onClick={() => setFilter("pending")}
          >
            Pendentes
          </button>
          <button
            className={`filter-btn ${filter === "paid" ? "active" : ""}`}
            onClick={() => setFilter("paid")}
          >
            Pagos
          </button>
          <button
            className={`filter-btn ${filter === "delivered" ? "active" : ""}`}
            onClick={() => setFilter("delivered")}
          >
            Entregues
          </button>
        </div>
      </section>

      {/* ORDERS LIST */}
      <section className="admin-orders">
        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>Nenhum pedido encontrado</h3>
            <p>Tente ajustar os filtros ou a pesquisa</p>
          </div>
        ) : (
          <div className="orders-grid">
            {filteredOrders.map((order) => {
              const isExpanded = expandedOrder === order.id;

              return (
                <article
                  key={order.id}
                  className={`order-card status-${order.status} ${isExpanded ? "expanded" : ""}`}
                >
                  {/* COMPACT VIEW */}
                  <div
                    className="order-summary"
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  >
                    <div className="order-header">
                      <div className="order-main-info">
                        <span className="order-status-badge">
                          {getStatusIcon(order.status)}
                          {getStatusLabel(order.status)}
                        </span>
                        <h3 className="order-code">#{order.order_code}</h3>
                      </div>
                      <span className="order-time">{formatTime(order.created_at)}</span>
                    </div>

                    <div className="order-preview">
                      <div className="preview-item">
                        <span className="preview-label">Para:</span>
                        <span className="preview-value">{order.receiver_name}</span>
                      </div>
                      <div className="preview-item">
                        <span className="preview-label">Plano:</span>
                        <span className="preview-value">{order.plan}</span>
                      </div>
                      <div className="preview-item">
                        <span className="preview-label">Pgto:</span>
                        <span className="preview-value">
                          {order.payment_method === "pix" ? "PIX" : "Espécie"}
                        </span>
                      </div>
                    </div>

                    <button className="expand-btn">
                      {isExpanded ? "Fechar detalhes ▲" : "Ver detalhes ▼"}
                    </button>
                  </div>

                  {/* EXPANDED VIEW */}
                  {isExpanded && (
                    <div className="order-details">
                      <div className="details-divider"></div>

                      <div className="details-section">
                        <h4>
                          <span className="section-icon">💌</span>
                          Remetente
                        </h4>
                        <div className="detail-row">
                          <span className="detail-label">Tipo:</span>
                          <span className="detail-value">
                            {order.sender_type === "identificado" ? "Identificado" : "Anônimo"}
                          </span>
                        </div>
                        {order.sender_name && (
                          <div className="detail-row">
                            <span className="detail-label">Nome:</span>
                            <span className="detail-value">{order.sender_name}</span>
                          </div>
                        )}
                      </div>

                      <div className="details-section">
                        <h4>
                          <span className="section-icon">🎯</span>
                          Destinatário
                        </h4>
                        <div className="detail-row">
                          <span className="detail-label">Nome:</span>
                          <span className="detail-value">{order.receiver_name}</span>
                        </div>
                        {order.course && (
                          <div className="detail-row">
                            <span className="detail-label">Curso:</span>
                            <span className="detail-value">{order.course}</span>
                          </div>
                        )}
                        {order.classroom && (
                          <div className="detail-row">
                            <span className="detail-label">Turma:</span>
                            <span className="detail-value">{order.classroom}</span>
                          </div>
                        )}
                      </div>

                      <div className="details-section">
                        <h4>
                          <span className="section-icon">✉️</span>
                          Mensagem
                        </h4>
                        <div className="message-box">
                          {order.message || "Sem mensagem"}
                        </div>
                      </div>

                      <div className="details-section">
                        <h4>
                          <span className="section-icon">💳</span>
                          Pagamento
                        </h4>
                        <div className="detail-row">
                          <span className="detail-label">Método:</span>
                          <span className="detail-value">
                            {order.payment_method === "pix" ? "PIX" : "Espécie"}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Data:</span>
                          <span className="detail-value">{formatDate(order.created_at)}</span>
                        </div>
                      </div>

                      {order.payment_method === "pix" && order.proof_url && (
                        <div className="details-section">
                          <h4>
                            <span className="section-icon">📎</span>
                            Comprovante
                          </h4>
                          <details className="proof-details">
                            <summary className="proof-summary">
                              Clique para ver o comprovante
                            </summary>
                            <div className="proof-content">
                              <img
                                src={order.proof_url}
                                alt="Comprovante"
                                className="proof-image"
                              />
                              <a
                                href={order.proof_url}
                                target="_blank"
                                rel="noreferrer"
                                className="proof-link"
                              >
                                Abrir em nova aba →
                              </a>
                            </div>
                          </details>
                        </div>
                      )}

                      <div className="details-section">
                        <h4>
                          <span className="section-icon">⚙️</span>
                          Ações
                        </h4>
                        <div className="status-actions">
                          <button
                            className={`status-btn pending ${order.status === "pending" ? "active" : ""}`}
                            onClick={() => updateStatus(order.id, "pending")}
                          >
                            <span className="btn-icon">⏳</span>
                            Pendente
                          </button>
                          <button
                            className={`status-btn paid ${order.status === "paid" ? "active" : ""}`}
                            onClick={() => updateStatus(order.id, "paid")}
                          >
                            <span className="btn-icon">✅</span>
                            Pago
                          </button>
                          <button
                            className={`status-btn delivered ${order.status === "delivered" ? "active" : ""}`}
                            onClick={() => updateStatus(order.id, "delivered")}
                          >
                            <span className="btn-icon">📬</span>
                            Entregue
                          </button>
                        </div>

                        <div className="utility-actions">
                          <button
                            className="undo-btn"
                            onClick={() => undoStatus(order)}
                            disabled={!order.previous_status}
                          >
                            <span className="btn-icon">↩️</span>
                            Desfazer última ação
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => deleteOrder(order.id)}
                          >
                            <span className="btn-icon">🗑️</span>
                            Deletar pedido
                          </button>
                        </div>
                      </div>

                      {/* JSON DEBUG (Optional) */}
                      <details className="json-details">
                        <summary>🔍 Ver dados completos (JSON)</summary>
                        <pre className="json-content">{JSON.stringify(order, null, 2)}</pre>
                      </details>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
