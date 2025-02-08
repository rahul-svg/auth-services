const mongoose = require("mongoose");
require("dotenv").config();

const mongoURI = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      dbName: dbName,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
    });
    console.log("✅ MongoDB Connected Successfully.");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    setTimeout(connectDB, 5000);
  }
};

// Event listeners for connection stability
mongoose.connection.on("connected", () => {
  console.log("✅ Mongoose connected to the database.");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ Mongoose connection error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.log("⚠️ Mongoose connection is disconnected. Reconnecting...");
  connectDB(); // Auto-reconnect
});

// Handle process termination
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("⚠️ Mongoose connection closed due to app termination.");
  process.exit(0);
});

// Call the function to connect to the database
connectDB();

module.exports = mongoose;
