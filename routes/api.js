const express = require('express');
const router = express.Router();

router.post('/calcular', (req, res) => {
  const { num1, num2, operacion } = req.body;

  if (num1 === undefined || num2 === undefined || !operacion) {
    return res.status(400).json({ error: 'Faltan parámetros (num1, num2, operacion)' });
  }

  const a = parseFloat(num1);
  const b = parseFloat(num2);

  if (Number.isNaN(a) || Number.isNaN(b)) {
    return res.status(400).json({ error: 'num1 y num2 deben ser numéricos' });
  }

  let resultado;
  switch (operacion) {
    case 'suma':
      resultado = a + b;
      break;
    case 'resta':
      resultado = a - b;
      break;
    case 'multiplicacion':
      resultado = a * b;
      break;
    case 'division':
      if (b === 0) {
        return res.status(400).json({ error: 'División por cero no permitida' });
      }
      resultado = a / b;
      break;
    default:
      return res.status(400).json({ error: 'Operación no válida' });
  }

  res.json({ resultado });
});

// Endpoint simple de salud (útil para verificar despliegue en EC2)
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = router;
