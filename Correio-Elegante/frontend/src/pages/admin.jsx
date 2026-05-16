import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Admin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState(null);

  async function fetchOrders() {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setError("Erro ao buscar pedidos");
        setLoading(false);
        return;
      }

      setOrders(data || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();

    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  async function updateStatus(id, status) {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Erro ao atualizar status");
    } else {
      fetchOrders();
    }
  }

  const filteredOrders = (orders || []).filter((order) => {
    if (filter === "all") return true;
    return order.status === filter;
  });

  if (loading) return <h2 style={{ padding: 20 }}>Carregando pedidos...</h2>;

  if (error) return <h2 style={{ padding: 20, color: "red" }}>{error}</h2>;

  return (
    <div style={{ padding: 20 }}>
      <h1>📦 Admin - Pedidos</h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <button onClick={() => setFilter("all")}>Todos</button>
        <button onClick={() => setFilter("pending")}>Pendentes</button>
        <button onClick={() => setFilter("paid")}>Pagos</button>
        <button onClick={() => setFilter("delivered")}>Entregues</button>
      </div>

      {filteredOrders.length === 0 ? (
        <p>Nenhum pedido encontrado para esse filtro.</p>
      ) : (
        filteredOrders.map((order) => (
          <div
            key={order.id}
            style={{
              border: "1px solid #ccc",
              marginBottom: 10,
              padding: 10,
              borderRadius: 8,
            }}
          >
            <p><strong>Código:</strong> {order.order_code}</p>
            <p><strong>Plano:</strong> {order.plan}</p>
            <p><strong>Mensagem:</strong> {order.message}</p>
            <p><strong>Destinatário:</strong> {order.receiver_name}</p>
            <p><strong>Status:</strong> {order.status}</p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={() => updateStatus(order.id, "pending")}>
                Pending
              </button>

              <button onClick={() => updateStatus(order.id, "paid")}>
                Paid
              </button>

              <button onClick={() => updateStatus(order.id, "delivered")}>
                Delivered
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}