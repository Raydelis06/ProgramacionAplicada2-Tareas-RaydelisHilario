export const validarCampos = (req, res, next) => {
  if (!req.body.cliente || !req.body.servicio) {
    return res.status(400).json({
      error: "El cliente y el servicio son campos requeridos"
    });
  }
  next();
}