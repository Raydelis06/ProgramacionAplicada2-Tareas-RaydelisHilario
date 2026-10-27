import { prisma } from "../db.js"

export const obtenerTodasLasReservas = async (req, res) => {
    try {
        const reservas = await prisma.reserva.findMany({
            orderBy: [
                { estado: "asc" },
                { fecha: "desc" },
                { hora: "desc" },
            ],
            include: {
                servicio: true,
                usuario: true
            },
        });

        res.status(200).json(reservas);
    } catch (error) {
        console.error("Error al obtener las reservas: ", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
}
export const obtenerMisReservas = async (req, res) => {
    try {
        const reservas = await prisma.reserva.findMany({
            where: { usuarioId: req.usuario.id },
            orderBy: [
                { estado: "asc" },
                { fecha: "desc" },
                { hora: "desc" },
            ],
            include: {
                servicio: true
            },
        });
        res.status(200).json(reservas);
    } catch (error) {
        console.error("Error al obtener mis reservas: ", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
}
export const crearReserva = async (req, res) => {
    try {
        const { fecha, hora, servicioId } = req.body || {};

        const fechaReserva = new Date(`${fecha}T00:00:00.000Z`);
        if (fechaReserva.toISOString().slice(0, 10) !== fecha) {
            return res.status(400).json({
                error: "fecha, hora y servicioId son obligatorios y deben tener un formato válido"
            });
        }

        const servicio = await prisma.servicio.findUnique({
            where: { id: servicioId }
        });
        if (!servicio) {
            return res.status(404).json({ error: "El servicio no existe" });
        }

        const [hours, minutes, seconds = 0] = hora.split(":").map(Number);
        const reserva = await prisma.reserva.create({
            data: {
                fecha: fechaReserva,
                hora: new Date(Date.UTC(1970, 0, 1, hours, minutes, seconds)),
                usuarioId: req.usuario.id,
                servicioId: servicioId
            }
        });

        return res.status(201).json(reserva);
    } catch (error) {
        console.error("Error al crear una reserva: ", error);
        res.status(500).json({ error: "Error interno del servidor al intentar crear la reserva" });
    }
}
export const cambiarEstadoReserva = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { estado } = req.body;
        const estadosValidos = ["pendiente", "completada", "cancelada"];

        if (isNaN(id) || id <= 0) {
            return res.status(400).json({ error: "El id debe ser un número válido" });
        }
        if (!estadosValidos.includes(estado)) {
            return res.status(400).json({ error: "El estado de la reserva no es válido" });
        }

        const reserva = await prisma.reserva.findUnique({ where: { id } });
        if (!reserva) {
            return res.status(404).json({ error: "La reserva no existe" });
        }

        const reservaActualizada = await prisma.reserva.update({
            where: { id },
            data: { estado }
        });

        return res.status(200).json({
            mensaje: "Estado de la reserva actualizado exitosamente",
            reserva: reservaActualizada
        });
    } catch (error) {
        console.error("Error al cambiar el estado de la reserva: ", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
}
export const cancelarMiReserva = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id) || id <= 0) {
            return res.status(400).json({ error: "El id debe ser un número válido" });
        }

        const reservaActualizada = await prisma.reserva.updateMany({
            where: {
                id: id,
                usuarioId: req.usuario.id
            },
            data: { estado: "cancelada" }
        });

        if (reservaActualizada.count === 0) {
            return res.status(404).json({ 
                error: "No se pudo cancelar: la reserva no existe o no te pertenece" 
            });
        }  
        return res.status(200).json({ mensaje: "Reserva cancelada exitosamente"});
    } catch (error) {
        console.error("Error al cancelar la reserva: ", error);
        res.status(500).json({ error: "Error interno del servidor al cancelar la reserva" });
    }
}