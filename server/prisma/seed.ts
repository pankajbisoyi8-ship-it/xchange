import { PrismaClient, Role, AccountStatus, Condition, ListingStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting PartXchange database seeding with local hardware images...');

  // 1. Seed Categories with Category-specific JSON Spec Schemas
  const categories = [
    {
      name: 'Graphics Cards (GPU)',
      slug: 'gpu',
      description: 'Dedicated GPUs for gaming, 3D rendering, and video editing',
      icon: 'cpu',
      specSchema: {
        fields: [
          { name: 'chipset', label: 'Chipset (e.g. RTX 3070, RX 6700 XT)', type: 'string', required: true },
          { name: 'vramGb', label: 'VRAM (GB)', type: 'number', required: true },
          { name: 'memoryType', label: 'Memory Type (e.g. GDDR6, GDDR6X)', type: 'string', required: true },
          { name: 'powerConnectors', label: 'Power Connectors (e.g. 1x8-pin, 2x8-pin)', type: 'string', required: false },
          { name: 'interface', label: 'Bus Interface (e.g. PCIe 4.0 x16)', type: 'string', required: false },
        ]
      }
    },
    {
      name: 'Processors (CPU)',
      slug: 'cpu',
      description: 'Intel Core and AMD Ryzen desktop and laptop processors',
      icon: 'cpu',
      specSchema: {
        fields: [
          { name: 'socket', label: 'Socket (e.g. AM4, LGA1700)', type: 'string', required: true },
          { name: 'cores', label: 'Core Count', type: 'number', required: true },
          { name: 'threads', label: 'Thread Count', type: 'number', required: true },
          { name: 'baseClockGhz', label: 'Base Clock (GHz)', type: 'number', required: true },
          { name: 'boostClockGhz', label: 'Boost Clock (GHz)', type: 'number', required: false },
          { name: 'tdpWatts', label: 'TDP (Watts)', type: 'number', required: false },
          { name: 'coolerIncluded', label: 'Stock Cooler Included', type: 'boolean', required: false }
        ]
      }
    },
    {
      name: 'Motherboards',
      slug: 'motherboard',
      description: 'ATX, Micro-ATX, and Mini-ITX motherboards with pin integrity verified',
      icon: 'layers',
      specSchema: {
        fields: [
          { name: 'socket', label: 'CPU Socket', type: 'string', required: true },
          { name: 'chipset', label: 'Chipset (e.g. B550, Z690)', type: 'string', required: true },
          { name: 'formFactor', label: 'Form Factor (ATX, Micro-ATX, Mini-ITX)', type: 'string', required: true },
          { name: 'memorySlots', label: 'RAM Slots (2 or 4)', type: 'number', required: true },
          { name: 'wifiIncluded', label: 'Onboard Wi-Fi Included', type: 'boolean', required: false }
        ]
      }
    },
    {
      name: 'Storage (SSD & HDD)',
      slug: 'storage',
      description: 'High-speed NVMe M.2 SSDs, SATA SSDs, and bulk hard drives',
      icon: 'hard-drive',
      specSchema: {
        fields: [
          { name: 'storageType', label: 'Type (NVMe M.2, SATA SSD, HDD)', type: 'string', required: true },
          { name: 'capacityGb', label: 'Capacity (GB)', type: 'number', required: true },
          { name: 'healthPercentage', label: 'CrystalDiskHealth (%)', type: 'number', required: false },
          { name: 'readSpeedMb', label: 'Sequential Read Speed (MB/s)', type: 'number', required: false }
        ]
      }
    },
    {
      name: 'Monitors & Displays',
      slug: 'monitors',
      description: 'High refresh rate gaming monitors and color-accurate productivity displays',
      icon: 'monitor',
      specSchema: {
        fields: [
          { name: 'screenSizeInches', label: 'Screen Size (Inches)', type: 'number', required: true },
          { name: 'resolution', label: 'Resolution (1080p, 1440p, 4K)', type: 'string', required: true },
          { name: 'refreshRateHz', label: 'Refresh Rate (Hz)', type: 'number', required: true },
          { name: 'panelType', label: 'Panel Type (IPS, VA, OLED, TN)', type: 'string', required: true }
        ]
      }
    },
    {
      name: 'Controllers & Gamepads',
      slug: 'controllers',
      description: 'Xbox, PlayStation, and PC wireless/wired gaming controllers',
      icon: 'gamepad-2',
      specSchema: {
        fields: [
          { name: 'connectivity', label: 'Connectivity (Wireless, Bluetooth, Wired)', type: 'string', required: true },
          { name: 'compatibility', label: 'Compatibility (PC, Xbox, PS5, Switch)', type: 'string', required: true },
          { name: 'analogDriftTested', label: 'Zero Stick Drift Verified', type: 'boolean', required: false }
        ]
      }
    },
    {
      name: 'Flight Sticks & Joysticks',
      slug: 'joysticks',
      description: 'Flight simulation sticks, throttles, and HOTAS controllers',
      icon: 'crosshair',
      specSchema: {
        fields: [
          { name: 'axesCount', label: 'Programmable Axes Count', type: 'number', required: true },
          { name: 'throttleIncluded', label: 'Separate Throttle Unit Included', type: 'boolean', required: true },
          { name: 'connectionType', label: 'Connection (USB)', type: 'string', required: false }
        ]
      }
    },
    {
      name: 'Memory (RAM)',
      slug: 'ram',
      description: 'DDR4 and DDR5 memory modules for desktops and laptops',
      icon: 'database',
      specSchema: {
        fields: [
          { name: 'generation', label: 'Generation (DDR4 / DDR5)', type: 'string', required: true },
          { name: 'capacityGb', label: 'Total Capacity (GB)', type: 'number', required: true },
          { name: 'moduleCount', label: 'Stick Count (e.g. 1, 2, 4)', type: 'number', required: true },
          { name: 'speedMhz', label: 'Speed (MHz)', type: 'number', required: true }
        ]
      }
    }
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }
  console.log(`✅ Seeded ${categories.length} hardware categories.`);

  // 2. Seed Default Accounts
  const hashedPassword = await bcrypt.hash('Password123!', 10);
  const adminPassword = await bcrypt.hash('AdminPass123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@partxchange.com' },
    update: {},
    create: {
      email: 'admin@partxchange.com',
      passwordHash: adminPassword,
      name: 'System SuperAdmin',
      phone: '+919876543200',
      phoneVerified: true,
      emailVerified: true,
      role: Role.ADMIN,
      status: AccountStatus.ACTIVE,
      area: 'HQ'
    }
  });

  const agent = await prisma.user.upsert({
    where: { email: 'agent.vikram@partxchange.com' },
    update: {},
    create: {
      email: 'agent.vikram@partxchange.com',
      passwordHash: hashedPassword,
      name: 'Vikram Singh (Field Agent)',
      phone: '+919876543201',
      phoneVerified: true,
      emailVerified: true,
      role: Role.AGENT,
      status: AccountStatus.ACTIVE,
      area: 'Delhi NCR'
    }
  });

  const seller = await prisma.user.upsert({
    where: { email: 'seller.rahul@gmail.com' },
    update: {},
    create: {
      email: 'seller.rahul@gmail.com',
      passwordHash: hashedPassword,
      name: 'Rahul Sharma',
      phone: '+919876543202',
      phoneVerified: true,
      emailVerified: true,
      role: Role.USER,
      status: AccountStatus.ACTIVE,
      area: 'South Delhi'
    }
  });

  const buyer = await prisma.user.upsert({
    where: { email: 'buyer.amit@gmail.com' },
    update: {},
    create: {
      email: 'buyer.amit@gmail.com',
      passwordHash: hashedPassword,
      name: 'Amit Verma',
      phone: '+919876543203',
      phoneVerified: true,
      emailVerified: true,
      role: Role.USER,
      status: AccountStatus.ACTIVE,
      area: 'Gurgaon'
    }
  });

  console.log('✅ Seeded demo accounts: Admin, Agent, Seller, Buyer');

  // 3. Add default addresses
  await prisma.address.upsert({
    where: { id: 'seller-addr-1' },
    update: {},
    create: {
      id: 'seller-addr-1',
      userId: seller.id,
      line1: 'Flat 402, Green Park Residency',
      line2: 'Near Metro Station',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110016',
      phone: '+919876543202',
      isDefault: true
    }
  });

  await prisma.address.upsert({
    where: { id: 'buyer-addr-1' },
    update: {},
    create: {
      id: 'buyer-addr-1',
      userId: buyer.id,
      line1: 'House 88, Sector 45',
      line2: 'Behind City Hospital',
      city: 'Gurgaon',
      state: 'Haryana',
      pincode: '122003',
      phone: '+919876543203',
      isDefault: true
    }
  });

  // 4. Fetch Category IDs
  const gpuCat = await prisma.category.findUnique({ where: { slug: 'gpu' } });
  const cpuCat = await prisma.category.findUnique({ where: { slug: 'cpu' } });
  const mbCat = await prisma.category.findUnique({ where: { slug: 'motherboard' } });
  const ssdCat = await prisma.category.findUnique({ where: { slug: 'storage' } });
  const monitorCat = await prisma.category.findUnique({ where: { slug: 'monitors' } });
  const controllerCat = await prisma.category.findUnique({ where: { slug: 'controllers' } });
  const joystickCat = await prisma.category.findUnique({ where: { slug: 'joysticks' } });

  // 5. Seed Verified Listings with the User's Local Images
  if (gpuCat) {
    await prisma.listingImage.deleteMany({ where: { listingId: 'sample-listing-gpu-1' } });
    await prisma.listing.upsert({
      where: { id: 'sample-listing-gpu-1' },
      update: {
        images: {
          create: [{ url: '/images/grafhics card.jpg', position: 0 }]
        }
      },
      create: {
        id: 'sample-listing-gpu-1',
        sellerId: seller.id,
        categoryId: gpuCat.id,
        title: 'GeForce RTX Gaming Graphics Card 8GB GDDR6',
        brand: 'NVIDIA',
        model: 'RTX 3070 OC Edition',
        condition: Condition.GOOD,
        ageMonths: 14,
        price: 24500.00,
        area: 'South Delhi',
        description: 'Excellent thermal performance, clean fans and pristine backplate. Bench-tested with 3DMark TimeSpy with zero artifacts. Original box included.',
        status: ListingStatus.ACTIVE,
        isInspected: true,
        specs: {
          chipset: 'NVIDIA RTX 3070',
          vramGb: 8,
          memoryType: 'GDDR6',
          powerConnectors: '2x8-pin',
          interface: 'PCIe 4.0 x16'
        },
        images: {
          create: [{ url: '/images/grafhics card.jpg', position: 0 }]
        }
      }
    });
  }

  if (cpuCat) {
    await prisma.listingImage.deleteMany({ where: { listingId: 'sample-listing-cpu-1' } });
    await prisma.listing.upsert({
      where: { id: 'sample-listing-cpu-1' },
      update: {
        images: {
          create: [{ url: '/images/cpu.jpg', position: 0 }]
        }
      },
      create: {
        id: 'sample-listing-cpu-1',
        sellerId: seller.id,
        categoryId: cpuCat.id,
        title: 'AMD Ryzen 7 5800X 8-Core 16-Thread Processor',
        brand: 'AMD',
        model: 'Ryzen 7 5800X',
        condition: Condition.LIKE_NEW,
        ageMonths: 10,
        price: 15500.00,
        area: 'South Delhi',
        description: 'Cleanly unmounted from personal gaming rig. All gold contact pins 100% straight and verified. In original blister pack.',
        status: ListingStatus.ACTIVE,
        isInspected: true,
        specs: {
          socket: 'AM4',
          cores: 8,
          threads: 16,
          baseClockGhz: 3.8,
          boostClockGhz: 4.7,
          tdpWatts: 105,
          coolerIncluded: false
        },
        images: {
          create: [{ url: '/images/cpu.jpg', position: 0 }]
        }
      }
    });
  }

  if (mbCat) {
    await prisma.listingImage.deleteMany({ where: { listingId: 'sample-listing-mb-1' } });
    await prisma.listing.upsert({
      where: { id: 'sample-listing-mb-1' },
      update: {
        images: {
          create: [{ url: '/images/motherbord.jpg', position: 0 }]
        }
      },
      create: {
        id: 'sample-listing-mb-1',
        sellerId: seller.id,
        categoryId: mbCat.id,
        title: 'ASUS ROG Strix Gaming ATX Motherboard with PCIe 4.0',
        brand: 'ASUS',
        model: 'ROG Strix B550-F Gaming',
        condition: Condition.LIKE_NEW,
        ageMonths: 8,
        price: 13200.00,
        area: 'South Delhi',
        description: 'Robust power delivery and heavy heatsinks. Dual M.2 slots, Intel 2.5G LAN, SupremeFX audio. Socket pins thoroughly inspected and flawless.',
        status: ListingStatus.ACTIVE,
        isInspected: true,
        specs: {
          socket: 'AM4',
          chipset: 'AMD B550',
          formFactor: 'ATX',
          memorySlots: 4,
          wifiIncluded: true
        },
        images: {
          create: [{ url: '/images/motherbord.jpg', position: 0 }]
        }
      }
    });
  }

  if (ssdCat) {
    await prisma.listingImage.deleteMany({ where: { listingId: 'sample-listing-ssd-1' } });
    await prisma.listing.upsert({
      where: { id: 'sample-listing-ssd-1' },
      update: {
        images: {
          create: [{ url: '/images/ssd.jpg', position: 0 }]
        }
      },
      create: {
        id: 'sample-listing-ssd-1',
        sellerId: seller.id,
        categoryId: ssdCat.id,
        title: 'Samsung 980 PRO 1TB PCIe 4.0 NVMe M.2 Internal SSD',
        brand: 'Samsung',
        model: '980 PRO NVMe 1TB',
        condition: Condition.LIKE_NEW,
        ageMonths: 6,
        price: 6400.00,
        area: 'South Delhi',
        description: '100% health in Samsung Magician and CrystalDiskInfo. Very low TBW write cycles. Delivers up to 7,000 MB/s read speeds.',
        status: ListingStatus.ACTIVE,
        isInspected: true,
        specs: {
          storageType: 'NVMe M.2 2280',
          capacityGb: 1000,
          healthPercentage: 100,
          readSpeedMb: 7000
        },
        images: {
          create: [{ url: '/images/ssd.jpg', position: 0 }]
        }
      }
    });
  }

  if (monitorCat) {
    await prisma.listingImage.deleteMany({ where: { listingId: 'sample-listing-monitor-1' } });
    await prisma.listing.upsert({
      where: { id: 'sample-listing-monitor-1' },
      update: {
        images: {
          create: [{ url: '/images/monitor.webp', position: 0 }]
        }
      },
      create: {
        id: 'sample-listing-monitor-1',
        sellerId: seller.id,
        categoryId: monitorCat.id,
        title: 'UltraGear 27-inch 144Hz 1ms IPS Gaming Monitor',
        brand: 'LG',
        model: '27GL850-B',
        condition: Condition.GOOD,
        ageMonths: 16,
        price: 17500.00,
        area: 'South Delhi',
        description: 'Zero dead pixels, excellent IPS color uniformity and fast 144Hz refresh rate with G-Sync compatibility. Original stand, power adapter and DisplayPort cable.',
        status: ListingStatus.ACTIVE,
        isInspected: true,
        specs: {
          screenSizeInches: 27,
          resolution: '2560x1440 (2K QHD)',
          refreshRateHz: 144,
          panelType: 'Nano-IPS'
        },
        images: {
          create: [{ url: '/images/monitor.webp', position: 0 }]
        }
      }
    });
  }

  if (controllerCat) {
    await prisma.listingImage.deleteMany({ where: { listingId: 'sample-listing-controller-1' } });
    await prisma.listing.upsert({
      where: { id: 'sample-listing-controller-1' },
      update: {
        images: {
          create: [{ url: '/images/controller.jpg', position: 0 }]
        }
      },
      create: {
        id: 'sample-listing-controller-1',
        sellerId: seller.id,
        categoryId: controllerCat.id,
        title: 'Microsoft Xbox Wireless Controller (Carbon Black)',
        brand: 'Microsoft',
        model: 'Xbox Series Wireless Gamepad',
        condition: Condition.LIKE_NEW,
        ageMonths: 4,
        price: 3600.00,
        area: 'South Delhi',
        description: 'Like new condition, buttons and triggers tactile and responsive. Tested with Gamepad Tester with 0% stick drift. Connects seamlessly via Bluetooth or USB-C.',
        status: ListingStatus.ACTIVE,
        isInspected: true,
        specs: {
          connectivity: 'Bluetooth & USB-C',
          compatibility: 'PC, Xbox Series X/S, Android, iOS',
          analogDriftTested: true
        },
        images: {
          create: [{ url: '/images/controller.jpg', position: 0 }]
        }
      }
    });
  }

  if (joystickCat) {
    await prisma.listingImage.deleteMany({ where: { listingId: 'sample-listing-joystick-1' } });
    await prisma.listing.upsert({
      where: { id: 'sample-listing-joystick-1' },
      update: {
        images: {
          create: [{ url: '/images/joystick.jpg', position: 0 }]
        }
      },
      create: {
        id: 'sample-listing-joystick-1',
        sellerId: seller.id,
        categoryId: joystickCat.id,
        title: 'Logitech G X52 Pro Flight Control System HOTAS Joystick & Throttle',
        brand: 'Logitech G',
        model: 'X52 Professional HOTAS',
        condition: Condition.GOOD,
        ageMonths: 12,
        price: 9200.00,
        area: 'South Delhi',
        description: 'Dual-spring centering mechanism, illuminated multi-function LCD display on throttle, dual-detent progressive throttle. Excellent for MSFS and space simulators.',
        status: ListingStatus.ACTIVE,
        isInspected: true,
        specs: {
          axesCount: 7,
          throttleIncluded: true,
          connectionType: 'USB 2.0'
        },
        images: {
          create: [{ url: '/images/joystick.jpg', position: 0 }]
        }
      }
    });
  }

  console.log('✅ Seeded real verified listings for all 7 hardware categories with local images!');
  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
