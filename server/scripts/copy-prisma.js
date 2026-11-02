const fs = require('fs');
const path = require('path');

const prismaRoot = path.resolve(__dirname, '../../node_modules/.prisma');
const prismaLocal = path.resolve(__dirname, '../node_modules/.prisma');
const atPrismaRoot = path.resolve(__dirname, '../../node_modules/@prisma');
const atPrismaLocal = path.resolve(__dirname, '../node_modules/@prisma');

try {
  if (fs.existsSync(prismaRoot) && prismaRoot !== prismaLocal) {
    fs.mkdirSync(path.dirname(prismaLocal), { recursive: true });
    fs.cpSync(prismaRoot, prismaLocal, { recursive: true });
    console.log('✅ Copied .prisma into server/node_modules/.prisma');
  }
  if (fs.existsSync(atPrismaRoot) && atPrismaRoot !== atPrismaLocal) {
    fs.mkdirSync(path.dirname(atPrismaLocal), { recursive: true });
    fs.cpSync(atPrismaRoot, atPrismaLocal, { recursive: true });
    console.log('✅ Copied @prisma into server/node_modules/@prisma');
  }
} catch (err) {
  console.warn('Prisma copy note:', err.message);
}

