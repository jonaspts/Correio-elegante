const express = require("express");
const cors = require("cors");
const { addRow } = require("./sheets");
function getBrazilHour() {
  return new Date().toLocaleTimeString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

const app = express();

app.use(cors());
app.use(express.json());

app.post("/orders", async (req, res) => {
  console.log("CHEGOU:", req.body);
  

  try {
    await addRow({
      ...req.body,
      dataHora: getBrazilHour(),
      de: req.body.senderType === "anonimo"
        ? "Anônimo"
        : req.body.senderName || "Sem nome",
      para: req.body.receiverName || "",
      item: req.body.plan || "",
      mensagem: req.body.message || "",
      pagamento: req.body.paymentMethod || ""
    });

    res.json({ ok: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "erro sheets" });
  }
});
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});