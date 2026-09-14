export const validarCampos = (req, res, next) => {
  if (!req.body.producto || req.body.stock === undefined) {
    return res.status(400).json({
      error: "El producto y el stock son campos requeridos"
    });
  }
  if (req.body.stockMinimo !== undefined) { 
    if (parseInt(req.body.stockMinimo) < 0) { 
      return res.status(400).json({ error: "El stock minimo no puede ser un numero negativo" }); 
    } 
  } 
  if (req.body.cantidad !== undefined) { 
    if (parseInt(req.body.cantidad) < 0) { 
      return res.status(400).json({ error: "La cantidad no puede ser un numero negativo" }); 
    } 
  }
  next();
}