import { prisma } from "../db.js";


// POST /inventario - Crear un nuevo producto
export const crearProducto = async (req, res) => {
    try {
        const { producto, stock, stockMinimo } = req.body;

        const productoEnInventario = await prisma.inventario.create({
            data: {
                producto: producto,
                stock: stock,
                stockMinimo: stockMinimo !== undefined ? stockMinimo : 5
            }
        });
        res.status(201).json(productoEnInventario);
    } catch (error) {
        console.error("Error al crear el producto:", error);
        res.status(500).json({
            error: "Error interno del servidor al crear producto"
        });
    }
};
// GET /inventario -> obtener la lista de productos del inventario
export const obtenerInventario = async (req, res) => {
    try {
        const inventario = await prisma.inventario.findMany({});
        res.status(200).json(inventario);
    } catch (error) {
        console.error("Error al obtener el inventario:", error);
        res.status(500).json({
            error: "Error interno del servidor al consultar el"
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
        const producto = await prisma.inventario.findUnique({
            where: { id }
        });

        if (!producto) {
            return res.status(404).json({
                error: "Producto no encontrado"
            });
        }
        
        const { cantidad } = req.body;
        const inventarioActualizado = await prisma.inventario.update({ 
            where: { id }, 
            data: { 
                stock: { increment: cantidad } 
            } 
        });
        return res.status(200).json({ mensaje: "Entrada registrada con exito", inventarioActualizado});

    } catch (error) {
        console.error("Error al registrar la entrada:", error);
        res.status(500).json({
            error: "Error interno del servidor al registrar"
        });
    }
};
// POST /inventario/:id/salida - Registrar salida
export const registrarSalida = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({
                error: "El parámetro ID debe ser un número entero válido"
            });
        }
        const producto = await prisma.inventario.findUnique({
            where: { id }
        });

        if (!producto) {
            return res.status(404).json({
                error: "Producto no encontrado"
            });
        }
        
        const { cantidad } = req.body;
        const inventarioActualizado = await prisma.inventario.update({ 
            where: { id }, 
            data: { 
                stock: { decrement: cantidad } 
            } 
        });
        return res.status(200).json({ mensaje: "Salida registrada con exito", inventarioActualizado});

    } catch (error) {
        console.error("Error al registrar la salida:", error);
        res.status(500).json({
            error: "Error interno del servidor al registrar"
        });
    }
};
// GET /inventario/alertas -> obtener la lista de alertas de stock
export const obtenerAlertas = async (req, res) => {
    try {
        const inventario = await prisma.inventario.findMany(); 
        const productosPorDebajo = inventario.filter( item => item.stock <= item.stockMinimo ); 
        const mensaje = productosPorDebajo.length > 0 ? "Hay productos con stock por debajo del mínimo" : "Productos en stock dentro de los límites"; 
        const alertas = inventario.map(item => ({ producto: item.producto, stock: item.stock, stockMinimo: item.stockMinimo, faltanParaMinimo: item.stock - item.stockMinimo })); 
        res.status(200).json({ mensaje, alertas });
    } catch (error) {
        console.error("Error al obtener las alertas:", error);
        res.status(500).json({
            error: "Error interno del servidor al consultar las alertas"
        });
    }
};