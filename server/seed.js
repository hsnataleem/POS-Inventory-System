require('dotenv').config();

const bcrypt = require('bcryptjs');
const { sequelize, User, Product } = require('./models');

const seedData = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced successfully.');

    // 1. Create Default Users
    const salt = await bcrypt.genSalt(10);
    if (!process.env.ADMIN_PASSWORD || !process.env.MANAGER_PASSWORD || !process.env.CASHIER_PASSWORD) {
      throw new Error('ADMIN_PASSWORD, MANAGER_PASSWORD, and CASHIER_PASSWORD env vars must be set for seeding');
    }
    const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, salt);
    const managerPassword = await bcrypt.hash(process.env.MANAGER_PASSWORD, salt);
    const cashierPassword = await bcrypt.hash(process.env.CASHIER_PASSWORD, salt);

    await User.bulkCreate([
      {
        username: 'admin',
        password: adminPassword,
        role: 'Admin',
        isActive: true
      },
      {
        username: 'manager',
        password: managerPassword,
        role: 'Inventory Manager',
        isActive: true
      },
      {
        username: 'cashier',
        password: cashierPassword,
        role: 'Cashier',
        isActive: true
      }
    ]);
    console.log('Default users seeded successfully.');

    // 2. Create Default Products
    await Product.bulkCreate([
      {
        sku: 'FRAG-001',
        name: 'Crystal Glass Vase',
        category: 'Fragile',
        price: 29.99,
        quantity: 15,
        reorderThreshold: 5,
        description: 'Exquisite crystal glass vase, handle with extreme care.',
        handlingNote: 'Wrap in double bubble wrap and mark box as Fragile.',
        isFragile: true
      },
      {
        sku: 'COLD-002',
        name: 'Organic Milk 1L',
        category: 'Cold',
        price: 3.49,
        quantity: 25,
        reorderThreshold: 8,
        description: 'Fresh organic whole milk.',
        expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days from now
        storageTemp: '4°C'
      },
      {
        sku: 'TECH-003',
        name: 'Wireless Bluetooth Mouse',
        category: 'Tech',
        price: 19.99,
        quantity: 4, // low stock!
        reorderThreshold: 5,
        description: 'Ergonomic 2.4G wireless optical mouse with USB receiver.',
        warrantyPeriod: 12,
        serialNumber: 'SN-TECH-WBM-9981'
      },
      {
        sku: 'CLEAN-004',
        name: 'Super Bleach Spray 500ml',
        category: 'Cleaning',
        price: 5.99,
        quantity: 30,
        reorderThreshold: 10,
        description: 'All purpose cleaning and sanitizing bleach spray.',
        isHazardous: true,
        safetyNote: 'Wear gloves, keep out of reach of children, avoid skin and eye contact.'
      },
      {
        sku: 'GEN-005',
        name: 'A4 Notebook 100 Pages',
        category: 'General',
        price: 2.25,
        quantity: 50,
        reorderThreshold: 15,
        description: 'Standard ruled A4 sized notebook for office and school.'
      }
    ]);
    console.log('Default products seeded successfully.');

    console.log('All seed data inserted successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
