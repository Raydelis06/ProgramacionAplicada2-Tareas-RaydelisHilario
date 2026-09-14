import "dotenv/config";
import express from "express";
import { loggerMiddleware } from "./middlewares/logger.middleware.js";
import carritoRoutes from "./routes/carrito.routes.js";
import productosRoutes from "./routes/productos.routes.js";


const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(express.json());
app.use(loggerMiddleware);

// Rutas modulares
app.use("/carrito", carritoRoutes);
app.use("/productos", productosRoutes);

// Ruta base informativa
app.get("/", (req, res) => {
    res.json({
        mensaje: "API RESTful de Sistema de carrito de compras con Express 5 y Prisma 7",
        estado: "En línea",
        documentacion: {
            "GET	/productos": "Listar productos",
            "POST	/productos":	"Agregar producto",
            "PUT	/productos/:id":	"Actualizar cantidad",
            "DELETE	/productos/:id":	"Eliminar producto",
            "GET	/carrito/total":	"Calcular total (precio × cantidad)",
            "POST	/carrito/aplicar-descuento":	"Recibe { porcentaje } y devuelve total con descuento"
            
        }
    });
});

app.listen(PORT, () => {
    console.log(`Servidor en el puerto ${PORT}`);
});