import { logger } from './logger.js';
import { env } from '../config/env.js';

const fallbackCategories = [
  { id: 'cat-gpu', name: 'Graphics Cards (GPU)', slug: 'gpu', description: 'Dedicated GPUs for gaming, 3D rendering, and video editing' },
  { id: 'cat-cpu', name: 'Processors (CPU)', slug: 'cpu', description: 'Intel Core and AMD Ryzen desktop and laptop processors' },
  { id: 'cat-ram', name: 'Memory (RAM)', slug: 'ram', description: 'DDR4 and DDR5 memory modules for desktops and laptops' },
  { id: 'cat-motherboard', name: 'Motherboards', slug: 'motherboard', description: 'ATX, Micro-ATX, and Mini-ITX motherboards' },
  { id: 'cat-storage', name: 'Storage (SSD & HDD)', slug: 'storage', description: 'High-speed NVMe M.2 SSDs and storage devices' },
  { id: 'cat-monitors', name: 'Monitors & Displays', slug: 'monitors', description: 'High refresh rate gaming monitors and displays' },
  { id: 'cat-controllers', name: 'Controllers & Gamepads', slug: 'controllers', description: 'Xbox, PlayStation, and PC gaming controllers' },
  { id: 'cat-joysticks', name: 'Flight Sticks & Joysticks', slug: 'joysticks', description: 'Flight simulation and HOTAS controllers' }
];

const fallbackListings = [
  {
    id: 'sample-listing-gpu-1',
    sellerId: 'demo-seller',
    categoryId: 'cat-gpu',
    title: 'MSI RTX 3070 Gaming X Trio',
    brand: 'MSI',
    model: 'RTX 3070 Gaming X Trio',
    specs: { chipset: 'RTX 3070', vramGb: 8, memoryType: 'GDDR6', powerConnectors: '2x8-pin', interface: 'PCIe 4.0 x16' },
    condition: 'GOOD',
    ageMonths: 15,
    price: 41000,
    area: 'South Delhi',
    description: 'Bench-tested GPU with no coil whine, excellent thermals, original box and dual BIOS.',
    status: 'ACTIVE',
    isInspected: true,
    createdAt: new Date('2026-11-01T15:37:31.962Z'),
    updatedAt: new Date('2026-11-01T15:37:31.962Z'),
    category: { id: 'cat-gpu', name: 'Graphics Cards (GPU)', slug: 'gpu' },
    images: [{ id: 'img-gpu', listingId: 'sample-listing-gpu-1', url: '/images/grafhics card.jpg', position: 0, createdAt: new Date('2026-11-01T15:37:31.962Z') }],
    seller: { id: 'demo-seller', name: 'Rahul Sharma', area: 'South Delhi', createdAt: new Date('2026-11-01T15:13:29.422Z') }
  },
  {
    id: 'sample-listing-monitor-1',
    sellerId: 'demo-seller',
    categoryId: 'cat-monitors',
    title: 'UltraGear 27-inch 144Hz 1ms IPS Gaming Monitor',
    brand: 'LG',
    model: '27GL850-B',
    specs: { panelType: 'Nano-IPS', resolution: '2560x1440 (2K QHD)', refreshRateHz: 144, screenSizeInches: 27 },
    condition: 'GOOD',
    ageMonths: 16,
    price: 17500,
    area: 'South Delhi',
    description: 'Zero dead pixels, excellent IPS color uniformity and fast 144Hz refresh rate with G-Sync compatibility.',
    status: 'ACTIVE',
    isInspected: true,
    createdAt: new Date('2026-11-01T15:37:31.962Z'),
    updatedAt: new Date('2026-11-01T15:37:31.962Z'),
    category: { id: 'cat-monitors', name: 'Monitors & Displays', slug: 'monitors' },
    images: [{ id: 'img-monitor', listingId: 'sample-listing-monitor-1', url: '/images/monitor.webp', position: 0, createdAt: new Date('2026-11-01T15:37:31.962Z') }],
    seller: { id: 'demo-seller', name: 'Rahul Sharma', area: 'South Delhi', createdAt: new Date('2026-11-01T15:13:29.422Z') }
  },
  {
    id: 'sample-listing-cpu-1',
    sellerId: 'demo-seller',
    categoryId: 'cat-cpu',
    title: 'AMD Ryzen 5 5600X Processor',
    brand: 'AMD',
    model: 'Ryzen 5 5600X',
    specs: { socket: 'AM4', cores: 6, threads: 12, baseClockGhz: 3.7, boostClockGhz: 4.6, tdpWatts: 65, coolerIncluded: true },
    condition: 'GOOD',
    ageMonths: 9,
    price: 12800,
    area: 'Gurgaon',
    description: 'Smooth gaming performance, minimal use, original AMD cooler included and packed with proof of inspection.',
    status: 'ACTIVE',
    isInspected: true,
    createdAt: new Date('2026-11-02T10:00:00.000Z'),
    updatedAt: new Date('2026-11-02T10:00:00.000Z'),
    category: { id: 'cat-cpu', name: 'Processors (CPU)', slug: 'cpu' },
    images: [{ id: 'img-cpu', listingId: 'sample-listing-cpu-1', url: '/images/cpu.jpg', position: 0, createdAt: new Date('2026-11-02T10:00:00.000Z') }],
    seller: { id: 'demo-seller', name: 'Rahul Sharma', area: 'Gurgaon', createdAt: new Date('2026-11-01T15:13:29.422Z') }
  }
];

