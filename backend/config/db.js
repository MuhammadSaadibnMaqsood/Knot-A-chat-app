import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, { autoIndex: true });
    console.log("mongo connected...");
  } catch (error) {
    console.log("ERROR IN DB CONNECTION: ", error);
    process.exit(1);
  }
};
