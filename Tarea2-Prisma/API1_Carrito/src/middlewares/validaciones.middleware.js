export const validarCampos = (req, res, next) => {
  if (!req.body.nombre || !req.body.precio || !req.body.cantidad) {
    return res.status(400).json({
      error: "El nombre, precio y cantidad son campos requeridos"
    });
  }
  if(req.body.cantidad <= 0 && req.body.precio <= 0){
    return res.status(400).json({
      error: "La cantidad y el precio deben ser numeros validos"
    });
  }
  
  next();
}

export const validarPorcentaje = (req, res, next) => {
  if(req.body.porcentaje !== undefined){
    if(typeof req.body.porcentaje !== "number" ){
      return res.status(400).json({
        error: "El porcentaje debe ser un numero valido"
      });
    }
    if(req.body.porcentaje < 0 || req.body.porcentaje > 50){
      return res.status(400).json({
        error: "El porcentaje debe ser un numero entre 0 y 50"
      });
    }
  }
  next();
}

export const validarCantidad = (req, res, next) => {
  if(req.body.cantidad === undefined){
    return res.status(400).json({
      error: "El campo cantidad es requerido"
    })
  }
  if(req.body.cantidad <= 0 ){
    return res.status(400).json({
      error: "La cantidad debe ser un numero valido"
    });
  }
  next();
}