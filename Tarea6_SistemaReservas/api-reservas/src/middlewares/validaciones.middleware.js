export const validarCamposRegistro = async (req,res,next) => {
    if (!req.body.nombre || !req.body.email || !req.body.password) {
        return res.status(400).json({
            error: "Los campos nombre, email y password son requeridos"
        });
    }
    next();
}

export const validarCamposLogin = async (req,res,next) => {
    if (!req.body.email || !req.body.password) {
        return res.status(400).json({
            error: "Los campos email y password son requeridos"
        });
    }
    next();
}

export const validarCamposServicio = async (req,res,next) => {
    if (!req.body.nombre || !req.body.descripcion || !req.body.duracion || !req.body.precio) {
        return res.status(400).json({
            error: "Los campos titulo, descripcion, duracion(minutos) y precio son requeridos"
        });
    }
    next();
}

export const validarCamposReserva = async (req,res,next) => {
    const { fecha, hora, servicioId } = req.body;
    
    if (
        typeof fecha !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(fecha) ||
        Number.isNaN(Date.parse(`${fecha}T00:00:00.000Z`)) ||
        typeof hora !== "string" ||
        !/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(hora) ||
        !Number.isInteger(servicioId) ||
        servicioId <= 0
    ) {
        return res.status(400).json({
            error: "fecha (YYYY-MM-DD), hora(HH:MM:SS) y servicioId son obligatorios y deben tener un formato válido"
        });
    }
    next();
}