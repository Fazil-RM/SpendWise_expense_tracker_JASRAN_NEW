import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { google } from "googleapis";
import cors from "cors"; //  for frontend communication

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  
  // EDIT: Render provides the PORT dynamically. Default to 3000 for local dev.
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // EDIT: Added CORS to allow your Vercel frontend or local dev to hit this API
  app.use(cors());

  // Google Sheets API Setup
  const auth = new google.auth.GoogleAuth({
    credentials: process.env.GOOGLE_SERVICE_ACCOUNT_KEY 
      ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY) 
      : undefined,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  // API routes
  app.post("/api/feedback", async (req, res) => {
    const { message, date } = req.body;
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

    if (!spreadsheetId) {
      console.error("GOOGLE_SHEETS_ID is not set");
      return res.status(500).json({ error: "Server configuration error" });
    }

    try {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "Sheet1!A:B", 
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[date, message]],
        },
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving feedback to Google Sheets:", error);
      res.status(500).json({ error: "Failed to save feedback" });
    }
  });

  // Vite middleware for development vs production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // EDIT: Ensure paths correctly point to the 'dist' folder after build
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  // EDIT: Added "0.0.0.0" as the host. Render requires this to accept external traffic.
  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();