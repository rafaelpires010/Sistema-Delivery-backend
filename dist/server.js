"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const admin_1 = __importDefault(require("./routes/painel-delivery/admin"));
const tenantRouter_1 = __importDefault(require("./routes/tenantRouter"));
const productRouter_1 = __importDefault(require("./routes/productRouter"));
const categoriesRouter_1 = __importDefault(require("./routes/categoriesRouter"));
const orderRouter_1 = __importDefault(require("./routes/orderRouter"));
const addressRouter_1 = __importDefault(require("./routes/addressRouter"));
const path_1 = __importDefault(require("path"));
const auth_1 = __importDefault(require("./routes/auth"));
const shippingRoutes_1 = __importDefault(require("./routes/shippingRoutes"));
const bannerRoute_1 = __importDefault(require("./routes/bannerRoute"));
const cupomRouter_1 = __importDefault(require("./routes/cupomRouter"));
const formaPagamentoRouter_1 = __importDefault(require("./routes/formaPagamentoRouter"));
const vendasRouter_1 = __importDefault(require("./routes/vendasRouter"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Defina suas rotas
app.use("/admin", admin_1.default);
app.use("/", tenantRouter_1.default, productRouter_1.default, categoriesRouter_1.default, orderRouter_1.default, addressRouter_1.default, auth_1.default, shippingRoutes_1.default, bannerRoute_1.default, cupomRouter_1.default, formaPagamentoRouter_1.default, vendasRouter_1.default);
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
const regularServer = http_1.default.createServer(app); // Cria o servidor HTTP
const io = new socket_io_1.Server(regularServer, {
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
const runServer = (port, server) => {
    server.listen(port, () => {
        console.log(`Running at PORT ${port}`);
    });
};
if (process.env.NODE_ENV === "production") {
    // TODO: configurar SSL
    // TODO: rodar server na 80 e na 443
}
else {
    const serverPort = process.env.PORT
        ? parseInt(process.env.PORT)
        : 9000;
    runServer(serverPort, regularServer);
}
