const express = require("express");
const cors = require("cors");
const addRow = require("./sheets");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/enviar", async (req, res) => {
  console.log("CHEGOU NO BACKEND:", req.body);

  try {
    await addRow(req.body);
    res.send("ok");
  } catch (err) {
    console.log("ERRO SHEETS:", err);
    res.status(500).send("erro");
  }
});

app.listen(3000, () => {
  console.log("Backend rodando na porta 3000");
});