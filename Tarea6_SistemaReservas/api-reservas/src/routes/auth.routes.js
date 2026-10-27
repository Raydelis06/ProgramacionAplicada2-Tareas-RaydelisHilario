import { Router } from "express";
import {
    registro,
    login
} from "../controllers/auth.controller.js"
import {
    validarCamposRegistro, 
    validarCamposLogin
} from "../middlewares/validaciones.middleware.js"

const router = Router()

//rutas para /auth
router.post('/registro', validarCamposRegistro, registro)
router.post('/login', validarCamposLogin, login)

export default router