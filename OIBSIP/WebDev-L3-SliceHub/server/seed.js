const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('./models/User');
const InventoryItem = require('./models/InventoryItem');

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/slicehub';

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('[Seed] Connected successfully.');

    // 1. Seed Admin User
    const adminEmail = 'admin@slicehub.test';
    const adminPassword = 'ChangeMe123!';
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        name: 'SliceHub Admin',
        email: adminEmail,
        passwordHash,
        role: 'admin',
        isEmailVerified: true,
      });
      console.log(`[Seed] Created admin account: ${adminEmail} (password: ${adminPassword})`);
    } else {
      existingAdmin.passwordHash = passwordHash;
      existingAdmin.role = 'admin';
      existingAdmin.isEmailVerified = true;
      await existingAdmin.save();
      console.log(`[Seed] Updated existing admin account: ${adminEmail}`);
    }

    // 2. Seed Catalog Inventory Items
    const initialItems = [
      // Bases (5 items)
      { name: 'Classic Thin Crust', category: 'base', price: 150, quantity: 50, threshold: 20 },
      { name: 'Deep Pan Crust', category: 'base', price: 180, quantity: 50, threshold: 20 },
      { name: 'Cheese Stuffed Crust', category: 'base', price: 220, quantity: 40, threshold: 20 },
      { name: 'Whole Wheat Organic Crust', category: 'base', price: 170, quantity: 45, threshold: 20 },
      { name: 'Gluten-Free Artisan Crust', category: 'base', price: 210, quantity: 35, threshold: 15 },

      // Sauces (5 items)
      { name: 'San Marzano Tomato Sauce', category: 'sauce', price: 40, quantity: 60, threshold: 20 },
      { name: 'Smoky Chipotle BBQ Sauce', category: 'sauce', price: 50, quantity: 50, threshold: 20 },
      { name: 'Genovese Basil Pesto', category: 'sauce', price: 60, quantity: 40, threshold: 15 },
      { name: 'Creamy White Garlic Alfredo', category: 'sauce', price: 55, quantity: 45, threshold: 20 },
      { name: 'Spicy Arrabbiata Marinara', category: 'sauce', price: 45, quantity: 55, threshold: 20 },

      // Cheeses (3 items)
      { name: 'Fior di Latte Mozzarella', category: 'cheese', price: 70, quantity: 80, threshold: 25 },
      { name: 'Sharp Cheddar & Gouda Blend', category: 'cheese', price: 85, quantity: 60, threshold: 20 },
      { name: 'Creamy Cashew Vegan Mozzarella', category: 'cheese', price: 95, quantity: 40, threshold: 15 },

      // Vegetables / Toppings (8 items)
      { name: 'Button & Portobello Mushrooms', category: 'vegetable', price: 35, quantity: 60, threshold: 20 },
      { name: 'Crisp Bell Pepper Medley', category: 'vegetable', price: 30, quantity: 70, threshold: 20 },
      { name: 'Charred Red Onions', category: 'vegetable', price: 25, quantity: 80, threshold: 25 },
      { name: 'Kalamata Black Olives', category: 'vegetable', price: 40, quantity: 55, threshold: 20 },
      { name: 'Fire-Pickled Jalapeños', category: 'vegetable', price: 35, quantity: 60, threshold: 20 },
      { name: 'Sweet Golden Corn', category: 'vegetable', price: 30, quantity: 65, threshold: 20 },
      { name: 'Fresh Genovese Basil Leaves', category: 'vegetable', price: 25, quantity: 50, threshold: 15 },
      { name: 'Slow-Roasted Cherry Tomatoes', category: 'vegetable', price: 35, quantity: 55, threshold: 20 },
    ];

    for (const item of initialItems) {
      await InventoryItem.findOneAndUpdate(
        { name: item.name, category: item.category },
        item,
        { upsert: true, new: true }
      );
    }

    console.log(`[Seed] Successfully seeded ${initialItems.length} catalog inventory items.`);
    console.log('[Seed] Database initialization complete! 🚀');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedDatabase();
