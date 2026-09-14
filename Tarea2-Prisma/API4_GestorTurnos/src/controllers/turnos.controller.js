import { prisma } from "../db.js";

// POST /turnos - Crear un nuevo turno
export const crearTurno = async (req, res) => {
	try {
		const { cliente, servicio } = req.body;

		const turno = await prisma.turno.create({
			data: {
				cliente,
				servicio,
				estado: "esperando"
			}
		});

		res.status(201).json({ Mensaje: "Turno creado correctamente!", Turno: turno });
	} catch (error) {
		console.error("Error al crear el turno:", error);
		res.status(500).json({ error: "Error interno del servidor al crear turno" });
	}
};

// GET /turnos - Obtener todos los turnos
export const obtenerTurnos = async (req, res) => {
	try {
		const turnos = await prisma.turno.findMany({});

		res.status(200).json({ Turnos: turnos });
	} catch (error) {
		console.error("Error al obtener los turnos:", error);
		res.status(500).json({ error: "Error interno del servidor al consultar los turnos" });
	}
};

// GET /turnos/siguiente - Obtener el primer turno en espera
export const obtenerTurnoSiguiente = async (req, res) => {
	try {
		const turnoSiguiente = await prisma.turno.findFirst({
			where: { estado: "esperando" },
			orderBy: { id: "asc" }
		});

		if (!turnoSiguiente) {
			return res.status(400).json({ Mensaje: "No hay turnos en espera" });
		}

		res.status(200).json({ Turno: turnoSiguiente });
	} catch (error) {
		console.error("Error al obtener el siguiente turno:", error);
		res.status(500).json({ error: "Error interno del servidor al consultar el siguiente turno" });
	}
};

// PUT /turnos/llamar - Pasar el primer turno en espera a atención
export const llamarSiguiente = async (req, res) => {
	try {
		const turnoEnAtencion = await prisma.turno.findFirst({
			where: { estado: "atendiendo" },
			orderBy: { id: "asc" }
		});

		if (turnoEnAtencion) {
			return res.status(400).json({
				Mensaje: "Finalice el turno actual antes de llamar otro cliente",
				Turno: turnoEnAtencion
			});
		}

		const turnoSiguiente = await prisma.turno.findFirst({
			where: { estado: "esperando" },
			orderBy: { id: "asc" }
		});

		if (!turnoSiguiente) {
			return res.status(400).json({ Mensaje: "No hay turnos en espera" });
		}

		const turnoLlamado = await prisma.turno.update({
			where: { id: turnoSiguiente.id },
			data: { estado: "atendiendo" }
		});

		const siguienteEnCola = await prisma.turno.findFirst({
			where: { estado: "esperando" },
			orderBy: { id: "asc" }
		});

		res.status(200).json({
			Turno: turnoLlamado,
			Siguiente: siguienteEnCola || "No hay más turnos en espera"
		});
	} catch (error) {
		console.error("Error al llamar el siguiente turno:", error);
		res.status(500).json({ error: "Error interno del servidor al llamar el siguiente turno" });
	}
};

// PUT /turnos/:id/finalizar - Marcar un turno en atención como finalizado
export const finalizarTurno = async (req, res) => {
	try {
		const id = parseInt(req.params.id);
		if (isNaN(id)) {
			return res.status(400).json({ error: "El parámetro ID debe ser un número entero válido" });
		}

		const turno = await prisma.turno.findUnique({ where: { id } });
		if (!turno) {
			return res.status(404).json({ error: "Turno no encontrado" });
		}
		if (turno.estado !== "atendiendo") {
			return res.status(400).json({
				error: 'El turno no está en estado "atendiendo", no se puede finalizar'
			});
		}

		const turnoFinalizado = await prisma.turno.update({
			where: { id },
			data: { estado: "finalizado" }
		});

		res.status(200).json({ Mensaje: "Turno finalizado correctamente!", Turno: turnoFinalizado });
	} catch (error) {
		console.error("Error al finalizar el turno:", error);
		res.status(500).json({ error: "Error interno del servidor al finalizar turno" });
	}
};

// GET /turnos/espera - Obtener los turnos que siguen esperando
export const obtenerTurnosEnEspera = async (req, res) => {
	try {
		const turnosEnEspera = await prisma.turno.findMany({
			where: { estado: "esperando" },
			orderBy: { id: "asc" }
		});

		res.status(200).json({
			Mensaje: `Hay ${turnosEnEspera.length} turnos en espera`,
			turnos: turnosEnEspera
		});
	} catch (error) {
		console.error("Error al obtener los turnos en espera:", error);
		res.status(500).json({ error: "Error interno del servidor al consultar los turnos en espera" });
	}
};
