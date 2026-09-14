import "dotenv/config";
import express from "express";
import { loggerMiddleware } from "./middlewares/logger.middleware.js";
import habitosRoutes from "./routes/habitos.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(express.json());
app.use(loggerMiddleware);

// Rutas modulares
app.use("/habitos", habitosRoutes);

// Ruta base informativa
app.get("/", (req, res) => {
    res.json({
        mensaje: "API RESTful de Sistema de registro de habitos con Express 5 y Prisma 7",
        estado: "En línea",
        documentacion: {
            "POST	/habitos":	"Crear hábito con meta diaria",
            "GET	/habitos":	"Listar hábitos",
            "POST	/habitos/:id/registrar":	"Marcar hábito del día como completado",
            "GET	/habitos/:id/estadisticas":	"Racha actual, mejor racha, % cumplimiento",
            "DELETE	/habitos/:id":	"Eliminar hábito"
        }
    });
});

app.listen(PORT, () => {
    console.log(`Servidor en el puerto ${PORT}`);
});