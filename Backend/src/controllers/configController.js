
import configModel from "../services/models/configModel.js";
import productModel from "../services/models/productModel.js";

export async function updateExchangeRate(req, res) {
    const { exchangeRate } = req.body;

    if (!exchangeRate) {
        return res.status(400).json({ message: "Exchange rate is required" });
    }

    try {
        const config = await configModel.findOneAndUpdate({}, { exchangeRate }, { new: true, upsert: true });

        await productModel.updateMany({}, [
            {
                $set: {
                    priceARS: { $multiply: ["$priceUSD", exchangeRate] }
                }
            }
        ]);

        res.status(200).json({ message: "Exchange rate updated and products updated", config });
    } catch (error) {
        res.status(500).json({ message: "Error updating exchange rate", error: error.message });
    }
}


export async function getExchangeRate(req, res) {
    try {
        const config = await configModel.findOne();
        if (!config) {
            return res.status(404).json({ message: "Configuration not found" });
        }
        res.status(200).json({ exchangeRate: config.exchangeRate });

    } catch (error) {
        res.status(500).json({ message: "Error fetching exchange rate", error: error.message });
    }

}