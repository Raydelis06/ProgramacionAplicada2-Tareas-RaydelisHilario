export const validarCampos = (req, res, next) => {
  if (!req.body.pregunta || !req.body.opciones) {
    return res.status(400).json({
      error: "La pregunta y las opciones son campos requeridos"
    });
  }
  next();
}