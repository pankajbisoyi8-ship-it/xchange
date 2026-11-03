const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, email: true, role: true, name: true } });
  console.log('Users count:', users.length);
  users.forEach(u => console.log(` - [${u.role}] ${u.name} (${u.email})`));

  const listings = await prisma.listing.findMany({ select: { id: true, title: true, price: true, status: true }, take: 5 });
  console.log('Listings count:', listings.length);
  listings.forEach(l => console.log(` - ${l.title} (Rs. ${l.price}) [${l.status}] ID: ${l.id}`));

  const orders = await prisma.order.findMany({ select: { id: true, status: true, totalToCollect: true, itemPrice: true }, take: 5 });
  console.log('Orders count:', orders.length);
  orders.forEach(o => console.log(` - Order ID: ${o.id}: Rs. ${o.totalToCollect} [${o.status}]`));

  const agentTasks = await prisma.agentTask.findMany({ select: { id: true, taskType: true, status: true }, take: 5 });
  console.log('AgentTasks count:', agentTasks.length);
  agentTasks.forEach(t => console.log(` - [${t.taskType}] ${t.status} ID: ${t.id}`));

  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
