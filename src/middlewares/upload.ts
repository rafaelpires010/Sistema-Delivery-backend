import multer, { StorageEngine } from 'multer';
import path from 'path';

// Configuração do armazenamento do multer
const storage: StorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads')); // Pasta onde as imagens serão armazenadas
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Nome do arquivo com timestamp
    }
});

const upload = multer({ storage });

export default upload;
