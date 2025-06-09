import express, { Request, Response } from 'express';
import upload from '../middlewares/upload'; // Middleware para upload de imagens

const router = express.Router();

// Rota para upload de imagens
router.post('/upload', upload.single('image'), async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }

    const filePath = `/uploads/${req.file.filename}`;

    // Aqui você pode adicionar o código para salvar o caminho no banco de dados
    // Exemplo: await db.query('INSERT INTO products (image_path) VALUES ($1)', [filePath]);

    res.send({ filePath });
});

export default router;
