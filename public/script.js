document.getElementById('calcular').addEventListener('click', async () => {
  const num1 = document.getElementById('num1').value;
  const num2 = document.getElementById('num2').value;
  const operacion = document.getElementById('operacion').value;
  const resultadoEl = document.getElementById('resultado');

  if (num1 === '' || num2 === '') {
    resultadoEl.innerText = 'Completa ambos números';
    return;
  }

  try {
    const respuesta = await fetch('/api/calcular', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ num1, num2, operacion })
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      resultadoEl.innerText = data.error || 'Error';
      return;
    }

    resultadoEl.innerText = data.resultado;
  } catch (err) {
    resultadoEl.innerText = 'Error de conexión con el servidor';
  }
});
