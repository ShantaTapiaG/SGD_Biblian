function validateName(text) {
  // Eliminar espacios extra y dividir el nombre en words
  const words = text.trim().split(/\s+/);
  const data = {
    error: false,
    message: "",
    name: ""
  }
  // Verificar que el nombre tenga entre 2 y 4 words
  if (words.length < 2 || words.length > 4) {
    data.error = true;
    data.message = "Debe escribir al menos un nombre y un apellido.<br>"
  } else {
    data.error = false,
    data.message = ""
  }

  // Si pasa todas las verificaciones, transformar la primera letra de cada word a mayúscula
  data.name = words.map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');

  return data;
}