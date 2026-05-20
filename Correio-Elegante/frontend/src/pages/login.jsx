import { useEffect } from "react";
import { useState } from "react";
import { supabase } from "../lib/supabase";

import "../App.css";
export default function Login() {
  const [mode, setMode] = useState("register"); // cadastro primeiro
  const [hearts, setHearts] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  async function handleLogin(e) {
    e.preventDefault();

    if (!isValidEmail(email)) {
      alert("Digite um email válido");
      return;
    }

    if (!password.trim()) {
      alert("Digite a senha");
      return;
    }

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
    if (!isValidEmail(email)) {
      alert("Digite um email válido");
      return;
    }

    if (password.trim().length < 6) {
      alert("Senha precisa ter no mínimo 6 caracteres");
      return;
    }

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
      await supabase.from("profiles").insert([
        {
          id: user.id,
          email: email.trim(),
          phone: phone.trim(),
        },
      ]);
    }

    alert("Conta criada com sucesso!");
    setMode("login");
    setLoading(false);
  }
  
  useEffect(() => {
    function spawnHeart() {
      const id = Math.random().toString(36).substr(2, 9);

      const newHeart = {
        id,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: 16 + Math.random() * 26,
        char: Math.random() > 0.5 ? "❤" : "♥",
      };

      setHearts((prev) => [...prev, newHeart].slice(-110));

      setTimeout(() => {
        setHearts((prev) => prev.filter((heart) => heart.id !== id));
      }, 5000);
    }

    const interval = setInterval(spawnHeart, 90);
    return () => clearInterval(interval);
  }, []);

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
      <div className="binary-bg" />
      <div className="heart-bg">
        {hearts.map((h) => (
          <span
            key={h.id}
            className="heart"
            style={{ left: `${h.x}px`, top: `${h.y}px`, fontSize: `${h.size}px` }}
          >
            {h.char}
          </span>
        ))}
      </div>

      <div className="login-card">
        <h1 className="title">Correio Elegante</h1>
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