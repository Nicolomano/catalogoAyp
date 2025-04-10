import dotenv from 'dotenv'
import program from '../process.js'


const environment = program.opts().mode

dotenv.config({
    path: environment ==='production' ? './src/config/.env.production' : './src/config/.env.development'
})

export default {
    port: process.env.SERVER_PORT,
    mongoUrl: process.env.MONGO_URL,
    adminName: process.env.ADMIN_NAME,
    adminPassword: process.env.ADMIN_PASSWORD,
    emailAccount: process.env.GMAIL_ACCOUNT,
    emailPassword: process.env.GMAIL_PASSWORD,
    environment: environment

}