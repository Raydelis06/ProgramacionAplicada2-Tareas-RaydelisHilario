import { Router } from "express";
import {
    obtenerInventario,
    crearProducto,
    registrarEntrada,
    registrarSalida,
    obtenerAlertas
} from "../controllers/inventario.controller.js";
import { validarCampos } from "../middlewares/validaciones.middleware.js";

const router = Router();

// Definición de rutas asociadas a /inventario
router.post("/", validarCampos, crearProducto);
router.get("/", obtenerInventario);
router.post("/:id/entrada", registrarEntrada);
router.post("/:id/salida", registrarSalida);
router.get("/alertas", obtenerAlertas);

export default router;