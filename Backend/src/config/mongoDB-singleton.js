import mongoose from "mongoose";
import Config from "./config.js";

export default class MongoDBSingleton {
  static #instance;

  constructor() {
    this.#connectMongoDB();
  }

  static getInstance() {
    if (this.#instance) {
      console.log("Instance already exists");
    } else {
      this.#instance = new MongoDBSingleton();
    }
    return this.#instance;
  }

  #connectMongoDB = async () => {
    try {
      mongoose.connect(Config.mongoUri);
      console.log("MongoDB connected");
    } catch (error) {
      console.error("Error connecting to MongoDB", error);
      process.exit();
    }
  };
}
