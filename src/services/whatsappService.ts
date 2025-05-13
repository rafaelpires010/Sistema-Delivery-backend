import { Client, LocalAuth, MessageMedia } from "whatsapp-web.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class WhatsAppService {
  private client: Client;

  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        args: ["--no-sandbox"],
      },
    });

    this.initialize();
  }

  private initialize() {
    this.client.on("qr", (qr) => {
      console.log("QR RECEIVED", qr);
    });

    this.client.on("ready", () => {
      console.log("WhatsApp Client is ready!");
    });

    this.client.initialize();
  }

  async sendBulkMessage(tenantId: number, imageUrl: string, message: string) {
    try {
      // Buscar todos os usuários do tenant
      const users = await prisma.user.findMany({
        where: {
          tenants: {
            some: {
              tenantId: tenantId,
            },
          },
        },
        select: {
          telefone: true,
        },
      });

      // Carregar a imagem
      const media = await MessageMedia.fromUrl(imageUrl);

      // Enviar mensagem para cada usuário
      const results = await Promise.allSettled(
        users.map(async (user) => {
          try {
            const formattedNumber = this.formatPhoneNumber(user.telefone);
            const chat = await this.client.getChatById(
              `${formattedNumber}@c.us`
            );

            // Enviar imagem com mensagem
            await chat.sendMessage(media, {
              caption: message,
            });

            return { phone: user.telefone, status: "success" };
          } catch (error) {
            console.error(
              `Erro ao enviar mensagem para ${user.telefone}:`,
              error
            );
            return { phone: user.telefone, status: "error", error };
          }
        })
      );

      return {
        total: users.length,
        results: results.map((result) => {
          if (result.status === "fulfilled") {
            return result.value;
          } else {
            return { status: "error", error: result.reason };
          }
        }),
      };
    } catch (error) {
      console.error("Erro no envio em massa:", error);
      throw new Error("Falha no envio em massa de mensagens");
    }
  }

  private formatPhoneNumber(phone: string): string {
    // Remove caracteres não numéricos
    const numbers = phone.replace(/\D/g, "");

    // Adiciona código do país se necessário
    if (!numbers.startsWith("55")) {
      return `55${numbers}`;
    }

    return numbers;
  }
}

export const whatsAppService = new WhatsAppService();
