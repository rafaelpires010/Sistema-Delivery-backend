import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const findUserByEmail = async (email: string) => {
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

export const creatUser = async (data: Prisma.UserCreateInput) => {
  const newUser = await prisma.user.create({ data });

  return newUser;
};

export const findUserById = async (idUser: number) => {
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

// Buscar usuário pelo token de redefinição de senha
export const findUserByResetToken = async (resetToken: string) => {
  return prisma.user.findFirst({ where: { resetToken } });
};

// Atualizar dados do usuário
export const updateUser = async (id: number, data: any) => {
  return prisma.user.update({
    where: { id },
    data,
  });
};
