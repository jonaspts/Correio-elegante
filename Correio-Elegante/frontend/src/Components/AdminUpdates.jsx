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
        <div style={{ padding: 20, maxWidth: 600, color: "#fff" }}>
            <h1>Admin - Updates</h1>

            <form onSubmit={handlePublish} style={{ display: "flex", flexDirection: "column", gap: 10 }}>

                <input
                    placeholder="Título"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <textarea
                    placeholder="Mensagem"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                />

                <select value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="update">Update</option>
                    <option value="feature">Feature</option>
                    <option value="fix">Fix</option>
                    <option value="warning">Warning</option>
                </select>

                <select
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value)}
                >
                    <option value="global">Global (todos)</option>
                    <option value="individual">Individual (1 usuário)</option>
                </select>

                {targetType === "individual" && (
                    <input
                        placeholder="User ID"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                    />
                )}

                <button disabled={loading}>
                    {loading ? "Publicando..." : "Publicar"}
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