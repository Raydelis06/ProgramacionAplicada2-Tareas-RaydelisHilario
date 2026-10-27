import { prisma } from "../db.js"


export const obtenerServicios = async (req, res) => {
    try {
        const servicios = await prisma.servicio.findMany({
            orderBy: { id: "asc" }
        });

        res.status(200).json(servicios);
    } catch (error) {
        console.error("Error al obtener los servicios: ", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

export const crearServicio = async (req,res,next) => {
    console.log("auth header:", req.headers.authorization);
    console.log("req.usuario:", req.user);
    try{
        const {nombre, descripcion, duracion, precio} = req.body

        const existe = await prisma.servicio.findFirst({where: {nombre}})

        if(existe){
            return res.status(400).json('Ya existe este servicio')
        }

        const servicio = await prisma.servicio.create({
            data: {
                nombre: nombre, descripcion: descripcion, duracion: duracion, precio:precio
            }
        })

        return res.status(201).json({mensaje: 'Servicio creado con exito!', servicio: {
            id: servicio.id,
            nombre: servicio.nombre,
            descripcion: servicio.descripcion,
            duracion: servicio.duracion + " minutos",
            precio: "$" + servicio.precio
        }})

    }catch(err){
        console.log(err)
        next(err)
    }
}

export const editarServicio = async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        if (isNaN(id)) {
            return res.status(400).json({ error: "El id debe ser un número válido" });
        }
        const servicioExistente = await prisma.servicio.findUnique({where: {id}})

        if(!servicioExistente){
            return res.status(400).json('El servicio seleccionado no existe')
        }
        const servicioActualizado = await prisma.servicio.update({ 
            where: { id },
            data:{
                nombre: req.body.nombre, 
                descripcion: req.body.descripcion,
                duracion: req.body.duracion,
                precio: req.body.precio
            }
        })

        res.status(200).json({mensaje: "Servicio actualizado exitosamente", servicioActualizado});
    } catch (error) {
        console.error("Error al actualizar el servicio ", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

export const eliminarServicio = async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        if (isNaN(id)) {
            return res.status(400).json({ error: "El id debe ser un número válido" });
        }
        const servicioExistente = await prisma.servicio.findUnique({where: {id}})

        if(!servicioExistente){
            return res.status(400).json('El servicio seleccionado no existe')
        }
        
        await prisma.servicio.delete({ where: { id } })

        res.status(200).json({mensaje: "Servicio eliminado exitosamente"});
    } catch (error) {
        console.error("Error al eliminar el servicio ", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};