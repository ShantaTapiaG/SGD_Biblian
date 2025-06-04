let selectedId = 0

document.addEventListener('click', (e)=> {  
  // Detecta cuando clickamos en el boton para visualizar el archivo
  let rowId = e.target.getAttribute('data-id')
  if(rowId && rowId !== "") {
    if(isNumber(rowId)) {
      redirect(rowId)
    } else {
      alert("ERROR: Id no es un número")
    }
    return
  }
  // Detecta cuando presionamos el boton de editar
  rowId = e.target.getAttribute('data-update')
  if(rowId && rowId !== "") {
    fileId = rowId
    selectedFormType = formType.update
    POSTRequest(urls.search + rowId, {data: false}, (data) => loadDataForm(data), (e) => console.log(e))  
    return
  }
  // Detecta cuando presionamos el boton de eliminar
  rowId = e.target.getAttribute('data-delete')
  if(rowId && rowId !== "") {
    confirmDelete(rowId)
    return
  }
  // Detecta cuando presionamos el boton de imprimir prestamo
  rowId = e.target.getAttribute('data-print')
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

function loadDataForm(data) {
  selectedFormType = formType.update
  form.elements["name"].value = data.name
  form.elements["file-types"].value = data.type
  form.elements["created-date"].value = data.created
  form.elements["description"].value = data.description
  // Obtenemos la modal para abrirla y cargar los datos de la caja seleccionada para editar
  let myModal = new bootstrap.Modal(document.getElementById("newFile"));
  // Editamos el titulo del formulario
  formTitle.innerHTML = 'EDITAR ARCHIVO'
  // Mostramos el formulario
  myModal.show();
  return

}

function confirmDelete(rowId) {
  Swal.fire({
      title: "¿Deseas eliminar esta archivo?",
      text: "Esta acción no se puede deshacer",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
  }).then((result) => {
      if (result.isConfirmed) {
        deleteFile(rowId);        
      }
  });
}

function deleteFile(rowId) {
  POSTRequest(urls.delete + rowId, {data: false}, (data) => wasDeleted(data), (e) => console.log(e))
}

function wasDeleted(data) {
  if(data.response) {
    Swal.fire({
      title: data.message,
      icon: "success",
      showCancelButton: false,
      confirmButtonText: "Ok",
  }).then((result) => {
        window.location = ''
  });
  } else {
    Swal.fire({
      title: data.error,
      icon: "error",
      showCancelButton: false,
      confirmButtonText: "Ok",
    })   
  }
}

function redirect(id) {
   window.location = 'boxes/'+id
}

function isNumber(value) {
  try {
    return !isNaN(value)
  } catch (error) {
    return false
  }
}

btnNew.onclick = (e) => {
  form.reset()
  selectedFormType = formType.create
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
