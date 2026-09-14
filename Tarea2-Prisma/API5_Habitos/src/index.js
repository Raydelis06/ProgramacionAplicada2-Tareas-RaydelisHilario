import "dotenv/config";
import express from "express";
import { loggerMiddleware } from "./middlewares/logger.middleware.js";
import votacionRoutes from "./routes/votacion.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(express.json());
app.use(loggerMiddleware);

// Rutas modulares
app.use("/encuestas", votacionRoutes);

// Ruta base informativa
app.get("/", (req, res) => {
    res.json({
        mensaje: "API RESTful de Sistema de votacion con Express 5 y Prisma 7",
        estado: "En línea",
        documentacion: {
            "POST /encuestas": "Crea una nueva encuesta con opciones",
            "GET /encuestas": "Lista todas las encuestas",
            "POST /encuestas/:id/votar": "Registra un voto para la encuesta existente",
            "GET /encuestas/:id/resultados": "Devuelve los votos por opcion y el ganador",
            "DELETE /encuestas/:id": "Elimina una encuesta",
            
        }
    });
});

app.listen(PORT, () => {
    console.log(`Servidor en el puerto ${PORT}`);
});