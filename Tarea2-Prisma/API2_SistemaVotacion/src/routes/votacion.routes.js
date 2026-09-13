import { Router } from "express";
import {
    crearEncuesta,
    obtenerEncuestas,
    votar,
    obtenerResultadosEncuesta,
    eliminarEncuesta
} from "../controllers/votacion.controller.js";
import { validarCampos } from "../middlewares/validaciones.middleware.js";

const router = Router();

// Definición de rutas asociadas a /encuestas
router.post("/", validarCampos, crearEncuesta);
router.get("/", obtenerEncuestas);
router.post("/:id/votar", validarCampos, votar);
router.get("/:id/resultados", obtenerResultadosEncuesta);
router.delete("/:id", eliminarEncuesta);

export default router;