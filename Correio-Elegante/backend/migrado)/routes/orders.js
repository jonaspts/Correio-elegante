const express = require("express");
const fs = require("fs");

const router = express.Router();
const { addRow } = require("../sheets");
const DB_FILE = "./data/orders.json";

if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([]));
}

router.get("/", (req, res) => {
  const data = JSON.parse(fs.readFileSync(DB_FILE));
  res.json(data);
});

router.post("/", (req, res) => {
  const orders = JSON.parse(fs.readFileSync(DB_FILE));

  const newOrder = {
    dataHora: new Date().toISOString(),
    de: req.body.senderType === "anonimo"
      ? "Anônimo"
      : req.body.senderName || "Sem nome",
    para: req.body.receiverName,
    item: req.body.plan,
    mensagem: req.body.message,
    pagamento: req.body.paymentMethod,
    orderCode: req.body.orderCode
  };

  // 👇 AQUI ENTRA A VALIDAÇÃO

  // 🔒 1. valida se existe código
  if (!newOrder.orderCode) {
    return res.status(400).json({
      error: "Pedido sem código"
    });
  }

  // 🔒 2. verifica duplicado
  if (orders.some(o => o.orderCode === newOrder.orderCode)) {
    return res.status(409).json({
      error: "Código de pedido já utilizado"
    });
  }

  // 👇 só depois disso salva
  orders.push(newOrder);

  fs.writeFileSync(DB_FILE, JSON.stringify(orders, null, 2));

  res.status(201).json(newOrder);
});

module.exports = router;