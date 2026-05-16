import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Admin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

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
    const interval = setInterval(fetchOrders, 5000);
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
    return new Date(dateString).toLocaleString("pt-BR");
  }

  const filteredOrders = orders
    .filter((order) => {
      if (filter === "all") return true;
      return order.status === filter;
    })
    .filter((order) =>
      order.order_code?.toLowerCase().includes(search.toLowerCase())
    );

  if (loading) return <h2>Carregando...</h2>;

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h1>📦 Admin - Pedidos</h1>

      {/* SEARCH */}
      <input
        placeholder="Pesquisar por código..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 10, padding: 6 }}
      />

      {/* FILTERS */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button onClick={() => setFilter("all")}>Todos</button>
        <button onClick={() => setFilter("pending")}>Pendentes</button>
        <button onClick={() => setFilter("paid")}>Pagos</button>
        <button onClick={() => setFilter("delivered")}>Entregues</button>
      </div>

      {/* ORDERS */}
      {filteredOrders.map((order) => (
        <div
          key={order.id}
          style={{
            border: "1px solid rgba(255,255,255,0.1)",
            padding: 12,
            marginBottom: 12,
          }}
        >
          <p><strong>ID:</strong> {order.id}</p>
          <p><strong>Código:</strong> {order.order_code}</p>
          <p><strong>Plano:</strong> {order.plan}</p>
          <p><strong>Mensagem:</strong> {order.message}</p>
          <p><strong>Destinatário:</strong> {order.receiver_name}</p>
          <p><strong>Status:</strong> {order.status}</p>

          {/* PAGAMENTO */}
          <p>
            <strong>Pagamento:</strong>{" "}
            {order.payment_method === "pix"
              ? "PIX"
              : order.payment_method === "cash"
              ? "Espécie"
              : order.payment_method}
          </p>

          <p>
            <strong>Data:</strong> {formatDate(order.created_at)}
          </p>

          {/* DEBUG TOTAL (banco inteiro) */}
          <details style={{ marginTop: 10 }}>
            <summary>Ver JSON completo</summary>
            <pre style={{ fontSize: 12 }}>
              {JSON.stringify(order, null, 2)}
            </pre>
          </details>

          {/* COMPROVANTE (SÓ PIX) */}
          {order.payment_method === "pix" && order.proof_url && (
            <div style={{ marginTop: 10 }}>
              <p><strong>Comprovante PIX:</strong></p>

              <a
                href={order.proof_url}
                target="_blank"
                rel="noreferrer"
              >
                Abrir comprovante
              </a>

              <div>
                <img
                  src={order.proof_url}
                  alt="comprovante"
                  style={{ width: 200 }}
                />
              </div>
            </div>
          )}

          {/* ACTIONS */}
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button onClick={() => updateStatus(order.id, "pending")}>
              Pending
            </button>

            <button onClick={() => updateStatus(order.id, "paid")}>
              Paid
            </button>

            <button onClick={() => updateStatus(order.id, "delivered")}>
              Delivered
            </button>

            <button
              onClick={() => undoStatus(order)}
              disabled={!order.previous_status}
            >
              Undo
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}