let selectedId = 0

document.addEventListener('click', (e)=> {  
  // Detecta cuando presionamos el boton de imprimir prestamo
  let rowId = e.target.getAttribute('data-print')
  if(rowId && rowId !== "") {
    // Obtenemos la modal para abrirla y cargar los datos de la caja seleccionada para editar
    let myModal = new bootstrap.Modal(document.getElementById("document_PDF"));
    // Mostramos la ventana
    myModal.show();
    selectedId = rowId
    return
  }
})

function prepareFormToPrint(personData, event) {
  
  fetch("/gad/data-to-print/" + selectedId, { method: "GET" })
  .then(data => data.json())
  .then(data => {
    generatePDF(data, personData)
    event.target.submit()
  })
  .catch(e => {
    console.log(e)
  })
}

function isNumber(value) {
  try {
    return !isNaN(value)
  } catch (error) {
    return false
  }
}

document.getElementById('borrow-form').addEventListener('submit', function(event) {
  event.preventDefault();  // Prevenir el envío del formulario

  // Obtener los valores de los campos
  let dni = document.getElementById('dni').value.trim();
  let name = document.getElementById('person-name').value.trim();
  let telephone = document.getElementById('person-telephone').value.trim();
  let address = document.getElementById('person-address').value.trim();

  let errors = "" 
  
  // Validaciones
  if (dni === ''){
    errors += "Ingrese la cédula.<br>"
  }

  if (!validateDNI(dni)) {
    errors += "La cédula es inválida.<br>"
  }

  if (name === ''){
    errors += "Ingrese el nombre completo.<br>"
  }
  const nameIsValid = validateName(name)  
  if (nameIsValid.error){
    errors += nameIsValid.message
  } else {
    name = nameIsValid.name
  }

  if (telephone === ''){
    errors += "Ingrese el teléfono.<br>"
  } else {
    const regex = /^09\d{8}$/; // Inicia con "09" seguido de 8 dígitos
    if(!regex.test(telephone)){
    errors += "Ingrese un número de teléfono valido.<br>"
    }
  }

  if (address === ''){
    errors += "Ingrese la dirección.<br>"
  } else {
    if (address.length > 200) {
      errors += "La descripción no puede tener más de 200 caracteres.<br>"
    }
  }

  if (errors !== "") {
    Swal.fire({
      title: "Errores encontrados",
      html: errors,
      icon: "warning",
      showCancelButton: true,
      showConfirmButton: false,
      cancelButtonColor: "#d33",
      cancelButtonText: "Cancelar"
    })
    return
  }

  // Si la validación es correcta, crea un objeto con los datos del formulario y genera el PDF
  const personData = {
    "dni": dni,
    "name": name,
    "telephone": telephone,
    "address": address
  };

  prepareFormToPrint(personData, event)

});
