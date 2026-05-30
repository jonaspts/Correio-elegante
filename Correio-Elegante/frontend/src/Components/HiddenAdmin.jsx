import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import AdminUpdates from "./AdminUpdates";

const ADMIN_ID = "f96b415b-1140-4125-82f9-c6edaf7cac14";

export default function HiddenAdmin() {
    const [userId, setUserId] = useState("");
    const [open, setOpen] = useState(false);

    useEffect(() => {
        async function getUser() {
            const { data } = await supabase.auth.getUser();
            setUserId(data?.user?.id || "");
        }

        getUser();
    }, []);

    // 🔒 só você vê
    if (userId !== ADMIN_ID) return null;

    return (
        <>
            {/* botão invisível */}
            <div
                onClick={() => setOpen(true)}
                style={{
                    position: "fixed",
                    bottom: 0,
                    right: 0,
                    width: "20px",
                    height: "20px",
                    opacity: 0, // invisível
                    cursor: "default",
                }}
            />

            {open && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <button
                            onClick={() => setOpen(false)}
                            style={styles.close}
                        >
                            ✖
                        </button>

                        {/* 👇 SEU COMPONENTE INTACTO */}
                        <AdminUpdates />
                    </div>
                </div>
            )}
        </>
    );
}

const styles = {
    overlay: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
    },
    modal: {
        background: "#111",
        padding: "20px",
        borderRadius: "10px",
        width: "90%",
        maxWidth: "600px",
    },
    close: {
        position: "absolute",
        top: "10px",
        right: "10px",
        background: "transparent",
        border: "none",
        color: "#fff",
        fontSize: "18px",
        cursor: "pointer",
    },
};