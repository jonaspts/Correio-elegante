import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import "../noti.css";

const SEEN_GLOBAL_KEY = "seen_global_notifications";

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [globalPopup, setGlobalPopup] = useState(null);
    const [userId, setUserId] = useState("");
    const [seenGlobalIds, setSeenGlobalIds] = useState([]);

    const getSeenGlobalIds = () => {
        try {
            return JSON.parse(localStorage.getItem(SEEN_GLOBAL_KEY) || "[]");
        } catch {
            return [];
        }
    };

    const saveSeenGlobalIds = (ids) => {
        localStorage.setItem(SEEN_GLOBAL_KEY, JSON.stringify(ids));
        setSeenGlobalIds(ids);
    };

    useEffect(() => {
        setSeenGlobalIds(getSeenGlobalIds());
    }, []);

    async function loadNotifications(currentUserId) {
        setLoading(true);

        const { data: personal, error: err1 } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", currentUserId)
            .eq("is_global", false)
            .order("created_at", { ascending: false });

        const { data: globals, error: err2 } = await supabase
            .from("notifications")
            .select("*")
            .eq("is_global", true)
            .order("created_at", { ascending: false });

        if (err1 || err2) {
            console.error(err1 || err2);
            setLoading(false);
            return;
        }

        const merged = [...(globals || []), ...(personal || [])].sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        setNotifications(Array.isArray(merged) ? merged : []);

        const latestSeen = getSeenGlobalIds();
        const unseenGlobal = (globals || []).find(
            (n) => !latestSeen.includes(n.id)
        );

        setGlobalPopup(unseenGlobal || null);
        setLoading(false);
    }

    async function markAsRead(id) {
        const { error } = await supabase
            .from("notifications")
            .update({ read: true })
            .eq("id", id);

        if (error) {
            console.error(error);
            return;
        }

        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    }

    function dismissGlobalPopup(notification) {
        const seen = getSeenGlobalIds();

        if (!seen.includes(notification.id)) {
            const updated = [...seen, notification.id];
            saveSeenGlobalIds(updated);
        }

        setGlobalPopup(null);

        if (userId) {
            loadNotifications(userId);
        }
    }

    const channelRef = useRef(null);

    useEffect(() => {
        async function init() {
            const { data } = await supabase.auth.getUser();
            const user = data?.user;

            if (!user?.id) return;

            setUserId(user.id);
            await loadNotifications(user.id);

            // 🔥 evita duplicar channel
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
            }

            // cria novo channel
            const channel = supabase.channel(`notifications-${user.id}`);

            channel.on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "notifications",
                },
                (payload) => {
                    const newRow = payload.new;

                    if (newRow.is_global || newRow.user_id === user.id) {
                        loadNotifications(user.id);
                    }
                }
            );

            channel.subscribe();

            channelRef.current = channel;
        }

        init();

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
        };
    }, []);

    const unreadCount =
        notifications.filter((n) => !n.read && !n.is_global).length +
        notifications.filter(
            (n) => n.is_global && !seenGlobalIds.includes(n.id)
        ).length;

    return (
        <>
            <button
                className="notif-button"
                onClick={() => setOpen(true)}
                type="button"
            >
                🔔
                {unreadCount > 0 && (
                    <span className="notif-badge">{unreadCount}</span>
                )}
            </button>

            {open && (
                <div className="notif-overlay" onClick={() => setOpen(false)}>
                    <div
                        className="notif-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="notif-header">
                            <h2>Notificações</h2>
                            <button type="button" onClick={() => setOpen(false)}>
                                ✖
                            </button>
                        </div>

                        <div className="notif-body">
                            {loading ? (
                                <p>Carregando...</p>
                            ) : notifications.length === 0 ? (
                                <p style={{ opacity: 0.6 }}>
                                    Nenhuma notificação
                                </p>
                            ) : (
                                notifications.map((n) => {
                                    const isGlobal = !!n.is_global;

                                    const isUnread = isGlobal
                                        ? !seenGlobalIds.includes(n.id)
                                        : !n.read;

                                    return (
                                        <div
                                            key={n.id}
                                            className={`notif-card ${isUnread ? "unread" : "read"
                                                }`}
                                            onClick={() => {
                                                if (!isGlobal) {
                                                    markAsRead(n.id);
                                                }
                                            }}
                                        >
                                            <div className="notif-title">
                                                {n.title}
                                            </div>
                                            <div className="notif-message">
                                                {n.message}
                                            </div>
                                            <div className="notif-type">
                                                {n.type}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}

            {globalPopup && (
                <div
                    className="notif-global-overlay"
                    onClick={() => dismissGlobalPopup(globalPopup)}
                >
                    <div
                        className="notif-global-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="notif-global-chip">
                            Aviso importante
                        </div>
                        <h2>{globalPopup.title}</h2>
                        <p>{globalPopup.message}</p>
                        <button
                            type="button"
                            className="notif-global-btn"
                            onClick={() => dismissGlobalPopup(globalPopup)}
                        >
                            Entendi
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}