import User from "./models/userSchema.js";
import bcrypt from "bcryptjs";
const seedAdmin = async () => {
  try {
    // 1. Check if admin already exists
    // const existing = await User.findOne({ where: { email: "user@gmail.com" } });

    // if (existing) {
    //   console.log("Admin already exists");
    //   process.exit();
    // }

    const hash = await bcrypt.hash("teacher123", 10);
    console.log("hash : ", hash);
    bcrypt
      .compare(
        "teacher123",
        "$2b$10$qe2HcSUmy7l44d./ob9RLe3wTVu3GSG5RIYPARBV/iiw5P3cHjYPW"
      )
      .then((result) => console.log("Match:", result));
    // 2. Hash password
    const hashedPassword = await bcrypt.hash("user123", 10);

    // 3. Create admin
    const admin = await User.create({
      username: "user",
      email: "user@gmail.com",
      password: hashedPassword,
      role: "user",
    });

    console.log("Admin created:", admin.dataValues);
    process.exit();
  } catch (error) {
    // console.error("Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
