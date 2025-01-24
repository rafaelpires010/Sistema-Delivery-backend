"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const upload_1 = __importDefault(require("../middlewares/upload")); // Middleware para upload de imagens
const router = express_1.default.Router();
// Rota para upload de imagens
router.post('/upload', upload_1.default.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }
    const filePath = `/uploads/${req.file.filename}`;
    // Aqui você pode adicionar o código para salvar o caminho no banco de dados
    // Exemplo: await db.query('INSERT INTO products (image_path) VALUES ($1)', [filePath]);
    res.send({ filePath });
});
exports.default = router;
