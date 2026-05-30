import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function AdminUpdates() {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [type, setType] = useState("update");
    const [targetType, setTargetType] = useState("global");
    const [userId, setUserId] = useState("");
    const [loading, setLoading] = useState(false);

    async function handlePublish(e) {
        e.preventDefault();

        const cleanTitle = title.trim();
        const cleanMessage = message.trim();

        if (!cleanTitle || !cleanMessage) {
            alert("Preencha título e mensagem.");
            return;
        }

        if (targetType === "individual" && !userId.trim()) {
            alert("Informe o User ID.");
            return;
        }

        setLoading(true);

        const payload = {
            title: cleanTitle,
            message: cleanMessage,
            type,
            is_global: targetType === "global",
            read: false,
            user_id: targetType === "individual" ? userId.trim() : null,
        };

        const { error } = await supabase
            .from("notifications")
            .insert([payload]);

        setLoading(false);

        if (error) {
            console.error(error);
            alert("Erro ao publicar update");
            return;
        }

        alert("Update publicado 🚀");

        setTitle("");
        setMessage("");
        setType("update");
        setTargetType("global");
        setUserId("");
    }

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Admin - Updates</h1>
            <p style={styles.subtitle}>
                Envio de notificações globais e individuais
            </p>

            <form onSubmit={handlePublish} style={styles.form}>

                <input
                    placeholder="Título"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={styles.input}
                />

                <textarea
                    placeholder="Mensagem"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    style={styles.textarea}
                />

                <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    style={styles.select}
                >
                    <option style={styles.option} value="update">Update</option>
                    <option style={styles.option} value="feature">Feature</option>
                    <option style={styles.option} value="fix">Fix</option>
                    <option style={styles.option} value="warning">Warning</option>
                </select>

                <select
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value)}
                    style={styles.select}
                >
                    <option style={styles.option} value="global">Global (todos)</option>
                    <option style={styles.option} value="individual">Individual (1 usuário)</option>
                </select>

                {targetType === "individual" && (
                    <input
                        placeholder="User ID"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        style={styles.input}
                    />
                )}

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        ...styles.button,
                        opacity: loading ? 0.6 : 1,
                    }}
                >
                    {loading ? "Publicando..." : "Publicar"}
                </button>
            </form>
        </div>
    );
}

const styles = {
  container: {
    padding: "24px",
    maxWidth: "620px",
    margin: "40px auto",
    color: "#fff",
    background: "linear-gradient(145deg, rgba(20,8,8,0.98), rgba(40,10,10,0.96))",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "18px",
    boxShadow: "0 24px 80px rgba(0,0,0,0.55)",
    backdropFilter: "blur(14px)",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    marginTop: "16px",
  },

  input: {
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    outline: "none",
    fontSize: "14px",
    transition: "0.2s",
  },

  textarea: {
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    resize: "none",
    outline: "none",
    fontSize: "14px",
    minHeight: "140px",
    transition: "0.2s",
  },

  button: {
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #ff2d2d, #b30000)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "14px",
    boxShadow: "0 10px 30px rgba(255, 45, 45, 0.25)",
    transition: "0.2s",
  },

  select: {
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.10)",
    backgroundColor: "#140808",
    color: "#fff",
    outline: "none",
    fontSize: "14px",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    colorScheme: "dark",
  },

  option: {
    backgroundColor: "#140808",
    color: "#fff",
  },

  title: {
    fontSize: "20px",
    fontWeight: "800",
    marginBottom: "6px",
    background: "linear-gradient(90deg, #fff, #ff4d4d)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },

  subtitle: {
    fontSize: "12px",
    opacity: 0.6,
    marginBottom: "10px",
  },
};