import { prisma } from "../db.js";


// POST /inventario - Crear un nuevo producto
export const crearProducto = async (req, res) => {
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
// GET /inventario -> obtener la lista de productos del inventario
export const obtenerInventario = async (req, res) => {
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
// POST /inventario/:id/entrada - Registrar entrada
export const registrarEntrada = async (req, res) => {
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
