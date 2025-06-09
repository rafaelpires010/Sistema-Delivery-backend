import { Request, RequestHandler, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { signupSchema } from "../schema/signup";

const prisma = new PrismaClient();

interface TenantInput {
  tenantId: number;
  cargo: string;
}

export const findUsersWithOrders: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const tenantSlug = req.params.tenantSlug;

    if (!tenantSlug) {
      return res.status(400).json({ error: "TenantSlug é obrigatório." });
    }

    const users = await prisma.user.findMany({
      where: {
        orders: {
          some: {
            tenant: {
              slug: tenantSlug, // Filtra pedidos do tenant específico
            },
          },
        },
      },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
      },
    });

    return res.json(users);
  } catch (error) {
    console.error("Erro ao buscar usuários com pedidos:", error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
};

export const findUsersByLoggedUserTenants: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token não fornecido" });
    }

    const decoded = jwt.verify(token, process.env.DEFAULT_TOKEN as string) as {
      id: number;
    };

    // Busca todos os tenants que o usuário tem acesso
    const userTenants = await prisma.userTenant.findMany({
      where: { userId: decoded.id },
      select: {
        tenant: {
          select: {
            id: true,
            nome: true,
            img: true,
            users: {
              select: {
                user: {
                  select: {
                    id: true,
                    nome: true,
                    email: true,
                    telefone: true,
                  },
                },
                cargo: true,
                active: true,
              },
            },
          },
        },
      },
    });

    const tenantsWithUsers = userTenants.map((ut) => ({
      tenant: ut.tenant.nome,
      id: ut.tenant.id,
      img: ut.tenant.img,
      users: ut.tenant.users.map((user) => ({
        ...user.user,
        cargo: user.cargo,
        active: user.active,
      })),
    }));

    return res.json(tenantsWithUsers);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
};

export const createUser: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { nome, email, telefone, senha, tenants } = req.body;

    // Valida os dados do usuário usando o schema
    const validatedData = signupSchema.safeParse({
      nome,
      email,
      telefone,
      senha,
    });

    if (!validatedData.success) {
      return res.status(400).json({
        message: "Dados inválidos",
        errors: validatedData.error.flatten().fieldErrors,
      });
    }

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token não fornecido" });
    }

    const decoded = jwt.verify(token, process.env.DEFAULT_TOKEN as string) as {
      id: number;
    };

    // Verifica acesso a todos os tenants
    for (const tenant of tenants) {
      const hasAccess = await prisma.userTenant.findFirst({
        where: {
          userId: decoded.id,
          tenantId: Number(tenant.tenantId),
        },
      });

      if (!hasAccess) {
        return res
          .status(403)
          .json({ message: `Sem permissão para o tenant ${tenant.tenantId}` });
      }
    }

    const hashPassword = await bcrypt.hash(validatedData.data.senha, 10);

    const user = await prisma.user.create({
      data: {
        nome: validatedData.data.nome,
        email: validatedData.data.email,
        telefone: validatedData.data.telefone,
        senha: hashPassword,
        tenants: {
          create: tenants.map((tenant: TenantInput) => ({
            tenantId: Number(tenant.tenantId),
            cargo: tenant.cargo,
            active: true,
          })),
        },
      },
      include: {
        tenants: true,
      },
    });

    return res.status(201).json({
      message: "Usuário criado com sucesso",
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        telefone: user.telefone,
        tenants: user.tenants,
      },
    });
  } catch (error: any) {
    console.error("Erro ao criar usuário:", error);
    if (error?.code === "P2002") {
      return res.status(400).json({ message: "Email já cadastrado" });
    }
    return res.status(500).json({ message: "Erro ao criar usuário" });
  }
};

export const toggleUserStatus: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { userId } = req.params;
    const { tenantIds } = req.body; // Array de IDs dos tenants

    if (!userId || !tenantIds?.length) {
      return res.status(400).json({
        error: "Parâmetros inválidos",
        message: "UserId e pelo menos um TenantId são obrigatórios",
      });
    }

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        error: "Não autorizado",
        message: "Token não fornecido",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.DEFAULT_TOKEN as string) as {
        id: number;
      };
    } catch (error) {
      return res.status(401).json({
        error: "Token inválido",
        message: "Sua sessão expirou ou é inválida",
      });
    }

    // Verifica acesso a todos os tenants
    for (const tenantId of tenantIds) {
      const hasAccess = await prisma.userTenant.findFirst({
        where: {
          userId: decoded.id,
          tenantId: Number(tenantId),
        },
      });

      if (!hasAccess) {
        return res.status(403).json({
          error: "Acesso negado",
          message: `Você não tem permissão para acessar o tenant ${tenantId}`,
        });
      }
    }

    // Busca e atualiza todos os userTenants
    const results = await Promise.all(
      tenantIds.map(async (tenantId: number) => {
        const userTenant = await prisma.userTenant.findFirst({
          where: {
            userId: Number(userId),
            tenantId: Number(tenantId),
          },
        });

        if (!userTenant) {
          return {
            tenantId,
            success: false,
            message: "Usuário não encontrado neste tenant",
          };
        }

        const updated = await prisma.userTenant.update({
          where: {
            id: userTenant.id,
          },
          data: {
            active: !userTenant.active,
          },
        });

        return {
          tenantId,
          success: true,
          active: updated.active,
        };
      })
    );

    return res.json({
      success: true,
      message: "Status dos usuários atualizados",
      data: {
        userId: Number(userId),
        results,
      },
    });
  } catch (error) {
    console.error("Erro ao alterar status do usuário:", error);

    if (error instanceof Error) {
      return res.status(500).json({
        error: "Erro interno",
        message: "Erro ao alterar status do usuário",
        details: error.message,
      });
    }

    return res.status(500).json({
      error: "Erro interno",
      message: "Erro desconhecido ao alterar status do usuário",
    });
  }
};

