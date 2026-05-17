import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [mode, setMode] = useState("register"); // cadastro primeiro

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    if (error) {
      alert("Erro no login: " + error.message);
    }

    setLoading(false);
  }

  async function handleRegister() {
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
    });

    if (error) {
      alert("Erro no cadastro: " + error.message);
      setLoading(false);
      return;
    }

    const user = data?.user;

    if (user) {
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: user.id,
          email: email.trim(),
          phone: phone.trim(),
        },
      ]);

      if (profileError) {
        alert("Conta criada, mas erro no perfil: " + profileError.message);
      }
    }

    alert("Conta criada com sucesso!");
    setMode("login");
    setLoading(false);
  }

  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });

    if (error) {
      alert("Erro Google login: " + error.message);
    }
  }

  return (
    <div className="login-page">
      <div className="hearts-bg">
        <div className="heart"></div>
        <div className="heart"></div>
        <div className="heart"></div>
        <div className="heart"></div>
        <div className="heart"></div>
      </div>

      <div className="login-card">
        <h1 className="title">Correio Elegante 💌</h1>
        <p className="subtitle">Crie sua conta ou entre no sistema</p>

        <div className="toggle">
          <button
            className={mode === "register" ? "active" : ""}
            onClick={() => setMode("register")}
          >
            Criar conta
          </button>

          <button
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
          >
            Login
          </button>
        </div>

        {mode === "register" && (
          <div className="form">
            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              placeholder="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <input
              placeholder="Telefone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <button onClick={handleRegister} disabled={loading}>
              {loading ? "Criando..." : "Criar conta"}
            </button>
          </div>
        )}

        {mode === "login" && (
          <>
            <form onSubmit={handleLogin} className="form">
              <input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                placeholder="Senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button type="submit" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </button>
            </form>

            <button
              className="google-btn"
              onClick={handleGoogleLogin}
              style={{
                marginTop: "10px",
                padding: "8px 12px",
                fontSize: "14px",
                width: "fit-content",
                alignSelf: "center",
              }}
            >
              <img
                src="/googleLogin.png"
                alt="Google"
                style={{ width: "18px", height: "18px" }}
              />
              Entrar com Google
            </button>
          </>
        )}
      </div>
    </div>
  );
}