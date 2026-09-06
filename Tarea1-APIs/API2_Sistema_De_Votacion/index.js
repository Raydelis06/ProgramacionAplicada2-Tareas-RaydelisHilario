const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

// Middleware global de logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

//Middleware de validación de campos
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

//El puerto 3000 es el que se va a usar para escuchar las solicitudes
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

let encuestas = [
    {
        id: 1,
        pregunta: "¿Qué superpoder elegirías tener?",
        opciones: [
            {"opcion": "Volar", "votos": 0}, 
            {"opcion": "Ser invisible", "votos": 0}, 
            {"opcion": "Teletransportarte", "votos": 0}, 
            {"opcion": "Leer mentes", "votos": 0}
        ]
    },
    {
        id: 2,
        pregunta: "¿Qué lugar te gustaría visitar algún día?",
        opciones: [
            {"opcion": "Japón", "votos": 0}, 
            {"opcion": "Italia", "votos": 0}, 
            {"opcion": "Nueva York", "votos": 0}, 
            {"opcion": "Egipto", "votos": 0}
        ]
    }      
];

let nextEncuestaId = 3;

function calcularResultados(encuesta) {
    const ganador = encuesta.opciones.reduce((prev, current) => (prev.votos > current.votos) ? prev : current);
    const totalVotos = encuesta.opciones.reduce((sum, opcion) => sum + opcion.votos, 0);
    if (ganador.votos === 0) {
        return { mensaje: "No hay votos registrados para esta encuesta" };
    }
    return {
        ganador: ganador.opcion,
        votosGanador: ganador.votos,
        encuesta: encuesta.opciones.map(opcion => (
            { 
                opcion: opcion.opcion, 
                votos: opcion.votos,
                porcentaje: totalVotos > 0 ? ((opcion.votos / totalVotos) * 100).toFixed(2) + "%" : "0%"
            }
        ))
    };
}

app.get('/encuestas', (req, res) => {
    res.status(200).json(encuestas);
});

app.post('/encuestas', validarCampos('pregunta', 'opciones'), (req, res) => {
    const { pregunta, opciones } = req.body;
    if (!Array.isArray(opciones) || opciones.length === 0) {
        return res.status(400).json({ error: "Opciones es un arreglo vacio" });
    }
    if (opciones.length < 2) {
        return res.status(400).json({ error: "Se requieren al menos dos opciones para la encuesta" });
    }
    const nuevaEncuesta = {
        id: nextEncuestaId++,
        pregunta: pregunta,
        opciones: opciones.map(opcion => ({ opcion, votos: 0 }))
    };
    encuestas.push(nuevaEncuesta);
    return res.status(201).json({ mensaje: "Encuesta creada exitosamente", encuesta: nuevaEncuesta });
});

app.post('/encuestas/:id/votar', validarCampos('opcion'), (req, res) => {
    const encuestaId = parseInt(req.params.id);
    const { opcion } = req.body;
    const encuesta = encuestas.find(e => e.id === encuestaId);
    if (!encuesta) {
        return res.status(404).json({ error: "Encuesta no encontrada" });
    }
    const opcionSeleccionada = encuesta.opciones.find(o => o.opcion === opcion);
    if (!opcionSeleccionada) {
        return res.status(400).json({ error: "Opción no válida" });
    }
    opcionSeleccionada.votos += 1;
    return res.status(200).json({ mensaje: "Voto registrado exitosamente", encuesta });
});

app.get('/encuestas/:id/resultados', (req, res) => {
    const encuestaId = parseInt(req.params.id);
    const encuesta = encuestas.find(e => e.id === encuestaId);
    if (!encuesta) {
        return res.status(404).json({ error: "Encuesta no encontrada" });
    }

    return res.status(200).json({ resultados: calcularResultados(encuesta)});
});

app.delete('/encuestas/:id', (req, res) => {
    const encuestaId = parseInt(req.params.id);
    const index = encuestas.findIndex(e => e.id === encuestaId);
    if (index === -1) {
        return res.status(404).json({ error: "Encuesta no encontrada" });
    }
    encuestas.splice(index, 1);
    return res.status(200).json({ mensaje: "Encuesta eliminada exitosamente!" });
});

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.warn('Warning: JSON inválido recibido en', req.method, req.originalUrl);
        return res.status(400).json({error: "El cuerpo de la solicitud no contiene JSON válido"});
    }
    next(err);
});
