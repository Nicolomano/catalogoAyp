import mongoose from "mongoose";

const configSchema = new mongoose.Schema({
    exchangeRate: {
        type: Number,
        required: true,
    }, //tipo de cambio de USD a ARS
})

const Config = mongoose.model("Config", configSchema);
export default Config;