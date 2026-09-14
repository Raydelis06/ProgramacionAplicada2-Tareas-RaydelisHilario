import { prisma } from "../db.js";

const obtenerResultados = (encuesta) => {
    try {

        const ganador = encuesta.opciones.reduce((prev, current) => (prev.votos > current.votos) ? prev : current);
        const totalVotos = encuesta.opciones.reduce((sum, opcion) => sum + opcion.votos, 0);
        if (ganador.votos === 0) {
            return { mensaje: "No hay votos registrados para esta encuesta" };
        }

        return ({
            ganador: ganador.opcion,
            votosGanador: ganador.votos,
            encuesta: encuesta.opciones.map(opcion => ({
                opcion: opcion.opcion,
                votos: opcion.votos,
                porcentaje:
                    ((opcion.votos / totalVotos) * 100).toFixed(2) + "%"
            }))
        });

    } catch (error) {
        return res.status(500).json({
            mensaje: "Error al obtener los resultados"
        });
    }
};

// POST /encuestas - Crear una nueva encuesta
export const crearEncuesta = async (req, res) => {
    try {
        const { pregunta, opciones } = req.body;

        const encuesta = await prisma.encuesta.create({
            data: {
                pregunta,
                opciones: {
                    create: opciones
                }
            },
            include: {
                opciones: true
            }
        });
        res.status(201).json(encuesta);
    } catch (error) {
        console.error("Error al crear la encuesta:", error);
        res.status(500).json({
            error: "Error interno del servidor al consultar las encuestas"
        });
    }
};
// GET /encuestas -> obtener las encuestas creadas
export const obtenerEncuestas = async (req, res) => {
    try {
        const encuestas = await prisma.encuesta.findMany(
            {
                include: {
                    opciones: true
                }
            }
        );
        res.status(200).json(encuestas);
    } catch (error) {
        console.error("Error al obtener las encuestas:", error);
        res.status(500).json({
            error: "Error interno del servidor al consultar las encuestas"
        });
    }
};
// POST /encuestas/:id/votar - Registrar un voto
export const votar = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({
                error: "El parámetro ID debe ser un número entero válido"
            });
        }
        const encuesta = await prisma.encuesta.findUnique({
            where: { id },
            include: {
                opciones: true
            }
        });

        if (!encuesta) {
            return res.status(404).json({
                error: "Encuesta no encontrada"
            });
        }
        
        const { opcion } = req.body;
        const opcionSeleccionada = encuesta.opciones.find(o => o.opcion === opcion);
        if (!opcionSeleccionada) {
            return res.status(400).json({ error: "Opción no válida" });
        }
        await prisma.opcion.update({
            where: {
                id: opcionSeleccionada.id
            },
            data: {
                votos: {
                    increment: 1
                }
            }
        });
        return res.status(200).json({ mensaje: "Voto registrado exitosamente", pregunta: encuesta.pregunta, opcion: opcionSeleccionada.opcion });

    } catch (error) {
        console.error("Error al votar en la encuesta:", error);
        res.status(500).json({
            error: "Error interno del servidor al votar"
        });
    }
};
// GET /encuestas/:id/resultados -> Devuelve los votos por opcion y el ganador
export const obtenerResultadosEncuesta = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                error: "El parámetro ID debe ser un número entero válido"
            });
        }

        const encuesta = await prisma.encuesta.findUnique({
            where: { id },
            include: {
                opciones: true
            }
        });

        if (!encuesta) {
            return res.status(404).json({
                error: "Encuesta no encontrada"
            });
        }

        res.json({ resultados: obtenerResultados(encuesta)});
    } catch (error) {
        console.error("Error al buscar encuesta por ID:", error);
        res.status(500).json({
            error: "Error interno del servidor al buscar la encuesta"
        });
    }
}
// DELETE /encuestas/:id -> Elimina una encuesta
export const eliminarEncuesta = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                error: "El parámetro ID debe ser un número entero válido"
            });
        }

        const encuesta = await prisma.encuesta.findUnique({
            where: { id }
        });

        if (!encuesta) {
            return res.status(404).json({
                error: "Tarea no encontrada"
            });
        }

        await prisma.encuesta.delete({
            where: { id }
        });

        res.json({
            mensaje: "Eliminada"
        });
    } catch (error) {
        console.error("Error al eliminar la encuesta:", error);
        res.status(500).json({
            error: "Error interno del servidor al eliminar la encuesta"
        });
    }
}