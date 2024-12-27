import multer from "multer";
import { S3Client } from "@aws-sdk/client-s3";
import multerS3 from "multer-s3";
import { Request } from "express";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Definir uma interface para especificar os parâmetros de rota esperados
interface CustomRequest extends Request {
  params: {
    tenantSlug: string;
  };
}

const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.S3_BUCKET_NAME!,
    //acl: "public-read",
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req: CustomRequest, file, cb) => {
      const tenantSlug = req.params.tenantSlug;
      const fileName = `${Date.now().toString()}-${file.originalname}`;
      const filePath = `tenants/${tenantSlug}/imagens/${fileName}`;
      cb(null, filePath);
    },
  }),
});

export default upload;
