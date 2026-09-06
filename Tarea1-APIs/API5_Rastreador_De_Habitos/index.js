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

let habitos = [
    {
        id: 1,
        nombre: 'Lectura diaria',
        meta: '20 paginas por día',
        registros: [
            {
                fecha: new Date('2026-09-01'),
                completado: true
            }
        ]
    }
];

let nextHabitoId = 2;

function soloFecha(fecha) {
    return new Date(fecha).toISOString().split('T')[0];
}

function calcularEstadisticas(habito) {
    const registrosOrdenados = [...habito.registros].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    const diasCompletados = registrosOrdenados.filter(r => r.completado);

    let mejorRacha = 0;
    let rachaTemp = 0;
    let fechaAnterior = null;

    for (const registro of registrosOrdenados) {
        if (!registro.completado) {
            rachaTemp = 0;
            fechaAnterior = null;
            continue;
        }
        const fechaActual = new Date(soloFecha(registro.fecha));
        if (fechaAnterior) {
            const diffDias = Math.round((fechaActual - fechaAnterior) / (1000 * 60 * 60 * 24));
            rachaTemp = diffDias === 1 ? rachaTemp + 1 : 1;
        } else {
            rachaTemp = 1;
        }
        if (rachaTemp > mejorRacha) mejorRacha = rachaTemp;
        fechaAnterior = fechaActual;
    }

    let rachaActual = 0;
    for (let i = registrosOrdenados.length - 1; i >= 0; i--) {
        const registro = registrosOrdenados[i];
        if (!registro.completado) break;

        if (i === registrosOrdenados.length - 1) {
            rachaActual = 1;
        } else {
            const fechaActual = new Date(soloFecha(registro.fecha));
            const fechaSiguiente = new Date(soloFecha(registrosOrdenados[i + 1].fecha));
            const diffDias = Math.round((fechaSiguiente - fechaActual) / (1000 * 60 * 60 * 24));
            if (diffDias === 1) {
                rachaActual += 1;
            } else {
                break;
            }
        }
    }

    const porcentajeCumplimiento = habito.registros.length > 0
        ? ((diasCompletados.length / habito.registros.length) * 100).toFixed(2) + "%"
        : "0%";

    return { rachaActual, mejorRacha, porcentajeCumplimiento };
}

app.post('/habitos', validarCampos('nombre', 'meta'), (req, res) => {
    const { nombre, meta } = req.body;
    if (habitos.some(h => h.nombre === nombre)) {
        return res.status(400).json({ Mensaje: 'El hábito ya existe.' });
    }
    const nuevoHabito = {
        id: nextHabitoId++,
        nombre,
        meta,
        registros: []
    };

    habitos.push(nuevoHabito);
    res.status(201).json({ Mensaje: 'Hábito creado exitosamente!', habito: nuevoHabito });
});

app.get('/habitos', (req, res) => {
    res.status(200).json(habitos);
});

app.post('/habitos/:id/registrar', (req, res) => {
    const id = parseInt(req.params.id);
    const habito = habitos.find(h => h.id === id);
    if (!habito) {
        return res.status(404).json({ Mensaje: 'Hábito no encontrado.' });
    }

    // La fecha la pone el servidor, no el cliente
    const hoy = new Date();
    const hoyStr = soloFecha(hoy);

    const yaRegistradoHoy = habito.registros.some(r => soloFecha(r.fecha) === hoyStr);
    if (yaRegistradoHoy) {
        return res.status(400).json({ Mensaje: 'El hábito ya fue registrado hoy.' });
    }

    const nuevoRegistro = { fecha: hoy, completado: true };
    habito.registros.push(nuevoRegistro);
    res.status(201).json({ Mensaje: 'Hábito registrado exitosamente!', registro: nuevoRegistro });
});

app.get('/habitos/:id/estadisticas', (req, res) => {
    const id = parseInt(req.params.id);
    const habito = habitos.find(h => h.id === id);
    if (!habito) {
        return res.status(404).json({ Mensaje: 'Hábito no encontrado.' });
    }

    const estadisticas = calcularEstadisticas(habito);
    res.status(200).json({ habito: habito.nombre, estadisticas });
});

app.delete('/habitos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = habitos.findIndex(h => h.id === id);
    if (index === -1) {
        return res.status(404).json({ Mensaje: 'Hábito no encontrado.' });
    }
    habitos.splice(index, 1);
    res.status(200).json({ Mensaje: 'Hábito eliminado exitosamente!' });
});

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.warn('Warning: JSON inválido recibido en', req.method, req.originalUrl);
        return res.status(400).json({ error: "El cuerpo de la solicitud no contiene JSON válido" });
    }
    next(err);
});
