// Conversión de unidades
export const convertirUnidad = (cantidad, unidadOrigen, unidadDestino) => {
  if (unidadOrigen === unidadDestino) return cantidad;
  
  const conversiones = {
    'kilo-gramo': 1000,
    'gramo-kilo': 0.001,
    'litro-mililitro': 1000,
    'mililitro-litro': 0.001,
    'metro-centimetro': 100,
    'centimetro-metro': 0.01
  };
  
  const key = `${unidadOrigen}-${unidadDestino}`;
  return conversiones[key] ? cantidad * conversiones[key] : cantidad;
};

// Unidades compatibles para conversión
export const unidadesCompatibles = {
  'gramo': ['gramo', 'kilo'],
  'kilo': ['gramo', 'kilo'],
  'mililitro': ['mililitro', 'litro'],
  'litro': ['mililitro', 'litro'],
  'metro': ['metro', 'centimetro'],
  'centimetro': ['metro', 'centimetro'],
  'unidad': ['unidad']
};

// Lista de todas las unidades
export const todasLasUnidades = ['gramo', 'kilo', 'unidad', 'mililitro', 'litro', 'metro', 'centimetro'];

// Formatear fecha
export const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-AR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

// Formatear moneda
export const formatearMoneda = (valor) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2
  }).format(valor);
};

// Obtener color según nivel de stock
export const getStockColor = (stock, theme) => {
  if (stock < 10) return theme.danger;
  if (stock < 20) return theme.warning;
  return theme.success;
};

// Generar ID único
export const generarId = () => Date.now() + Math.random().toString(36).substr(2, 9);

// Descargar archivo JSON
export const descargarJSON = (data, filename) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Leer archivo JSON
export const leerJSON = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        resolve(data);
      } catch (error) {
        reject(new Error('Archivo JSON inválido'));
      }
    };
    reader.onerror = () => reject(new Error('Error al leer archivo'));
    reader.readAsText(file);
  });
};
