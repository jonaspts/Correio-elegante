const { google } = require("googleapis");
const path = require("path");

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "credentials.json"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const spreadsheetId = "12_DPoKN-kQV6oP9PCz_Xg7cEekbb3VfwekbSfLDBmAI";

async function addRow(data) {
  const client = await auth.getClient();
  const googleSheets = google.sheets({ version: "v4", auth: client });

  await googleSheets.spreadsheets.values.append({
    spreadsheetId,
    range: "A:D",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        data.de,
        data.para,
        data.item,
        data.dataHora
      ]]
    }
  });
}

module.exports = addRow;