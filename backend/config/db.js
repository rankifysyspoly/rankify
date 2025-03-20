const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
    console.log(mongoose.Types.ObjectId.isValid("650af45b8a7f44b123456789"));
    try {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("MongoDB Connected");
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
        process.exit(1);
    }
};

module.exports = connectDB;
