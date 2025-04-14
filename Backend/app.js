import express from 'express'
import cors from 'cors'
import MongoSingleton from './src/config/mongoDB-singleton.js'
import productRouter from './src/routes/productRoute.js'
import configRouter from './src/routes/configRoute.js'
import corsOptions from './src/utils/cors.js'

const app = express()
const SERVER_PORT = process.env.PORT || 8080

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors(corsOptions))

app.use('/api/products', productRouter)
app.use('/api/config', configRouter)
app.use((req, res) => {
    res.status(404).send('Ruta no encontrada');
});

app.use((err, req, res, next) => {
    console.error("Error capturado:", err);
    res.status(500).json({
        message: 'Error interno del servidor',
        error: err.message,
        stack: err.stack
    });
});

const httpServer = app.listen(SERVER_PORT,()=>{
    console.log("server run on port:",SERVER_PORT);
} )

const connectMongoDB = async () =>{
    try {
        MongoSingleton.getInstance()
    } catch (error) {
        console.error(error);
    }
    }
    
    connectMongoDB()
    