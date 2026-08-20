const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { sequelize, User, Product, Transaction, TransactionItem } = require('./models');
const { authenticateToken, authorizeRoles } = require('./authMiddleware');

require('dotenv').config();

const PORT = process.env.PORT;
if (!PORT) {
  throw new Error('PORT environment variable is required');
}
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
const JWT_SECRET = process.env.JWT_SECRET;
const app = express();

// Express configuration
app.use(cors());
app.use(express.json());

// Set up public folder for static files and uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// Register route (Admin only can register or manage users, but let's allow seed registration or initial Admin signup if no users)
app.post('/api/auth/register', authenticateToken, authorizeRoles('Admin'), async (req, res, next) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, password: hashedPassword, role });
    res.status(201).json({
      message: 'User registered successfully',
      user: { id: newUser.id, username: newUser.username, role: newUser.role, isActive: newUser.isActive }
    });
  } catch (error) {
    next(error);
  }
});

// Login Route
app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    const user = await User.findOne({ where: { username } });
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid credentials or inactive account' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, role: user.role }
    });
  } catch (error) {
    next(error);
  }
});

// Get profile
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  res.json({ user: req.user });
});

// ==========================================
// USER MANAGEMENT ROUTES (Admin only)
// ==========================================
app.get('/api/users', authenticateToken, authorizeRoles('Admin'), async (req, res, next) => {
  try {
    const users = await User.findAll({ attributes: ['id', 'username', 'role', 'isActive'] });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

app.put('/api/users/:id', authenticateToken, authorizeRoles('Admin'), async (req, res, next) => {
  try {
    const { role, isActive, password } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    res.json({ message: 'User updated successfully', user: { id: user.id, username: user.username, role: user.role, isActive: user.isActive } });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// INVENTORY / PRODUCT ROUTES
// ==========================================

// Get low stock products (Admin and Inventory Manager)
app.get('/api/products/low-stock', authenticateToken, authorizeRoles('Admin', 'Inventory Manager'), async (req, res, next) => {
  try {
    const products = await Product.findAll();
    const lowStock = products.filter(p => p.quantity <= p.reorderThreshold);
    res.json(lowStock);
  } catch (error) {
    next(error);
  }
});

// Get single product by SKU
app.get('/api/products/sku/:sku', authenticateToken, async (req, res, next) => {
  try {
    const product = await Product.findOne({ where: { sku: req.params.sku } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found with this SKU' });
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
});

// Get all products (with search/filter by name, SKU, category)
app.get('/api/products', authenticateToken, async (req, res, next) => {
  try {
    const { search, category } = req.query;
    let whereClause = {};

    if (category) {
      whereClause.category = category;
    }

    const allProducts = await Product.findAll({ where: whereClause });
    let filtered = allProducts;

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = allProducts.filter(p => 
        p.name.toLowerCase().includes(searchLower) || 
        p.sku.toLowerCase().includes(searchLower)
      );
    }

    res.json(filtered);
  } catch (error) {
    next(error);
  }
});

// Create product (Admin and Inventory Manager)
app.post('/api/products', authenticateToken, authorizeRoles('Admin', 'Inventory Manager'), upload.single('image'), async (req, res, next) => {
  try {
    const {
      sku, name, category, price, quantity, reorderThreshold, description,
      handlingNote, isFragile, expiryDate, storageTemp, warrantyPeriod, serialNumber, isHazardous, safetyNote
    } = req.body;

    if (!sku || !name || !category || !price) {
      return res.status(400).json({ message: 'sku, name, category, and price are required' });
    }

    // Check SKU uniqueness
    const existing = await Product.findOne({ where: { sku } });
    if (existing) {
      return res.status(400).json({ message: 'Product with this SKU already exists' });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const newProduct = await Product.create({
      sku,
      name,
      category,
      price: parseFloat(price),
      quantity: parseInt(quantity || 0),
      reorderThreshold: parseInt(reorderThreshold || 5),
      imageUrl,
      description,
      // Category fields
      handlingNote,
      isFragile: isFragile === 'true' || isFragile === true,
      expiryDate: expiryDate || null,
      storageTemp,
      warrantyPeriod: warrantyPeriod ? parseInt(warrantyPeriod) : null,
      serialNumber,
      isHazardous: isHazardous === 'true' || isHazardous === true,
      safetyNote
    });

    res.status(201).json(newProduct);
  } catch (error) {
    next(error);
  }
});

// Update product (Admin and Inventory Manager)
app.put('/api/products/:id', authenticateToken, authorizeRoles('Admin', 'Inventory Manager'), upload.single('image'), async (req, res, next) => {
  try {
    const {
      sku, name, category, price, quantity, reorderThreshold, description,
      handlingNote, isFragile, expiryDate, storageTemp, warrantyPeriod, serialNumber, isHazardous, safetyNote
    } = req.body;

    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (sku && sku !== product.sku) {
      const existing = await Product.findOne({ where: { sku } });
      if (existing) {
        return res.status(400).json({ message: 'Product with this SKU already exists' });
      }
      product.sku = sku;
    }

    if (name) product.name = name;
    if (category) product.category = category;
    if (price) product.price = parseFloat(price);
    if (quantity !== undefined) product.quantity = parseInt(quantity);
    if (reorderThreshold !== undefined) product.reorderThreshold = parseInt(reorderThreshold);
    if (description !== undefined) product.description = description;

    // Category specific
    if (handlingNote !== undefined) product.handlingNote = handlingNote;
    if (isFragile !== undefined) product.isFragile = isFragile === 'true' || isFragile === true;
    if (expiryDate !== undefined) product.expiryDate = expiryDate || null;
    if (storageTemp !== undefined) product.storageTemp = storageTemp;
    if (warrantyPeriod !== undefined) product.warrantyPeriod = warrantyPeriod ? parseInt(warrantyPeriod) : null;
    if (serialNumber !== undefined) product.serialNumber = serialNumber;
    if (isHazardous !== undefined) product.isHazardous = isHazardous === 'true' || isHazardous === true;
    if (safetyNote !== undefined) product.safetyNote = safetyNote;

    if (req.file) {
      product.imageUrl = `/uploads/${req.file.filename}`;
    }

    await product.save();
    res.json(product);
  } catch (error) {
    next(error);
  }
});

// Delete product (Admin and Inventory Manager)
app.delete('/api/products/:id', authenticateToken, authorizeRoles('Admin', 'Inventory Manager'), async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    await product.destroy();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
});


// ==========================================
// BILLING / TRANSACTION ROUTES
// ==========================================

// Create checkout Transaction
app.post('/api/transactions/checkout', authenticateToken, async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { items } = req.body; // Array of { productId, quantity }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No items in cart' });
    }

    let subtotal = 0;
    const itemsToCreate = [];

    // Validate stock and build line items
    for (const cartItem of items) {
      const product = await Product.findByPk(cartItem.productId, { transaction: t });
      if (!product) {
        await t.rollback();
        return res.status(404).json({ message: `Product with ID ${cartItem.productId} not found` });
      }

      if (product.quantity < cartItem.quantity) {
        await t.rollback();
        return res.status(400).json({ message: `Insufficient stock for product: ${product.name}. Available: ${product.quantity}` });
      }

      // Decrement stock
      product.quantity -= cartItem.quantity;
      await product.save({ transaction: t });

      const itemSubtotal = parseFloat(product.price) * cartItem.quantity;
      subtotal += itemSubtotal;

      itemsToCreate.push({
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        quantity: cartItem.quantity,
        price: parseFloat(product.price),
        subtotal: itemSubtotal
      });
    }

    const flatTaxRate = 0.08; // 8% flat tax rate
    const tax = subtotal * flatTaxRate;
    const total = subtotal + tax;

    // Create Transaction
    const transaction = await Transaction.create({
      cashierId: req.user.id,
      cashierName: req.user.username,
      subtotal,
      tax,
      total
    }, { transaction: t });

    // Create Transaction Items
    for (const item of itemsToCreate) {
      await TransactionItem.create({
        ...item,
        transactionId: transaction.id
      }, { transaction: t });
    }

    await t.commit();

    // Fetch full transaction with items to return
    const completeTransaction = await Transaction.findByPk(transaction.id, {
      include: [{ model: TransactionItem, as: 'items' }]
    });

    res.status(201).json(completeTransaction);
  } catch (error) {
    await t.rollback();
    next(error);
  }
});

// Get transactions (Cashier gets only theirs, Admin gets all, Inventory Manager gets read-only all for planning)
app.get('/api/transactions', authenticateToken, async (req, res, next) => {
  try {
    let transactions;
    if (req.user.role === 'Cashier') {
      transactions = await Transaction.findAll({
        where: { cashierId: req.user.id },
        include: [{ model: TransactionItem, as: 'items' }],
        order: [['createdAt', 'DESC']]
      });
    } else {
      transactions = await Transaction.findAll({
        include: [{ model: TransactionItem, as: 'items' }],
        order: [['createdAt', 'DESC']]
      });
    }
    res.json(transactions);
  } catch (error) {
    next(error);
  }
});

// Get single transaction details
app.get('/api/transactions/:id', authenticateToken, async (req, res, next) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id, {
      include: [{ model: TransactionItem, as: 'items' }]
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (req.user.role === 'Cashier' && transaction.cashierId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied: unauthorized view' });
    }

    res.json(transaction);
  } catch (error) {
    next(error);
  }
});

// ==========================================
// ANALYTICS / STATS
// ==========================================
app.get('/api/analytics', authenticateToken, authorizeRoles('Admin', 'Inventory Manager'), async (req, res, next) => {
  try {
    const transactions = await Transaction.findAll({
      include: [{ model: TransactionItem, as: 'items' }]
    });

    const totalSalesAllTime = transactions.reduce((sum, t) => sum + parseFloat(t.total), 0);
    
    // Today's Sales
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySales = transactions
      .filter(t => new Date(t.createdAt) >= today)
      .reduce((sum, t) => sum + parseFloat(t.total), 0);

    // Top selling items count calculation
    const itemSales = {};
    for (const t of transactions) {
      for (const item of t.items) {
        if (!itemSales[item.productName]) {
          itemSales[item.productName] = { sku: item.productSku, quantity: 0, sales: 0 };
        }
        itemSales[item.productName].quantity += item.quantity;
        itemSales[item.productName].sales += parseFloat(item.subtotal);
      }
    }

    const topSelling = Object.keys(itemSales).map(name => ({
      name,
      sku: itemSales[name].sku,
      quantity: itemSales[name].quantity,
      sales: itemSales[name].sales
    })).sort((a, b) => b.quantity - a.quantity).slice(0, 5);

    // Products low stock count
    const products = await Product.findAll();
    const lowStockCount = products.filter(p => p.quantity <= p.reorderThreshold).length;

    res.json({
      totalSalesAllTime,
      todaySales,
      totalTransactions: transactions.length,
      topSelling,
      lowStockCount
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// ERROR HANDLING MIDDLEWARE
// ==========================================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || 'An internal server error occurred'
  });
});

// Sync and Start Server
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to sync DB:', err);
});
