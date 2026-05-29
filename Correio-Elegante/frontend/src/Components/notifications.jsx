import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function loadNotifications() {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar notificações:", error);
      setLoading(false);
      return;
    }

    setNotifications(data || []);
    setLoading(false);
  }

  async function markAsRead(id) {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);

    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* BOTÃO SINO */}
      <button
        className="notif-button"
        onClick={() => setOpen(true)}
      >
        🔔

        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount}</span>
        )}
      </button>

      {/* POPUP */}
      {open && (
        <div className="notif-overlay" onClick={() => setOpen(false)}>
          <div className="notif-modal" onClick={(e) => e.stopPropagation()}>

            <div className="notif-header">
              <h2>Notificações</h2>
              <button onClick={() => setOpen(false)}>✖</button>
            </div>

            <div className="notif-body">

              {loading ? (
                <p>Carregando...</p>
              ) : notifications.length === 0 ? (
                <p style={{ opacity: 0.6 }}>Nenhuma notificação</p>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    className={`notif-card ${n.read ? "read" : "unread"}`}
                    onClick={() => markAsRead(n.id)}
                  >
                    <div className="notif-title">{n.title}</div>
                    <div className="notif-message">{n.message}</div>
                    <div className="notif-type">{n.type}</div>
                  </div>
                ))
              )}

            </div>

          </div>
        </div>
      )}
    </>
  );
}