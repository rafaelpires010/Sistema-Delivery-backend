"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAddress = exports.editAddress = exports.createAddress = exports.getAddressByUser = exports.getAddressById = void 0;
const client_1 = require("@prisma/client");
const Address_1 = require("../schema/Address");
const prisma = new client_1.PrismaClient();
const getAddressById = async (req, res) => {
    try {
        // Extrai o ID dos parâmetros da requisição
        const id = Number(req.params.id);
        // Verifica se o ID é válido
        if (isNaN(id)) {
            return res.status(400).json({ error: "ID inválido." });
        }
        // Busca o endereço no banco de dados pelo ID
        const address = await prisma.user_Address.findUnique({
            where: { id: id },
        });
        // Verifica se o endereço foi encontrado
        if (!address) {
            return res.status(404).json({ error: "Endereço não encontrado." });
        }
        // Retorna o endereço encontrado
        return res.status(200).json(address);
    }
    catch (error) {
        console.error("Erro ao buscar o endereço:", error);
        return res.status(500).json({
            error: "Erro ao buscar o endereço. Tente novamente mais tarde.",
        });
    }
};
exports.getAddressById = getAddressById;
const getAddressByUser = async (req, res) => {
    const { user_id } = req.query; // Obtém o ID do usuário a partir dos parâmetros da query
    try {
        // Busca os endereços associados ao usuário no tenant
        const addresses = await prisma.user_Address.findMany({
            where: { id_user: Number(user_id) },
        });
        res.json(addresses);
    }
    catch (error) {
        console.error("Error fetching addresses for user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.getAddressByUser = getAddressByUser;
const createAddress = async (req, res) => {
    try {
        // Extraindo os dados do corpo da requisição
        const { rua, numero, cep, cidade, id_cidade, estado, bairro, complemento, id_user, } = req.body;
        // Validação dos dados com o zod
        const validation = Address_1.addressSchema.safeParse({
            id_user,
            rua,
            numero,
            cep,
            cidade,
            bairro,
            id_cidade,
            estado,
            complemento,
        });
        // Verifica se a validação falhou
        if (!validation.success) {
            return res
                .status(400)
                .json({ error: validation.error.flatten().fieldErrors });
        }
        // Criar o novo endereço no banco de dados usando o Prisma
        const newAddress = await prisma.user_Address.create({
            data: {
                id_user,
                rua,
                numero,
                cep,
                cidade,
                bairro,
                id_cidade,
                estado,
                complemento,
            },
        });
        // Retorna o novo endereço criado como resposta
        return res
            .status(201)
            .json({ message: "Endereço criado com sucesso.", newAddress });
    }
    catch (error) {
        console.error("Erro ao criar o endereço:", error);
        return res
            .status(500)
            .json({ error: "Erro ao criar o endereço. Tente novamente mais tarde." });
    }
};
exports.createAddress = createAddress;
const editAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const { rua, numero, cep, cidade, bairro, id_cidade, estado, complemento, id_user, } = req.body;
        // Validar os dados com Zod
        const validation = Address_1.addressSchema.safeParse({
            rua,
            numero,
            cep,
            cidade,
            bairro,
            id_cidade,
            estado,
            complemento,
            id_user,
        });
        // Verificar se a validação falhou
        if (!validation.success) {
            return res
                .status(400)
                .json({ error: validation.error.flatten().fieldErrors });
        }
        // Atualizar o endereço no banco de dados
        const updatedAddress = await prisma.user_Address.update({
            where: { id: Number(id) }, // Certifique-se de converter para número
            data: {
                rua,
                numero,
                cep,
                cidade,
                bairro,
                id_cidade,
                estado,
                complemento,
                id_user,
            },
        });
        // Retornar o endereço atualizado
        return res
            .status(200)
            .json({ message: "Endereço atualizado com sucesso.", updatedAddress });
    }
    catch (error) {
        console.error("Erro ao atualizar o endereço:", error);
        return res.status(500).json({
            error: "Erro ao atualizar o endereço. Tente novamente mais tarde.",
        });
    }
};
exports.editAddress = editAddress;
const deleteAddress = async (req, res) => {
    const { id } = req.params;
    try {
        // Verifica se o endereço existe
        const address = await prisma.user_Address.findUnique({
            where: { id: parseInt(id) },
        });
        if (!address) {
            return res.status(404).json({ error: "Endereço não encontrado." });
        }
        // Deleta o endereço
        await prisma.user_Address.delete({
            where: { id: parseInt(id) },
        });
        return res.status(200).json({ message: "Endereço deletado com sucesso." });
    }
    catch (error) {
        console.error("Erro ao deletar o endereço:", error);
        return res.status(500).json({
            error: "Erro ao deletar o endereço. Tente novamente mais tarde.",
        });
    }
};
exports.deleteAddress = deleteAddress;
