import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import https from "https";
import fs from "fs";
import path from "path";
import { Server } from "socket.io";

import adminRoutes from "./routes/painel-delivery/admin";
import tenantRoutes from "./routes/tenantRouter";
import productRoutes from "./routes/productRouter";
import categoriesRouter from "./routes/categoriesRouter";
import uploadRoutes from "./routes/upload";
import orderRouter from "./routes/orderRouter";
import addressRouter from "./routes/addressRouter";
import auth from "./routes/auth";
import shippingRoutes from "./routes/shippingRoutes";
import bannerRoute from "./routes/bannerRoute";
import cupomRouter from "./routes/cupomRouter";
import formaPagamentoRouter from "./routes/formaPagamentoRouter";
import vendasRouter from "./routes/vendasRouter";
import superAdminRoutes from "./routes/painel-adm/superAdmin";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Rotas
app.use("/admin", adminRoutes);
app.use("/super-admin", superAdminRoutes);
app.use(
  "/",
  tenantRoutes,
  productRoutes,
  categoriesRouter,
  orderRouter,
  addressRouter,
  auth,
  shippingRoutes,
  bannerRoute,
  cupomRouter,
  formaPagamentoRouter,
  vendasRouter
);

// Socket.io
const ioConfig = {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
};

if (process.env.NODE_ENV === "production") {
  // 🔐 SSL
  const sslOptions = {
    key: fs.readFileSync("/etc/letsencrypt/live/api.bevon.com.br/privkey.pem"),
    cert: fs.readFileSync(
      "/etc/letsencrypt/live/api.bevon.com.br/fullchain.pem"
    ),
  };

  // Servidor HTTPS
  const httpsServer = https.createServer(sslOptions, app);
  const io = new Server(httpsServer, ioConfig);

  io.on("connection", (socket) => {
    console.log(`Socket conectado: ${socket.id}`);
  });

  httpsServer.listen(443, () => {
    console.log("✅ HTTPS rodando em https://api.bevon.com.br");
  });

  // (Opcional) Servidor HTTP apenas redireciona para HTTPS
  const httpApp = express();
  httpApp.use((req, res) => {
    res.redirect("https://" + req.headers.host + req.url);
  });
  http.createServer(httpApp).listen(80, () => {
    console.log("🌐 HTTP redirecionando para HTTPS");
  });
} else {
  // Ambiente de desenvolvimento
  const serverPort: number = process.env.PORT
    ? parseInt(process.env.PORT)
    : 9000;

  const httpServer = http.createServer(app);
  const io = new Server(httpServer, ioConfig);

  io.on("connection", (socket) => {
    console.log(`Socket conectado: ${socket.id}`);
  });

  httpServer.listen(serverPort, () => {
    console.log(`🚀 Dev Server rodando em http://localhost:${serverPort}`);
  });
}
