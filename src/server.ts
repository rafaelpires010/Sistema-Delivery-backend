import "dotenv/config";
import express from "express";
import cors from "cors";
import https from "https";
import http from "http";
import adminRoutes from "./routes/admin";
import tenantRoutes from "./routes/tenantRouter";
import productRoutes from "./routes/productRouter";
import { requestinterceptor } from "./utils/requestinterceptor";
import categoriesRouter from "./routes/categoriesRouter";
import uploadRoutes from "./routes/upload";
import orderRouter from "./routes/orderRouter";
import addressRouter from "./routes/addressRouter";
import { Server } from "socket.io";

import path from "path";
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//app.all("*", requestinterceptor);

app.use("/admin", adminRoutes);
app.use(
  "/",
  tenantRoutes,
  productRoutes,
  categoriesRouter,
  orderRouter,
  addressRouter
);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/api", uploadRoutes); // Prefixo para suas rotas de API

const runServer = (port: number, server: http.Server) => {
  server.listen(port, () => {
    console.log(`Running at PORT ${port}`);
  });
};

const regularServer = http.createServer(app);

const io = new Server(regularServer);

if (process.env.NODE_ENV === "production") {
  //TODO: configurar SSL
  //TODO: rodar server na 80 e na 443
} else {
  const serverPort: number = process.env.PORT
    ? parseInt(process.env.PORT)
    : 9000;
  runServer(serverPort, regularServer);
}
