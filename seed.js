require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Product = require("./models/Product");

const products = [
  {
    name: "Wireless Headphones",
    description:
      "Comfortable Bluetooth headphones with clear sound.",
    price: 1499,
    category: "Electronics",
    stock: 20,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"
  },

  {
    name: "Smart Watch",
    description:
      "Fitness tracking smartwatch with heart-rate monitoring.",
    price: 2499,
    category: "Electronics",
    stock: 15,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"
  },

  {
    name: "Running Shoes",
    description:
      "Lightweight shoes for everyday running and walking.",
    price: 1999,
    category: "Fashion",
    stock: 25,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"
  },

  {
    name: "Laptop Backpack",
    description:
      "Water-resistant backpack with laptop compartment.",
    price: 999,
    category: "Accessories",
    stock: 30,
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80"
  }
];


async function seed() {

  await mongoose.connect(
    process.env.MONGODB_URI
  );


  const adminPassword =
    await bcrypt.hash(
      "admin123",
      10
    );


  await User.findOneAndUpdate(

    {
      email:
        "admin@example.com"
    },

    {
      name: "Admin",
      email:
        "admin@example.com",
      password:
        adminPassword,
      role: "admin"
    },

    {
      upsert: true,
      new: true
    }
  );


  const userPassword =
    await bcrypt.hash(
      "user123",
      10
    );


  await User.findOneAndUpdate(

    {
      email:
        "user@example.com"
    },

    {
      name: "Demo User",
      email:
        "user@example.com",
      password:
        userPassword,
      role: "user"
    },

    {
      upsert: true,
      new: true
    }
  );


  await Product.deleteMany({});

  await Product.insertMany(
    products
  );


  console.log(
    "Seed completed successfully."
  );

  console.log(
    "Admin: admin@example.com / admin123"
  );

  console.log(
    "User: user@example.com / user123"
  );


  await mongoose.disconnect();
}


seed()
  .catch(error => {

    console.error(error);

    process.exit(1);

  });
