import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import adminRoutes from "./routes/painel-delivery/admin";
import tenantRoutes from "./routes/tenantRouter";
import productRoutes from "./routes/productRouter";
import { requestinterceptor } from "./utils/requestinterceptor";
import categoriesRouter from "./routes/categoriesRouter";
import uploadRoutes from "./routes/upload";
import orderRouter from "./routes/orderRouter";
import addressRouter from "./routes/addressRouter";
import path from "path";
import auth from "./routes/auth";
import shippingRoutes from "./routes/shippingRoutes";
import bannerRoute from "./routes/bannerRoute";
import cupomRouter from "./routes/cupomRouter";
import formaPagamentoRouter from "./routes/formaPagamentoRouter";
import vendasRouter from "./routes/vendasRouter";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Defina suas rotas
app.use("/admin", adminRoutes);
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
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

const regularServer = http.createServer(app); // Cria o servidor HTTP
const io = new Server(regularServer, {
  cors: {
    origin: "*", // Permite todas as origens
    methods: ["GET", "POST"], // Métodos permitidos
    allowedHeaders: ["Content-Type", "Authorization"], // Cabeçalhos permitidos
    credentials: true, // Se você precisar habilitar o envio de cookies
  },
});

// Define o Socket.IO no app
app.set("socketio", io);

io.on("connection", (socket) => {
  console.log(`Um cliente conectado: ${socket.id}`);
  socket.emit("message", "Bem-vindo ao servidor!");
});

// Função para rodar o servidor
const runServer = (port: number, server: http.Server) => {
  server.listen(port, () => {
    console.log(`Running at PORT ${port}`);
  });
};

if (process.env.NODE_ENV === "production") {
  // TODO: configurar SSL
  // TODO: rodar server na 80 e na 443
} else {
  const serverPort: number = process.env.PORT
    ? parseInt(process.env.PORT)
    : 9000;
  runServer(serverPort, regularServer);
}
