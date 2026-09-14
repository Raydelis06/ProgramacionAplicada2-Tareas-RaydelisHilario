import "dotenv/config";
import express from "express";
import { loggerMiddleware } from "./middlewares/logger.middleware.js";
import inventarioRoutes from "./routes/inventario.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(express.json());
app.use(loggerMiddleware);

// Rutas modulares
app.use("/inventario", inventarioRoutes);

// Ruta base informativa
app.get("/", (req, res) => {
    res.json({
        mensaje: "API RESTful de Sistema de gestion de inventario con Express 5 y Prisma 7",
        estado: "En línea",
        documentacion: {
            "POST /inventario": "Crea un nuevo producto con opciones",
            "GET /inventario": "Lista todos los productos en el inventario",
            "POST /inventario/:id/entrada": "Registra una entrada de producto",
            "POST /inventario/:id/salida": "Registra una salida de producto",
            "GET /inventario/alertas": "Devuelve las alertas de stock"
            
        }
    });
});

app.listen(PORT, () => {
    console.log(`Servidor en el puerto ${PORT}`);
});