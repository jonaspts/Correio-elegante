export default function Pricing({ goToHome }) {
  return (
    <div className="container">
      <h1>Tabela de Preços</h1>

      <div className="pricing">
        <div className="card">
          <h2>💌 Básico</h2>
          <p>Mensagem simples</p>
          <span>R$ 2,00</span>
        </div>

        <div className="card">
          <h2>intermediario</h2>
          <p>Mensagem + </p>
          <span>R$ 2,00</span>
        </div>

        <div className="card">
          <h2>fodinha</h2>
          <p>Mensagem + bombom</p>
          <span>R$ 5,00</span>
        </div>

        <div className="card">
          <h2>fodao</h2>
          <p>Mensagem + buque de pirulitos </p>
          <span>R$ 10,00</span>
        </div>
      </div>

      <button className="btn" onClick={goToHome}>
        Voltar
      </button>
    </div>
  );
}