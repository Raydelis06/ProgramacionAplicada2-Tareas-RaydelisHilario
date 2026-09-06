const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

// ===== Middleware global de logging =====
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ===== Middleware de validación de campos requeridos =====
function validarCampos(...campos) {
  return (req, res, next) => {
    const faltantes = campos.filter(
      (campo) => req.body[campo] === undefined || req.body[campo] === null || req.body[campo] === ''
    );
    if (faltantes.length > 0) {
      console.warn(`Warning: faltan campos requeridos en ${req.method} ${req.originalUrl}: ${faltantes.join(', ')}`);
      return res.status(400).json({ error: `Faltan los siguientes campos: ${faltantes.join(', ')}` });
    }
    next();
  };
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

let inventario = [
    {
        id: 1,
        producto: "Laptop",
        stock: 10,
        stockMinimo: 5
    }
];

let nextInventarioId = 2;

app.get('/inventario', (req, res) => {
    res.status(200).json(inventario);
});

app.post('/inventario', validarCampos('producto', 'stock'), (req, res) => {
    const { producto, stock, stockMinimo } = req.body;

    if (typeof stock !== 'number' || stock < 0) {
        console.warn('Warning: stock con formato inválido en POST /inventario');
        return res.status(400).json({ error: "Stock debe ser un número mayor o igual a 0" });
    }
    if (stockMinimo !== undefined && (typeof stockMinimo !== 'number' || stockMinimo < 0)) {
        return res.status(400).json({ error: "stockMinimo debe ser un número mayor o igual a 0" });
    }

    const nuevoItem = {
        id: nextInventarioId++,
        producto,
        stock,
        // stockMinimo por defecto es 5, si se envía, se toma el valor recibido
        stockMinimo: stockMinimo !== undefined ? stockMinimo : 5
    };
    inventario.push(nuevoItem);
    res.status(201).json({mensaje: "Producto crado correctamente!", nuevoItem});
});

app.post('/inventario/:id/entrada', validarCampos('cantidad'), (req, res) => {
    const { id } = req.params;
    const { cantidad } = req.body;
    const item = inventario.find(i => i.id == id);

    if (typeof cantidad !== "number" || !Number.isFinite(cantidad)) {
        console.warn('Warning: cantidad con formato inválido en POST /inventario/:id/entrada');
        return res.status(400).json({ error: "Cantidad debe ser un número" });
    }
    if (cantidad <= 0) {
        return res.status(400).json({ error: "Cantidad debe ser mayor a 0" });
    }
    if (!item) {
        return res.status(404).json({ error: "Producto no encontrado" });
    }

    item.stock += cantidad;
    res.status(200).json({ message: "Entrada registrada", item });
});

app.post('/inventario/:id/salida', validarCampos('cantidad'), (req, res) => {
    const { id } = req.params;
    const { cantidad } = req.body;
    const item = inventario.find(i => i.id == id);

    if (typeof cantidad !== "number" || !Number.isFinite(cantidad)) {
        console.warn('Warning: cantidad con formato inválido en POST /inventario/:id/salida');
        return res.status(400).json({ error: "Cantidad debe ser un número" });
    }
    if (cantidad <= 0) {
        return res.status(400).json({ error: "Cantidad debe ser mayor a 0" });
    }
    if (!item) {
        return res.status(404).json({ error: "Producto no encontrado" });
    }
    if (cantidad > item.stock) {
        return res.status(400).json({ error: "No se puede realizar la salida, stock insuficiente" });
    }
    item.stock -= cantidad;
    res.status(200).json({ message: "Salida registrada", item });
});

app.get('/inventario/alertas', (req, res) => {
    const productosPorDebajo = inventario.filter(item => item.stock <= item.stockMinimo);
    const mensaje = productosPorDebajo.length > 0 ? "Hay productos con stock por debajo del mínimo" : "Productos en stock dentro de los límites";
    const alertas = inventario.map(item => ({
        producto: item.producto,
        stock: item.stock,
        stockMinimo: item.stockMinimo,
        faltanParaMinimo: item.stock - item.stockMinimo
    }));
    res.status(200).json({ mensaje, alertas });
});

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.warn('Warning: JSON inválido recibido en', req.method, req.originalUrl);
        return res.status(400).json({error: "El cuerpo de la solicitud no contiene JSON válido"});
    }
    next(err);
});
