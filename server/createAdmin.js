const mongoose = require("mongoose");
const readline = require("readline");
require("dotenv").config();
const User = require("./models/User");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (question) =>
  new Promise((resolve) => rl.question(question, resolve));

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB\n");

    const name = await ask("Admin name: ");
    const email = await ask("Admin email: ");
    const password = await ask("Admin password (min 6 chars): ");
    const phone = await ask("Phone (optional, press Enter to skip): ");

    if (!name || !email || !password) {
      console.error("\nName, email, and password are required.");
      process.exit(1);
    }

    if (password.length < 6) {
      console.error("\nPassword must be at least 6 characters.");
      process.exit(1);
    }

    const existing = await User.findOne({ email });
    if (existing) {
      console.error("\nThis email is already registered.");
      process.exit(1);
    }

    const admin = await User.create({
      name: name.trim(),
      email: email.trim(),
      password,
      phone: phone.trim() || undefined,
      role: "admin",
    });

    console.log(`\nAdmin created successfully!`);
    console.log(`  Name:  ${admin.name}`);
    console.log(`  Email: ${admin.email}`);
    console.log(`  Role:  ${admin.role}`);
    console.log(`\nYou can now login at /admin/login`);

    process.exit(0);
  } catch (error) {
    console.error("\nError:", error.message);
    process.exit(1);
  }
};

createAdmin();
