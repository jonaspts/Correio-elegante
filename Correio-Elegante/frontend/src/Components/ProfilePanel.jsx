import { useMemo, useState } from "react";

export default function ProfilePanel({
  profileId,
  loadingProfile,
  nome,
  profileEmail,
  turma,
  telefone,
  phoneFromProfile,
  cartinhasCompradas,
  totalGasto,
  formatPhone,
  onLoadOrders,
  courseOptions,
  classrooms,
  senderCourse,
  setSenderCourse,
  setTurma,
  onSaveProfile,
  showOrdersButton = true,
  showEditButton = true,
}) {
  const [showPanel, setShowPanel] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);

  const formattedTotal = useMemo(() => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(totalGasto || 0);
  }, [totalGasto]);

  if (!profileId || loadingProfile) return null;

  return (
    <>
      <div
        style={{
          width: "100%",
          position: "relative",
          zIndex: 10,
          padding: "12px 18px",
        }}
      >
        <div
          onClick={() => setShowPanel((prev) => !prev)}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            padding: "12px 16px",
            borderRadius: "14px",
            background:
              "linear-gradient(90deg, rgba(255,50,50,0.14), rgba(0,0,0,0.35))",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#fff",
            cursor: "pointer",
            backdropFilter: "blur(14px)",
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: "14px" }}>
              {nome ? `Olá, ${nome}` : profileEmail}
            </div>
            <div style={{ fontSize: "12px", opacity: 0.7 }}>
              {turma ? `Turma: ${turma}` : "Toque para ver seu perfil"}
            </div>
          </div>

          <div style={{ fontSize: "18px", opacity: 0.85 }}>
            {showPanel ? "▲" : "▼"}
          </div>
        </div>

        {showPanel && (
          <div
            style={{
              marginTop: "10px",
              padding: "14px 16px",
              borderRadius: "14px",
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "#fff",
              backdropFilter: "blur(16px)",
            }}
          >
            <div style={{ display: "grid", gap: "10px" }}>
              <div>
                <div style={{ fontSize: "12px", opacity: 0.6 }}>Nome</div>
                <div style={{ fontSize: "14px", fontWeight: 600 }}>
                  {nome || "Não informado"}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "12px", opacity: 0.6 }}>Turma</div>
                <div style={{ fontSize: "14px", fontWeight: 600 }}>
                  {turma || "Não informado"}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "12px", opacity: 0.6 }}>
                  Cartinhas compradas
                </div>
                <div style={{ fontSize: "14px", fontWeight: 600 }}>
                  {cartinhasCompradas}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "12px", opacity: 0.6 }}>Total gasto</div>
                <div style={{ fontSize: "14px", fontWeight: 600 }}>
                  {formattedTotal}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "12px", opacity: 0.6 }}>Telefone</div>
                <div style={{ fontSize: "14px", fontWeight: 600 }}>
                  {formatPhone(phoneFromProfile || telefone) || "Não informado"}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "12px", opacity: 0.6 }}>Email</div>
                <div style={{ fontSize: "14px", fontWeight: 600 }}>
                  {profileEmail || "Não informado"}
                </div>
              </div>

              {showOrdersButton && (
                <button
                  className="orders-btn"
                  type="button"
                  onClick={onLoadOrders}
                >
                  📦 Meus pedidos
                </button>
              )}

              {showEditButton && (
                <button
                  type="button"
                  onClick={() => setEditingProfile(true)}
                  style={{
                    marginTop: "10px",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(255,255,255,0.06)",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  ✏️ Editar perfil
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {editingProfile && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0, 0, 0, 0.35)",
            backdropFilter: "blur(4px)",
            padding: "20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "460px",
              borderRadius: "20px",
              background:
                "linear-gradient(145deg, rgba(20, 8, 8, 0.98), rgba(40, 10, 10, 0.96))",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              boxShadow: "0 24px 80px rgba(0, 0, 0, 0.55)",
              padding: "28px",
              color: "#fff",
            }}
          >
            <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: "800" }}>
              Editar perfil
            </h2>

            <p style={{ marginTop: 10, fontSize: "14px", opacity: 0.8 }}>
              Atualize seus dados para manter seu perfil correto no sistema.
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginTop: 16,
              }}
            >
              <input
                placeholder="Nome"
                value={nome}
                onChange={() => {}}
                readOnly
                style={{
                  padding: "14px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#fff",
                  outline: "none",
                  opacity: 0.85,
                }}
              />

              <div style={{ display: "grid", gap: "8px" }}>
                <label>Curso</label>
                <div className="payment-options">
                  {courseOptions.map((c) => (
                    <label key={c.value}>
                      <input
                        type="radio"
                        checked={senderCourse === c.value}
                        onChange={() => setSenderCourse(c.value)}
                      />
                      <span>{c.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {senderCourse && (
                <div style={{ marginTop: "10px" }}>
                  <label>Turma</label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "8px",
                    }}
                  >
                    {classrooms.map((c) => {
                      const value = `${c}-${senderCourse}`;

                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setTurma(value)}
                          style={{
                            padding: "10px",
                            borderRadius: "10px",
                            border:
                              turma === value ? "2px solid red" : "1px solid gray",
                            background: "rgba(255,255,255,0.05)",
                            color: "#fff",
                          }}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <input
                placeholder="Telefone"
                value={telefone}
                inputMode="numeric"
                onChange={(e) => {
                  let v = e.target.value.replace(/\D/g, "").slice(0, 11);

                  if (v.length <= 10) {
                    v = v.replace(/(\d{2})(\d)/, "($1) $2");
                    v = v.replace(/(\d{4})(\d)/, "$1-$2");
                  } else {
                    v = v.replace(/(\d{2})(\d)/, "($1) $2");
                    v = v.replace(/(\d{5})(\d)/, "$1-$2");
                  }

                  if (typeof window !== "undefined") {
                    const event = new CustomEvent("profile-phone-change", {
                      detail: v,
                    });
                    window.dispatchEvent(event);
                  }
                }}
                style={{
                  padding: "14px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#fff",
                  outline: "none",
                }}
              />

              <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                <button
                  type="button"
                  onClick={() => setEditingProfile(false)}
                  style={{
                    flex: 1,
                    padding: "14px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.06)",
                    color: "#fff",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await onSaveProfile();
                    setEditingProfile(false);
                  }}
                  style={{
                    flex: 1,
                    padding: "14px",
                    borderRadius: "12px",
                    border: "none",
                    background: "linear-gradient(135deg, #ff2d2d, #b30000)",
                    color: "#fff",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}