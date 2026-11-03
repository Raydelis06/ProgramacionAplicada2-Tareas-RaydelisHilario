import { Router } from "express";
import {
    actualizarPerfil 
} from "../controllers/usuarios.controller.js"
import {
    validarPerfil
} from "../middlewares/validaciones.middleware.js"
import {
    verificarToken
} from "../middlewares/auth.middleware.js"

const router = Router()

//rutas para /usuarios
router.put('/perfil', verificarToken, validarPerfil, actualizarPerfil)
router.get("/:id", verificarToken, obtenerUsuario);

export default router