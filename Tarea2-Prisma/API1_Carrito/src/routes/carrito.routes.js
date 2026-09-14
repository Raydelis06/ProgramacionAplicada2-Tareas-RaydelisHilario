import { Router } from "express";
import {
    obtenerTotalCarrito,
    aplicarDescuento
} from "../controllers/carrito.controller.js";
import { validarPorcentaje } from "../middlewares/validaciones.middleware.js";

const router = Router();

// Definición de rutas asociadas a /carrito
router.post("/aplicar-descuento", validarPorcentaje, aplicarDescuento);
router.get("/total", obtenerTotalCarrito);

export default router;