function validateDNI(cedula) {
  // Verificar que la cédula tenga 10 dígitos
  if (cedula.length !== 10 || isNaN(cedula)) {
    return false;
  }

  // Extraer los primeros 9 dígitos de la cédula
  const provincia = parseInt(cedula.substring(0, 2)); // Primeros dos dígitos: provincia
  const tercerDigito = parseInt(cedula.substring(2, 3)); // Tercer dígito: tipo de cédula (si es persona natural o jurídica)
  const ultimoDigito = parseInt(cedula.charAt(9)); // Último dígito: verificador

  // Verificar que la provincia esté entre 1 y 24
  if (provincia < 1 || provincia > 24) {
    return false;
  }

  // Cálculo del dígito verificador (según el algoritmo oficial)
  const multiplicadores = [2, 1, 2, 1, 2, 1, 2, 1, 2]; // Multiplicadores para cada posición de la cédula
  let suma = 0;

  // Calcular la suma de los productos de los dígitos por sus multiplicadores
  for (let i = 0; i < 9; i++) {
    let digito = parseInt(cedula.charAt(i)) * multiplicadores[i];
    suma += digito > 9 ? digito - 9 : digito; // Si el producto es mayor que 9, restamos 9
  }

  // El dígito verificador es el número que completa el múltiplo de 10
  const modulo = suma % 10;
  const digitoVerificador = modulo === 0 ? 0 : 10 - modulo;

  // Verificar que el último dígito sea igual al dígito verificador calculado
  if (digitoVerificador === ultimoDigito) {
    return true;
  } else {
    return false;
  }
}
