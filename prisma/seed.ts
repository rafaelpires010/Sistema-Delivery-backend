import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Verifica se já existe um tenant com o slug "test-tenant"
  const existingTenant = await prisma.tenant.findUnique({
    where: { slug: 'test-tenant' },
  });

  if (!existingTenant) {
    // Cria um novo tenant de teste
    await prisma.tenant.create({
      data: {
        slug: 'test-tenant',
        nome: 'Tenant de Teste',
        status: 'Ativo',
        main_color: '#FF5733',
        second_color: '#C70039',
        email: 'test-tenant@example.com',
        senha: 'senha_teste',
      },
    });
    console.log('Tenant de teste criado.');
  } else {
    console.log('Tenant de teste já existe.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
