import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // M-Pesa Integration Logic
  const getMpesaToken = async (consumerKey: string, consumerSecret: string) => {
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
    try {
      const response = await axios.get(
        "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );
      return response.data.access_token;
    } catch (error: any) {
      console.error("Error getting M-Pesa token:", error.response?.data || error.message);
      throw new Error("Failed to get M-Pesa access token");
    }
  };

  app.post("/api/mpesa/stkpush", async (req, res) => {
    const { phoneNumber, amount, userId, packId, keys } = req.body;

    // Use keys from request (sent by admin/app) or env
    const consumerKey = keys?.consumerKey || process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = keys?.consumerSecret || process.env.MPESA_CONSUMER_SECRET;
    const shortcode = keys?.shortcode || process.env.MPESA_SHORTCODE;
    const passkey = keys?.passkey || process.env.MPESA_PASSKEY;
    const callbackUrl = process.env.MPESA_CALLBACK_URL || `${req.protocol}://${req.get('host')}/api/mpesa/callback`;

    if (!consumerKey || !consumerSecret || !shortcode || !passkey) {
      return res.status(400).json({ error: "M-Pesa configuration is missing" });
    }

    try {
      const token = await getMpesaToken(consumerKey, consumerSecret);
      const timestamp = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 14);
      const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");

      const response = await axios.post(
        "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
        {
          BusinessShortCode: shortcode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: amount,
          PartyA: phoneNumber,
          PartyB: shortcode,
          PhoneNumber: phoneNumber,
          CallBackURL: callbackUrl,
          AccountReference: `User-${userId.slice(0, 5)}`,
          TransactionDesc: `Purchase points for ${userId}`,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      res.json(response.data);
    } catch (error: any) {
      console.error("STK Push Error:", error.response?.data || error.message);
      res.status(500).json({ error: error.response?.data?.errorMessage || "STK Push failed" });
    }
  });

  app.post("/api/mpesa/callback", (req, res) => {
    console.log("M-Pesa Callback Received:", JSON.stringify(req.body, null, 2));
    // In a real app, you'd verify the transaction and update the user's points in Firestore here.
    // Since we don't have a public URL for Safaricom to hit in this sandbox, 
    // we'll handle point updates on the frontend after a "successful" STK push initiation for this demo,
    // or provide a manual "Check Status" button.
    res.json({ ResultCode: 0, ResultDesc: "Success" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
