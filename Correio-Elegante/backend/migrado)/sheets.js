const { google } = require("googleapis");

const spreadsheetId = "12_DPoKN-kQV6oP9PCz_Xg7cEekbb3VfwekbSfLDBmAI";

function getAuth() {
  if (!process.env.GOOGLE_CREDS) {
    throw new Error("GOOGLE_CREDS não definida");
  }

  return new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_CREDS),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}
async function orderCodeExists(orderCode) {
  const auth = getAuth();
  const client = await auth.getClient();

  const googleSheets = google.sheets({
    version: "v4",
    auth: client,
  });

  const response = await googleSheets.spreadsheets.values.get({
    spreadsheetId,
    range: "H:H", // coluna do orderCode
  });

  const rows = response.data.values || [];

  return rows.some(row => row[0] === orderCode);
}

async function addRow(data) {
  const auth = getAuth();
  const client = await auth.getClient();

  const googleSheets = google.sheets({
    version: "v4",
    auth: client,
  });

  console.log("DADOS RECEBIDOS NO SHEETS:", data);

  await googleSheets.spreadsheets.values.append({
    spreadsheetId,
    range: "A:H",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        data.dataHora || new Date().toLocaleString("pt-BR"),
        data.de || "",
        data.para || "",
        data.receiverClassroom || "",
        data.item || "",
        data.mensagem || "",
        data.pagamento || "",
        data.orderCode || ""
      ]]
    }
  });
}
module.exports = { addRow, orderCodeExists };
module.exports = { addRow };