function buildFallbackPrisma() {
  const demoUsers = [
    {
      id: 'demo-buyer',
      email: 'buyer.amit@gmail.com',
      passwordHash: '$2a$10$JdMhdzc8N4fS0ffKz7cVYOvkdTUf4Vxq2hQ8jNn1Y2P/HF9tCE6J2',
      name: 'Amit Verma',
      phone: '+919876543203',
      role: 'USER',
      status: 'ACTIVE',
      area: 'Gurgaon',
      createdAt: new Date('2026-11-01T15:13:29.422Z'),
      emailVerified: true,
      phoneVerified: true,
      updatedAt: new Date('2026-11-01T15:13:29.422Z')
    },
    {
      id: 'demo-seller',
      email: 'seller.rahul@gmail.com',
      passwordHash: '$2a$10$JdMhdzc8N4fS0ffKz7cVYOvkdTUf4Vxq2hQ8jNn1Y2P/HF9tCE6J2',
      name: 'Rahul Sharma',
      phone: '+919876543202',
      role: 'USER',
      status: 'ACTIVE',
      area: 'South Delhi',
      createdAt: new Date('2026-11-01T15:13:29.422Z'),
      emailVerified: true,
      phoneVerified: true,
      updatedAt: new Date('2026-11-01T15:13:29.422Z')
    },
    {
      id: 'demo-admin',
      email: 'admin@partxchange.com',
      passwordHash: '$2a$10$Q1S4XWZ8H5mD5wAlmJbAwuZci8Y4x7F8lkB6m5u0c2B0weqQ0D0ke',
      name: 'System SuperAdmin',
      phone: '+919876543200',
      role: 'ADMIN',
      status: 'ACTIVE',
      area: 'HQ',
      createdAt: new Date('2026-11-01T15:13:29.422Z'),
      emailVerified: true,
      phoneVerified: true,
      updatedAt: new Date('2026-11-01T15:13:29.422Z')
    }
  ];

  const refreshTokens: any[] = [];
  const auditLogs: any[] = [];

  return {
    $queryRaw: async () => [{ ok: 1 }],
    $disconnect: async () => undefined,
    $transaction: async (callback: any) => callback({
      listing: {
        update: async (_args: any) => ({ ok: true }),
        create: async (_args: any) => ({ ok: true }),
        deleteMany: async () => undefined,
        createMany: async () => undefined,
      }
    }),
    category: {
      findMany: async (args: any = {}) => {
        let rows = fallbackCategories.map((category) => ({
          ...category,
          _count: { listings: fallbackListings.filter((listing) => listing.categoryId === category.id).length }
        }));
        if (args.orderBy?.name === 'asc') rows = [...rows].sort((a, b) => a.name.localeCompare(b.name));
        return rows;
      },
      findUnique: async ({ where }: any) => {
        if (!where) return null;
        return fallbackCategories.find((category) => (where.slug && category.slug === where.slug) || (where.id && category.id === where.id)) ?? null;
      }
    },
    listing: {
      findMany: async (args: any = {}) => {
        const where: any = args.where ?? {};
        const orderBy: any = args.orderBy;
        const skip = Number(args.skip ?? 0);
        const take = Number(args.take ?? 50);
        let rows = [...fallbackListings];

        if (where.status) rows = rows.filter((listing: any) => listing.status === where.status);
        if (where.category) {
          const categoryFilter = where.category.OR?.find((entry: any) => entry.slug)?.slug ?? where.category.slug ?? null;
          if (categoryFilter) rows = rows.filter((listing: any) => listing.category.slug === categoryFilter);
        }
        if (where.area?.contains) rows = rows.filter((listing: any) => listing.area.toLowerCase().includes(where.area.contains.toLowerCase()));
        if (where.price?.gte !== undefined) rows = rows.filter((listing: any) => Number(listing.price) >= Number(where.price.gte));
        if (where.price?.lte !== undefined) rows = rows.filter((listing: any) => Number(listing.price) <= Number(where.price.lte));
        if (orderBy?.createdAt === 'desc' || orderBy?.price === 'desc') rows = rows.sort((a: any, b: any) => Number(b.createdAt) - Number(a.createdAt));
        if (orderBy?.price === 'asc') rows = rows.sort((a: any, b: any) => Number(a.price) - Number(b.price));
        if (orderBy?.price === 'desc') rows = rows.sort((a: any, b: any) => Number(b.price) - Number(a.price));

        return rows.slice(skip, skip + take).map((listing: any) => ({
          ...listing,
          createdAt: new Date(listing.createdAt),
          updatedAt: new Date(listing.updatedAt),
          images: listing.images.map((image: any) => ({ ...image, createdAt: new Date(image.createdAt) })),
          seller: { ...listing.seller, createdAt: new Date(listing.seller.createdAt) }
        }));
      },
      count: async ({ where = {} }: any = {}) => {
        let rows = [...fallbackListings];
        if (where.status) rows = rows.filter((listing: any) => listing.status === where.status);
        if (where.category) {
          const slug = where.category.OR?.find((entry: any) => entry.slug)?.slug ?? where.category.slug ?? null;
          if (slug) rows = rows.filter((listing: any) => listing.category.slug === slug);
        }
        return rows.length;
      },
      findUnique: async ({ where }: any) => {
        const match = fallbackListings.find((listing) => listing.id === where.id);
        if (!match) return null;
        return {
          ...match,
          createdAt: new Date(match.createdAt),
          updatedAt: new Date(match.updatedAt),
          images: match.images.map((image: any) => ({ ...image, createdAt: new Date(image.createdAt) })),
          seller: { ...match.seller, createdAt: new Date(match.seller.createdAt) }
        };
      }
    },
    user: {
      findUnique: async ({ where }: any) => {
        if (!where) return null;
        if (where.email) return demoUsers.find((user) => user.email === where.email) ?? null;
        if (where.phone) return demoUsers.find((user) => user.phone === where.phone) ?? null;
        if (where.id) return demoUsers.find((user) => user.id === where.id) ?? null;
        return null;
      },
      create: async ({ data }: any) => {
        const newUser = {
          ...data,
          id: `user-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          emailVerified: true,
          phoneVerified: !!data.phone,
          status: data.status ?? 'ACTIVE',
          role: data.role ?? 'USER'
        };
        demoUsers.push(newUser);
        return newUser;
      }
    },
    refreshToken: {
      create: async ({ data }: any) => {
        const record = {
          id: `refresh-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
          revokedAt: null
        };
        refreshTokens.push(record);
        return record;
      },
      findUnique: async ({ where }: any) => {
        const record = refreshTokens.find((token) => token.tokenHash === where.tokenHash);
        if (!record) return null;
        const user = demoUsers.find((entry) => entry.id === record.userId) ?? null;
        return user ? { ...record, user } : null;
      },
      update: async ({ where, data }: any) => {
        const index = refreshTokens.findIndex((token) => token.id === where.id);
        if (index >= 0) {
          refreshTokens[index] = { ...refreshTokens[index], ...data };
          return refreshTokens[index];
        }
        return null;
      },
      updateMany: async ({ where, data }: any) => {
        refreshTokens.forEach((token) => {
          if (where.userId && token.userId === where.userId) {
            token.revokedAt = data.revokedAt ?? new Date();
            token.updatedAt = new Date();
          }
        });
        return { count: refreshTokens.length };
      }
    },
    auditLog: {
      create: async ({ data }: any) => {
        auditLogs.push({ id: `audit-${Date.now()}`, ...data, createdAt: new Date() });
        return { ok: true };
      }
    }
  };
}

const globalForPrisma = globalThis as unknown as { prisma?: unknown };

let prismaClient: any;

try {
  const prismaModule = require('@prisma/client');
  const PrismaClient = prismaModule.PrismaClient;
  prismaClient =
    globalForPrisma.prisma ||
    new PrismaClient({
      datasources: {
        db: {
          url: env.DATABASE_URL,
        },
      },
      log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  globalForPrisma.prisma = prismaClient;
} catch (error) {
  logger.warn({ err: error }, 'Prisma client unavailable; using in-memory fallback data for public marketplace endpoints');
  prismaClient = buildFallbackPrisma();
  globalForPrisma.prisma = prismaClient;
}

export const prisma = prismaClient;
