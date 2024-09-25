import { Request, Response, RequestHandler  } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Obter endereços por slug do tenant e id do usuário
export const getAddressByUser = async (req: Request, res: Response) => {
    const { user_id } = req.query; // Obtém o ID do usuário a partir dos parâmetros da query

    try {

        // Busca os endereços associados ao usuário no tenant
        const addresses = await prisma.user_Address.findMany({
            where: { id_user: Number(user_id) },
        });

        res.json(addresses);
    } catch (error) {
        console.error('Error fetching addresses for user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
};