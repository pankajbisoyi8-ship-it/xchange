import { ListingStatus, Role } from '../../lib/prismaCompat.js';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';

// High-performance in-memory cache for fast local serving
let cachedCategories: any = null;
let cachedCategoriesExpiresAt = 0;
const queryCache = new Map<string, { data: any; expiresAt: number }>();

export function invalidateListingCache() {
  cachedCategories = null;
  cachedCategoriesExpiresAt = 0;
  queryCache.clear();
}

export class ListingsService {
  async getCategories() {
    const now = Date.now();
    if (cachedCategories && now < cachedCategoriesExpiresAt) {
      return cachedCategories;
    }

    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            listings: {
              where: { status: ListingStatus.ACTIVE }
            }
          }
        }
      }
    });

    cachedCategories = categories;
    cachedCategoriesExpiresAt = now + 120 * 1000; // 2 minutes cache
    return categories;
  }

  async getCategoryBySlug(slug: string) {
    const cat = await prisma.category.findUnique({ where: { slug } });
    if (!cat) throw new AppError('Category not found', 404, 'NOT_FOUND');
    return cat;
  }

  async queryListings(params: {
    q?: string;
    category?: string;
    brand?: string;
    condition?: any;
    minPrice?: number;
    maxPrice?: number;
    area?: string;
    sort?: 'newest' | 'price_asc' | 'price_desc';
    page: number;
    limit: number;
  }) {
    const { q, category, brand, condition, minPrice, maxPrice, area, sort = 'newest', page = 1, limit = 12 } = params;
    const skip = (page - 1) * limit;

    // Check query cache (15-second TTL)
    const cacheKey = JSON.stringify(params);
    const now = Date.now();
    const cached = queryCache.get(cacheKey);
    if (cached && now < cached.expiresAt) {
      return cached.data;
    }

    const where: any = {
      status: ListingStatus.ACTIVE
    };

    if (q && q.trim()) {
      const trimmed = q.trim();
      const lower = trimmed.toLowerCase();

      // Hardware synonym mapping to categories
      const categorySlugs: string[] = [];
      if (/gpu|graphic|graphics|video card|rtx|gtx|geforce|radeon/i.test(lower)) {
        categorySlugs.push('gpu');
      }
      if (/cpu|processor|ryzen|intel|core i/i.test(lower)) {
        categorySlugs.push('cpu');
      }
      if (/ram|memory|ddr4|ddr5/i.test(lower)) {
        categorySlugs.push('ram');
      }
      if (/motherboard|mobo|strix|b550|z690|b650|am4|lga/i.test(lower)) {
        categorySlugs.push('motherboard');
      }
      if (/ssd|hdd|storage|nvme|m\.2|hard drive|disk/i.test(lower)) {
        categorySlugs.push('storage');
      }
      if (/monitor|display|screen|144hz|ips|oled/i.test(lower)) {
        categorySlugs.push('monitors');
      }
      if (/controller|gamepad|xbox|dualshock|dualsense/i.test(lower)) {
        categorySlugs.push('controllers');
      }
      if (/joystick|flight|throttle|hotas/i.test(lower)) {
        categorySlugs.push('joysticks');
      }

      const orConditions: any[] = [
        { title: { contains: trimmed, mode: 'insensitive' } },
        { brand: { contains: trimmed, mode: 'insensitive' } },
        { model: { contains: trimmed, mode: 'insensitive' } },
        { description: { contains: trimmed, mode: 'insensitive' } },
        { category: { name: { contains: trimmed, mode: 'insensitive' } } },
        { category: { slug: { contains: trimmed, mode: 'insensitive' } } },
      ];

      if (categorySlugs.length > 0) {
        orConditions.push({
          category: {
            slug: { in: categorySlugs }
          }
        });
      }

      // If multi-word query, also match individual words
      const terms = trimmed.split(/\s+/).filter(t => t.length > 1);
      if (terms.length > 1) {
        terms.forEach(term => {
          orConditions.push(
            { title: { contains: term, mode: 'insensitive' } },
            { brand: { contains: term, mode: 'insensitive' } },
            { model: { contains: term, mode: 'insensitive' } },
            { category: { name: { contains: term, mode: 'insensitive' } } },
            { category: { slug: { contains: term, mode: 'insensitive' } } }
          );
        });
      }

      where.OR = orConditions;
    }

    if (category) {
      where.category = {
        OR: [
          { id: category },
          { slug: category }
        ]
      };
    }

    if (brand) {
      where.brand = { equals: brand, mode: 'insensitive' };
    }

    if (condition) {
      where.condition = condition;
    }

    if (area) {
      where.area = { contains: area, mode: 'insensitive' };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };

    const [items, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { position: 'asc' } },
          seller: {
            select: {
              id: true,
              name: true,
              area: true,
              createdAt: true
            }
          }
        }
      }),
      prisma.listing.count({ where })
    ]);

    const result = {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };

    // Cache the result for 15 seconds
    queryCache.set(cacheKey, { data: result, expiresAt: now + 15 * 1000 });

    return result;
  }

  async getListingById(id: string) {
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: { position: 'asc' } },
        seller: {
          select: {
            id: true,
            name: true,
            area: true,
            createdAt: true,
            reviews: {
              where: { hidden: false },
              select: { sellerRating: true }
            }
          }
        }
      }
    });

    if (!listing) {
      throw new AppError('Listing not found', 404, 'NOT_FOUND');
    }

    // Calculate seller rating metrics
    const ratings = listing.seller.reviews.map(r => r.sellerRating);
    const sellerAvgRating = ratings.length
      ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
      : 5.0; // default 5 for new seller

    return {
      ...listing,
      seller: {
        id: listing.seller.id,
        name: listing.seller.name,
        area: listing.seller.area,
        memberSince: listing.seller.createdAt,
        avgRating: sellerAvgRating,
        reviewCount: ratings.length
      }
    };
  }

  async createListing(sellerId: string, data: any) {
    // Validate category exists
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId }
    });

    if (!category) {
      throw new AppError('Specified category does not exist.', 400, 'INVALID_CATEGORY');
    }

    // Default status: PENDING_REVIEW (as required by PRD LST-4: Admin approval required)
    const listing = await prisma.listing.create({
      data: {
        sellerId,
        categoryId: data.categoryId,
        title: data.title,
        brand: data.brand,
        model: data.model,
        specs: data.specs,
        condition: data.condition,
        ageMonths: data.ageMonths,
        price: data.price,
        area: data.area,
        description: data.description,
        status: ListingStatus.PENDING_REVIEW,
        images: {
          create: data.images.map((url: string, index: number) => ({
            url,
            position: index
          }))
        }
      },
      include: {
        category: true,
        images: true
      }
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        actorId: sellerId,
        action: 'LISTING_CREATE',
        entity: 'Listing',
        entityId: listing.id,
        meta: { title: listing.title, price: listing.price }
      }
    });

    invalidateListingCache();
    return listing;
  }

  async updateListing(sellerId: string, userRole: Role, listingId: string, data: any) {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId }
    });

    if (!listing) {
      throw new AppError('Listing not found', 404, 'NOT_FOUND');
    }

    if (listing.sellerId !== sellerId && userRole !== Role.ADMIN) {
      throw new AppError('You do not have permission to modify this listing.', 403, 'FORBIDDEN');
    }

    if (listing.status === ListingStatus.RESERVED || listing.status === ListingStatus.SOLD) {
      throw new AppError('Active or sold listings cannot be modified directly.', 400, 'CANNOT_MODIFY');
    }

    const { images, ...fields } = data;

    const updated = await prisma.$transaction(async (tx) => {
      if (images && images.length > 0) {
        await tx.listingImage.deleteMany({ where: { listingId } });
        await tx.listingImage.createMany({
          data: images.map((url: string, index: number) => ({
            listingId,
            url,
            position: index
          }))
        });
      }

      return tx.listing.update({
        where: { id: listingId },
        data: {
          ...fields,
          // If seller updates a rejected or active listing, put it back to PENDING_REVIEW
          status: userRole === Role.ADMIN ? fields.status : ListingStatus.PENDING_REVIEW
        },
        include: {
          category: true,
          images: true
        }
      });
    }, { maxWait: 15000, timeout: 30000 });

    invalidateListingCache();
    return updated;
  }

  async getMyListings(sellerId: string) {
    return prisma.listing.findMany({
      where: { sellerId },
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        images: { take: 1, orderBy: { position: 'asc' } },
        orders: {
          select: {
            id: true,
            status: true,
            createdAt: true
          }
        }
      }
    });
  }
}

export const listingsService = new ListingsService();

