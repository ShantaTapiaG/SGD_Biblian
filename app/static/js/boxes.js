document.addEventListener('click', async (e)=> {  
  let rowId = e.target.getAttribute('data-id')
  if(rowId && rowId !== "") {
    if(isNumber(rowId)) {
      redirect(rowId)
    } else {
      alert("ERROR: Id no es un número")
    }
  }
  rowId = e.target.getAttribute('data-edit')
  if(rowId && rowId !== "") {
    // Definimos que tipo de formulario será
    formTypeSelected = formType.update
    // Cambiamos el titulo del formulario
    formTitle.innerHTML = 'EDITAR CAJA'
    // Cargamos el id de la caja seleccionada
    selectedBox = rowId
    // Obtenemos la modal para abrirla y cargar los datos de la caja seleccionada para editar
    let myModal = new bootstrap.Modal(document.getElementById("newBox"));
    // Cargamos las secciones
    await prepareForm()
    // Consultamos los datos de la caja seleccionada  
    POSTRequest(urls.searchBox+rowId, {none: true} , (data) => loadBoxSelected(data), (e) => console.log(e))  
    // Mostramos la ventana
    myModal.show();
    return
  }

  rowId = e.target.getAttribute('data-delete')
  if(rowId && rowId !== "") {
    // Se debe eliminar y recargar la tabla
    confirmDelete(rowId)
  }
})

function loadBoxSelected(data) {
  const form = document.getElementById("box-form")
  form.elements["box-number"].value = data.number
  form.elements["section"].value = data.section
  // Cargamos los datos del objeto de subseccion para que al darse el evento change, este tambien cambie
  subsectionSelected.value = data.subsection
  subsectionSelected.state = true
  // Crear y disparar el evento 'change' para que se cargue las subsecciones
  const event = new Event('change');
  form.elements["section"].dispatchEvent(event);
  // Cargamos los checkboxes de las series
  checkSelectedOptions(data.series, 'serie-')
  // Cargamos los checkboxes de las subseries
  checkSelectedOptions(data.subseries, 'subserie-')
  // Cargamos el número de expediente
  form.elements['file-number'].value = data.file_number
  // Cargamos las fechas
  form.elements['initial-date'].value = data.initial_date
  form.elements['final-date'].value = data.final_date

}

function checkSelectedOptions(data, suf) {
  // Recorre todos los checkboxes
  data.forEach(value => {
    const checkbox = document.getElementById(suf+value.id)
      checkbox.checked = true; 
  });
}

function confirmDelete(id) {
  Swal.fire({
      title: "¿Deseas eliminar esta caja?",
      text: "Esta acción no se puede deshacer",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
  }).then((result) => {
      if (result.isConfirmed) {
          deleteBox(id);
          console.log(id)
          
      }
  });
}

// Función para eliminar una caja
function deleteBox(boxId) {
  POSTRequest(urls.delete + boxId, {data: false}, (data) => {wasDeleted(data)}, (e)=> console.log(e))
}

// Redirecciona para poder visualizar las cajas en su propia ventana
function redirect(id) {
   window.location = 'boxes/'+id
}

// Valida si un texto es un numero
function isNumber(value) {
  try {
    return !isNaN(value)
  } catch (error) {
    return false
  }
}

/* Envia el formulario según el tipo de formulario (crear o modificar) */
function sendForm(url, successFn, errorFn ) {
  const boxForm = document.querySelector('#box-form') 
  const formData = new FormData(boxForm)  
  // Guardamos los checkboxes seleccionados
  const checkboxesSeries = document.querySelectorAll('input[name="series"]:checked');
  const checkboxesSubseries = document.querySelectorAll('input[name="subseries"]:checked');
  // Recogemos las series y subseries seleccionadas
  const selectedSeries = Array.from(checkboxesSeries).map(checkbox => checkbox.value);
  const selectedSubseries = Array.from(checkboxesSubseries).map(checkbox => checkbox.value);
  // Convertimos los datos a un objeto para enviarlos
  const data = {
      number: formData.get('box-number'),
      section: formData.get('section'),
      subsection: formData.get('subsection'),
      series: selectedSeries,  
      subseries: selectedSubseries,
      file_number: formData.get('file-number'),
      initial_date: formData.get('initial-date'),
      final_date: formData.get('final-date')
  };  
  
  /* Hacemos un fetch() para enviar los datos */ 
  POSTRequest(url, data, successFn, errorFn)
}

