"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.findUserByResetToken = exports.findUserById = exports.creatUser = exports.findUserByEmail = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const findUserByEmail = async (email) => {
    const user = await prisma.user.findFirst({
        select: {
            id: true,
            nome: true,
            email: true,
            senha: true,
            telefone: true,
        },
        where: { email },
    });
    if (user) {
        return user;
    }
    return null;
};
exports.findUserByEmail = findUserByEmail;
const creatUser = async (data) => {
    const newUser = await prisma.user.create({ data });
    return newUser;
};
exports.creatUser = creatUser;
const findUserById = async (idUser) => {
    const user = await prisma.user.findFirst({
        select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
        },
        where: { id: idUser },
    });
    if (user) {
        return user;
    }
    return null;
};
exports.findUserById = findUserById;
// Buscar usuário pelo token de redefinição de senha
const findUserByResetToken = async (resetToken) => {
    return prisma.user.findFirst({ where: { resetToken } });
};
exports.findUserByResetToken = findUserByResetToken;
// Atualizar dados do usuário
const updateUser = async (id, data) => {
    return prisma.user.update({
        where: { id },
        data,
    });
};
exports.updateUser = updateUser;
