import { Router } from "express";
import {
    crearTurno,
    obtenerTurnos,
    obtenerTurnoSiguiente,
    llamarSiguiente,
    finalizarTurno,
    obtenerTurnosEnEspera
} from "../controllers/turnos.controller.js";
import { validarCampos } from "../middlewares/validaciones.middleware.js";

const router = Router();

// Definición de rutas asociadas a /turnos
router.post("/", validarCampos, crearTurno);
router.get("/", obtenerTurnos);
router.get("/siguiente", obtenerTurnoSiguiente);
router.put("/llamar", llamarSiguiente);
router.put("/:id/finalizar", finalizarTurno);
router.get("/espera", obtenerTurnosEnEspera);

export default router;