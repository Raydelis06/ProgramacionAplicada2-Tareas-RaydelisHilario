export const validarCampos = (req, res, next) => {
  if (!req.body.nombre || !req.body.meta) {
    return res.status(400).json({
      error: "El nombre y la meta son campos requeridos"
    });
  }
  next();
}