export const findUserById: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { userId } = req.params;

    if (!userId || isNaN(Number(userId))) {
      return res.status(400).json({
        error: "Parâmetros inválidos",
        message: "UserId deve ser um número válido",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        tenants: {
          select: {
            id: true,
            tenantId: true,
            cargo: true,
            active: true,
            ultimo_login: true,
            tenant: {
              select: {
                id: true,
                nome: true,
                slug: true,
                img: true,
              },
            },
            roles: {
              select: {
                codigo: true,
              },
            },
            claims: {
              select: {
                codigo: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "Não encontrado",
        message: "Usuário não encontrado",
      });
    }

    // Formata a resposta
    const formattedUser = {
      ...user,
      tenants: user.tenants.map((tenant) => ({
        id: tenant.tenant.id,
        nome: tenant.tenant.nome,
        slug: tenant.tenant.slug,
        cargo: tenant.cargo,
        active: tenant.active,
        img: tenant.tenant.img,
        ultimo_login: tenant.ultimo_login,
        roles: tenant.roles.map((r) => r.codigo),
        claims: tenant.claims.map((c) => c.codigo),
      })),
    };

    return res.json({
      success: true,
      data: formattedUser,
    });
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);

    if (error instanceof Error) {
      return res.status(500).json({
        error: "Erro interno",
        message: "Erro ao buscar usuário",
        details: error.message,
      });
    }

    return res.status(500).json({
      error: "Erro interno",
      message: "Erro desconhecido ao buscar usuário",
    });
  }
};

export const findUserTenants: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        error: "Não autorizado",
        message: "Token não fornecido",
      });
    }

    const decoded = jwt.verify(token, process.env.DEFAULT_TOKEN as string) as {
      id: number;
    };

    const userTenants = await prisma.userTenant.findMany({
      where: {
        userId: decoded.id,
        active: true,
      },
      select: {
        tenant: {
          select: {
            id: true,
            nome: true,
            slug: true,
            img: true,
          },
        },
        cargo: true,
        roles: {
          select: {
            codigo: true,
          },
        },
        claims: {
          select: {
            codigo: true,
          },
        },
      },
    });

    const formattedTenants = userTenants.map((ut) => ({
      id: ut.tenant.id,
      nome: ut.tenant.nome,
      slug: ut.tenant.slug,
      img: ut.tenant.img,
      cargo: ut.cargo,
      roles: ut.roles.map((r) => r.codigo),
      claims: ut.claims.map((c) => c.codigo),
    }));

    return res.json({
      success: true,
      data: formattedTenants,
    });
  } catch (error) {
    console.error("Erro ao buscar tenants:", error);
    if (error instanceof Error) {
      return res.status(500).json({
        error: "Erro interno",
        message: "Erro ao buscar tenants",
        details: error.message,
      });
    }
    return res.status(500).json({
      error: "Erro interno",
      message: "Erro desconhecido ao buscar tenants",
    });
  }
};

export const getUsersByTenantId: RequestHandler = async (req, res) => {
  try {
    const { tenantId } = req.params;

    if (!tenantId || isNaN(Number(tenantId))) {
      return res.status(400).json({
        message: "O ID do tenant é obrigatório e deve ser um número.",
      });
    }

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token não fornecido." });
    }

    const decoded = jwt.verify(token, process.env.DEFAULT_TOKEN as string) as {
      id: number;
    };

    // Verificar se o usuário logado tem acesso ao tenant
    const hasAccess = await prisma.userTenant.findFirst({
      where: {
        userId: decoded.id,
        tenantId: Number(tenantId),
      },
    });

    if (!hasAccess) {
      return res
        .status(403)
        .json({ message: "Você não tem permissão para acessar este tenant." });
    }

    // Buscar todos os usuários associados ao tenant
    const usersInTenant = await prisma.userTenant.findMany({
      where: {
        tenantId: Number(tenantId),
      },
      select: {
        active: true,
        cargo: true,
        user: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
          },
        },
      },
    });

    // Formatar a resposta
    const formattedUsers = usersInTenant.map((ut) => ({
      id: ut.user.id,
      nome: ut.user.nome,
      email: ut.user.email,
      telefone: ut.user.telefone,
      cargo: ut.cargo,
      active: ut.active,
    }));

    return res.json({ success: true, data: formattedUsers });
  } catch (error) {
    console.error("Erro ao buscar usuários pelo tenant:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Token inválido." });
    }
    return res
      .status(500)
      .json({ message: "Erro interno ao buscar usuários." });
  }
};
