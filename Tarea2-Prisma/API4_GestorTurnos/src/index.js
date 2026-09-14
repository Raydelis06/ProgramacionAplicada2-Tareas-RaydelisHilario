import "dotenv/config";
import express from "express";
import { loggerMiddleware } from "./middlewares/logger.middleware.js";
import turnosRoutes from "./routes/turnos.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(express.json());
app.use(loggerMiddleware);

// Rutas modulares
app.use("/turnos", turnosRoutes);

// Ruta base informativa
app.get("/", (req, res) => {
    res.json({
        mensaje: "API RESTful de Sistema de gestion de turnos con Express 5 y Prisma 7",
        estado: "En línea",
        documentacion: {
            "POST	/turnos":"Crear turno (entra en cola)",
            "GET	/turnos": "Ver todos los turnos",
            "GET	/turnos/siguiente":	"Ver quién es el próximo",
            "PUT	/turnos/llamar": "Llama al siguiente — cambia estado a atendiendo",
            "PUT	/turnos/:id/finalizar":	"Marca turno como finalizado",
            "GET	/turnos/espera": "Cuántos están esperando"
            
        }
    });
});

app.listen(PORT, () => {
    console.log(`Servidor en el puerto ${PORT}`);
});