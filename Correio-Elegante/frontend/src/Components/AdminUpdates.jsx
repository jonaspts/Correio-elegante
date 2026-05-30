import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function AdminUpdates() {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [type, setType] = useState("update");
    const [targetType, setTargetType] = useState("global"); // global | individual
    const [userId, setUserId] = useState(""); // usado só no individual
    const [loading, setLoading] = useState(false);

    async function handlePublish(e) {
        e.preventDefault();
        setLoading(true);

        const payload = {
            title: title.trim(),
            message: message.trim(),
            type,
            is_global: targetType === "global",
            read: false,
        };

        if (targetType === "individual") {
            if (!userId.trim()) {
                alert("Preencha o User ID para notificação individual.");
                setLoading(false);
                return;
            }

            payload.user_id = userId.trim();
            payload.is_global = false;
        } else {
            payload.user_id = null;
            payload.is_global = true;
        }

        const { error } = await supabase.from("notifications").insert([payload]);

        setLoading(false);

        if (error) {
            alert("Erro ao publicar update");
            console.error(error);
            return;
        }

        alert("Update publicado com sucesso 🚀");

        setTitle("");
        setMessage("");
        setType("update");
        setTargetType("global");
        setUserId("");
    }

    return (
        <div style={styles.container}>
            <h1>Admin - Updates</h1>

            <form onSubmit={handlePublish} style={styles.form}>
                <input
                    placeholder="Título do update"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={styles.input}
                    required
                />

                <textarea
                    placeholder="Mensagem (tipo blog / changelog)"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    style={styles.textarea}
                    rows={6}
                    required
                />

                <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    style={styles.input}
                >
                    <option value="update">Update</option>
                    <option value="feature">Feature</option>
                    <option value="fix">Fix</option>
                    <option value="warning">Warning</option>
                </select>

                <select
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value)}
                    style={styles.input}
                >
                    <option value="global">Global (todos recebem)</option>
                    <option value="individual">Individual (um usuário)</option>
                </select>

                {targetType === "individual" && (
                    <input
                        placeholder="User ID do usuário"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        style={styles.input}
                        required
                    />
                )}

                <button type="submit" disabled={loading} style={styles.button}>
                    {loading ? "Publicando..." : "Publicar Update"}
                </button>
            </form>
        </div>
    );
}

const styles = {
    container: {
        padding: "20px",
        maxWidth: "600px",
        margin: "0 auto",
        color: "#fff",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
    },
    input: {
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid #333",
        background: "#111",
        color: "#fff",
        outline: "none",
    },
    textarea: {
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid #333",
        background: "#111",
        color: "#fff",
        resize: "none",
        outline: "none",
    },
    button: {
        padding: "10px",
        borderRadius: "8px",
        border: "none",
        background: "#ff4d4d",
        color: "#fff",
        cursor: "pointer",
        fontWeight: "bold",
    },
};