function okMessage(data, event) {
  if(data.response) {
    Swal.fire({
      title: data.message,
      icon: "success",
      showCancelButton: false,
      confirmButtonText: "Ok",
  }).then((result) => {
      if (result.isConfirmed) {
        event.target.submit()
      }
  });
  }
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

document.getElementById("box-form").addEventListener("submit", function (event) {
  event.preventDefault(); // Evita el envío automático del formulario
  // Personalizar mensaje segíun el tipo de formulario
  let msg = ""
  if(formTypeSelected == formType.update) {
    msg = "¿Deseas actualizar esta caja?"
  } else {
    msg = "¿Deseas crear esta caja?"
  }
  Swal.fire({
    title: msg,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, crear",
    cancelButtonText: "Cancelar",
    cancelButtonColor: "#d33",
  }).then((result) => {
      if (result.isConfirmed) {
        validateForm(event)
      }
  });
});

function validateForm(event) {
  let isValid = true;
  let errorMessage = "";

  // Obtener valores de los campos
  const boxNumber = document.getElementById("box-number").value.trim();
  const section = document.getElementById("seccion_documental").value.trim();
  const subsection = document.getElementById("subseccion_documental").value.trim();
  const fileNumber = document.getElementById("file-number").value.trim();
  const initialDate = document.getElementById("initial-date").value;
  const finalDate = document.getElementById("final-date").value;
  
  // Verificar checkboxes seleccionados
  const seriesChecked = document.querySelectorAll("#series input[type='checkbox']:checked").length;
  const subseriesChecked = document.querySelectorAll("#subseries input[type='checkbox']:checked").length;

  // Validaciones
  if (!boxNumber) {
      isValid = false;
      errorMessage += "- El número de caja es obligatorio.<br>";
  }
  if (!section) {
      isValid = false;
      errorMessage += "- Debe seleccionar una sección documental.<br>";
  }
  if (!subsection) {
      isValid = false;
      errorMessage += "- Debe seleccionar una subsección documental.<br>";
  }
  if (!fileNumber) {
      isValid = false;
      errorMessage += "- El número de expediente es obligatorio.<br>";
  }
  if (!initialDate) {
      isValid = false;
      errorMessage += "- La fecha de inicio es obligatoria.<br>";
  }
  if (!finalDate) {
      isValid = false;
      errorMessage += "- La fecha de fin es obligatoria.<br>";
  }
  if (initialDate && finalDate && initialDate > finalDate) {
      isValid = false;
      errorMessage += "- La fecha de inicio no puede ser posterior a la fecha de fin.<br>";
  }
  if (seriesChecked === 0) {
      isValid = false;
      errorMessage += "- Debe seleccionar al menos una serie documental.<br>";
  }
  if (subseriesChecked === 0) {
      isValid = false;
      errorMessage += "- Debe seleccionar al menos una subserie documental.<br>";
  }

  // Mostrar errores
  if (!isValid) {
    Swal.fire({
      title: "Errores encontrados",
      html: errorMessage,
      icon: "warning",
      showCancelButton: true,
      showConfirmButton: false,
      cancelButtonColor: "#d33",
      cancelButtonText: "Cancelar"
    })
  } else {
    // Enviar formulario para crear nueva caja
    if(formTypeSelected === formType.create) {
      sendForm(urls.create, (data) =>{okMessage(data, event)}, (e)=> {console.log(e)})
    }

    // Enviar formulario para actualizar una caja
    if(formTypeSelected === formType.update) {     
      sendForm(urls.update + selectedBox, (data) =>{okMessage(data, event)}, (e)=> {console.log(e)})
    }    
  }
}

