import { Router } from "express";
import {
    agregarProducto,
    obtenerProductos,
    actualizarCantidad,
    eliminarProducto
} from "../controllers/carrito.controller.js";
import { validarCampos, validarCantidad } from "../middlewares/validaciones.middleware.js";

const router = Router();

// Definición de rutas asociadas a /productos
router.post("/", validarCampos, agregarProducto);
router.get("/", obtenerProductos);
router.put("/:id", validarCantidad, actualizarCantidad);
router.delete("/:id", eliminarProducto);



export default router;