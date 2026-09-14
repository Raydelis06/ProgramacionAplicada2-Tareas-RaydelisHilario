import { Router } from "express";
import {
    crearHabito,
    obtenerHabitos,
    registrarHabitoDiario,
    obtenerEstadisticas,
    eliminarHabito
} from "../controllers/habitos.controller.js";
import { validarCampos } from "../middlewares/validaciones.middleware.js";

const router = Router();

// Definición de rutas asociadas a /habitos
router.post("/", validarCampos, crearHabito);
router.get("/", obtenerHabitos);
router.post("/:id/registrar", registrarHabitoDiario);
router.get("/:id/estadisticas", obtenerEstadisticas);
router.delete("/:id", eliminarHabito);

export default router;