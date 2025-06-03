pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";

// Elementos con acciones
const btnNew = document.querySelector('#btn-new')
const form = document.querySelector('#box-file-form')
let formTitle = document.getElementById('newBoxLabel')
let fileId = ""

btnNew.onclick = (e) => {
  formTitle = 'NUEVO ARCHIVO'
  form.reset()
}

// URLS PARA LAS ACCIONES
const urls = {
  create: '/gad/docfile-new',
  search: '/gad/docfile-search/',
  update: '/gad/docfile-update/',
  delete: '/gad/docfile-delete/'
}

const formType = {
  create: "create",
  update: "update"
}

selectedFormType = formType.create

// Obtenemos los archivos de la caja seleccioanda
async function getAllFiles(boxId) {
  return await (await fetch("/gad/files/" + boxId, { method: "GET" })).json();
}

// Convierte los objetos en arreglos
function prepareRows(result) {
  return result.map((item, i) => {
    let btns = `
    <div class="btns-ui">
      <a href="/media/${item.filename}" target="_blank" class="btn btn-dark">
        <i class="fa-regular fa-rectangle-list icon-row"></i>
      </a>
      <button data-print="${item.id}" type="button" class="btn btn-warning">
        <i data-print="${item.id}" class="fa-solid fa-print icon-row"></i>
      </button>
      <button data-update="${item.id}" type="button" class="btn btn-primary">
        <i data-update="${item.id}" class="fa-solid fa-pen-to-square icon-row"></i>
      </button>
      <button data-delete="${item.id}" type="button" class="btn btn btn-danger btn-row">
        <i data-delete="${item.id}" class="fa-solid fa-trash-can icon-row"></i>
      </button>
    </div>
    `;
    return objectToArray(item, i + 1, btns);
  });
}

// Aqui se define los campos que aparecerán en las filas de la tabla
function objectToArray(obj, rowNumber, btns) {
  return [
    rowNumber, // Agregamos el número que tendrá la fila
    obj.name,
    obj.type,
    obj.description,
    obj.created,
    btns, // Agregamos el html de los botones
  ];
}

async function generateTable(data) {
  const json = await prepareRows(data);
  const rows = json.length;
  // Mostramos cuantos archivos hay
  document.getElementById('total-results').innerHTML = rows
  // Creamos la tabla
  const tableUI = new TableUI("myTable");
  tableProps.data = json;
  tableProps.totalRows = rows;
  tableUI.create(tableProps);
}

async function getAllTypes() {
  return await (await fetch("/gad/types", { method: "GET" })).json();
}

function createOptions(arr, select) {
  arr.forEach((type) => {
    const opt = document.createElement("option");
    opt.value = type.id;
    opt.innerHTML = type.type;
    select.appendChild(opt);
  });
}

async function extractTextFromPDF(data) {
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdf = await loadingTask.promise;
  let text = "";
  // Unificamos el texto del PDF
  for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      text += textContent.items.map(item => item.str).join(" ");
  }

  // Eliminar saltos de línea y dobles espacios
  text = text.replace(/[\r\n]+/g, " ") // Reemplaza solo saltos de línea con espacio
    .replace(/\s+/g, " ")     // Elimina dobles espacios
    .trim()
    .slice(0, 250);

  // Asignar el texto al textarea
  document.getElementById('description').value = text
}

document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("#box-file-form");
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    // Personalizar mensaje segíun el tipo de formulario
    let msg = ""
    if(selectedFormType == formType.update) {
      msg = "¿Deseas actualizar este archivo?"
    } else {
      msg = "¿Deseas guardar este archivo?"
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
});


function validateForm(event) {
  let isValid = true;
  let errorMessages = [];

  // Obtener valores de los campos
  const nombre = document.getElementById("name").value.trim();
  const fileType = document.getElementById("file-types").value;
  const fileUpload = document.getElementById("file-upload").files.length;
  const fechaCreado = document.getElementById("created-date").value;
  const description = document.getElementById("description").value.trim();

  // Validar "Nombre"
  if (nombre === "") {
      isValid = false;
      errorMessages.push("El campo 'Nombre' es obligatorio.<br>");
  }

  // Validar "Tipo documento"
  if (fileType === "") {
      isValid = false;
      errorMessages.push("Debe seleccionar un 'Tipo de documento'.<br>");
  }

  // Validar "Subir Archivo"
  if (fileUpload === 0 && selectedFormType === formType.create) {
      isValid = false;
      errorMessages.push("Debe subir un archivo.<br>");
  }

  // Validar "Fecha creación"
  if (fechaCreado === "") {
      isValid = false;
      errorMessages.push("Debe ingresar una 'Fecha de creación'.<br>");
  }

  // Validar "Descripción" (mínimo 10 caracteres)
  if (description.length < 10) {
      isValid = false;
      errorMessages.push("La 'Descripción' debe tener al menos 10 caracteres.<br>");
  }

  // Mostrar errores si hay alguno
  if (!isValid) {     
    Swal.fire({
      title: "Errores encontrados",
      html: errorMessages.join(''),
      icon: "warning",
      showCancelButton: true,
      showConfirmButton: false,
      cancelButtonColor: "#d33",
      cancelButtonText: "Cancelar"
    })
  } else {
    if(selectedFormType === formType.create) {
      sendData(urls.create, event)
    } 

    if(selectedFormType === formType.update) {
      console.log('senciD');
      
      sendData(urls.update + fileId, event)
    } 

  }
}

function sendData(url, event) {
  const form = document.querySelector("#box-file-form");
  const formData = new FormData(form)  
  POSTFormDataReq(url, formData, (data) => {okMessage(data, event)}, (e) => console.log(e))
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
  } else {
    Swal.fire({
      title: data.error,
      icon: "error",
      showCancelButton: false,
      confirmButtonText: "Ok",
    }) 
  }
}

// Funcion que se autoejecuta al inicio, es necesaria para usar asyn y await desde el principio
(async () => {
  const inputHidden = document.querySelector("#box-id");
  const boxId = inputHidden.getAttribute("data-id");
  if (boxId) {
    // Obtenemos todos los archivos de la caja seleccionada
    const data = await getAllFiles(boxId);
    // Creamos la tabla       
    await generateTable(data);
  }

  // Cargamos los tipos de archivos en el foumulario para agregar nuevo
  const types = await getAllTypes();
  const select = document.querySelector("#file-types");
  createOptions(types, select);

  // Asignamos el lector PDF al detectar un cambió en el input de archivo
  const fileUpload = document.querySelector("#file-upload");
  fileUpload.onchange = async (e) => {
    const file = e.target.files[0];
    // Detectamos sino se cargó un archivo o si no es PDF entonces retornamos y limpiamos 
    if (!file || file.type !== "application/pdf") {
      alert("Por favor, selecciona un archivo PDF válido.");
      e.target.value = "";
      return;
    }
    
    // Leeamos el archivo
    const reader = new FileReader();
    reader.onload = function () {
      const typedarray = new Uint8Array(reader.result);
      extractTextFromPDF(typedarray);
    };
    reader.readAsArrayBuffer(file);
  }
})();
