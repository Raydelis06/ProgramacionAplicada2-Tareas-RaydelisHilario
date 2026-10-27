import { Router } from "express";
import {
    obtenerTodasLasReservas,
    obtenerMisReservas,
    crearReserva,
    cambiarEstadoReserva,
    cancelarMiReserva,
} from "../controllers/reservas.controller.js"
import {
    validarCamposReserva
} from "../middlewares/validaciones.middleware.js"
import {soloAdmin, verificarToken} from "../middlewares/auth.middleware.js"

const router = Router()

//rutas para /reservas

//acceso: admin
router.get('/', verificarToken, soloAdmin, obtenerTodasLasReservas)
//acceso: admin
router.put('/:id/estado', verificarToken, soloAdmin, cambiarEstadoReserva)

//acceso: cualquier usuario autenticado 
router.get('/mis-reservas', verificarToken, obtenerMisReservas)
//acceso: cualquier usuario autenticado
router.post('/', verificarToken, validarCamposReserva, crearReserva)
//acceso: cualquier usuario autenticado
router.delete('/:id', verificarToken, cancelarMiReserva)

export default router