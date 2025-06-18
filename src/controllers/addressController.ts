import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { addressSchema } from "../schema/Address";
import { ExtendedRequest } from "../types/extended-request";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const getAddressById = async (req: ExtendedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user?.id;

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido." });
    }

    const address = await prisma.user_Address.findFirst({
      where: { id: id, id_user: userId },
    });

    if (!address) {
      return res
        .status(404)
        .json({ error: "Endereço não encontrado ou não pertence ao usuário." });
    }

    return res.status(200).json(address);
  } catch (error) {
    console.error("Erro ao buscar o endereço:", error);
    return res.status(500).json({
      error: "Erro ao buscar o endereço. Tente novamente mais tarde.",
    });
  }
};

export const getAddressByUser = async (req: ExtendedRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Usuário não autenticado." });
  }

  try {
    const addresses = await prisma.user_Address.findMany({
      where: { id_user: userId },
    });

    res.json(addresses);
  } catch (error) {
    console.error("Error fetching addresses for user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
};

export const createAddress = async (req: ExtendedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }

    const { rua, numero, cep, cidade, id_cidade, estado, bairro, complemento } =
      req.body;

    const validation = addressSchema.safeParse({
      id_user: userId,
      rua,
      numero,
      cep,
      cidade,
      bairro,
      id_cidade,
      estado,
      complemento,
    });

    if (!validation.success) {
      return res
        .status(400)
        .json({ error: validation.error.flatten().fieldErrors });
    }

    const newAddress = await prisma.user_Address.create({
      data: {
        id_user: userId,
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

    return res
      .status(201)
      .json({ message: "Endereço criado com sucesso.", newAddress });
  } catch (error) {
    console.error("Erro ao criar o endereço:", error);
    return res
      .status(500)
      .json({ error: "Erro ao criar o endereço. Tente novamente mais tarde." });
  }
};

export const editAddress = async (req: ExtendedRequest, res: Response) => {
  try {
    const addressId = Number(req.params.id);
    const userId = req.user?.id;

    if (isNaN(addressId)) {
      return res.status(400).json({ error: "ID de endereço inválido." });
    }

    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }

    const { rua, numero, cep, cidade, bairro, id_cidade, estado, complemento } =
      req.body;

    const validation = addressSchema.safeParse({
      rua,
      numero,
      cep,
      cidade,
      bairro,
      id_cidade,
      estado,
      complemento,
      id_user: userId,
    });

    if (!validation.success) {
      return res
        .status(400)
        .json({ error: validation.error.flatten().fieldErrors });
    }

    const address = await prisma.user_Address.findFirst({
      where: { id: addressId, id_user: userId },
    });

    if (!address) {
      return res
        .status(404)
        .json({ error: "Endereço não encontrado ou não pertence ao usuário." });
    }

    const updatedAddress = await prisma.user_Address.update({
      where: { id: addressId },
      data: {
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

    return res
      .status(200)
      .json({ message: "Endereço atualizado com sucesso.", updatedAddress });
  } catch (error) {
    console.error("Erro ao atualizar o endereço:", error);
    return res.status(500).json({
      error: "Erro ao atualizar o endereço. Tente novamente mais tarde.",
    });
  }
};

export const deleteAddress = async (req: ExtendedRequest, res: Response) => {
  const addressId = Number(req.params.id);
  const userId = req.user?.id;

  if (isNaN(addressId)) {
    return res.status(400).json({ error: "ID de endereço inválido." });
  }

  if (!userId) {
    return res.status(401).json({ error: "Usuário não autenticado." });
  }

  try {
    const address = await prisma.user_Address.findFirst({
      where: { id: addressId, id_user: userId },
    });

    if (!address) {
      return res
        .status(404)
        .json({ error: "Endereço não encontrado ou não pertence ao usuário." });
    }

    await prisma.user_Address.delete({
      where: { id: addressId },
    });

    return res.status(200).json({ message: "Endereço deletado com sucesso." });
  } catch (error) {
    console.error("Erro ao deletar o endereço:", error);
    return res.status(500).json({
      error: "Erro ao deletar o endereço. Tente novamente mais tarde.",
    });
  }
};
