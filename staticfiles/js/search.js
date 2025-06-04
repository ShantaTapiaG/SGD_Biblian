const filterForm = document.querySelector('#filter-form')
const btnFilter = document.querySelector('#btn-filter')
const sectionsList = document.querySelector('#seccion')
const subsectionsList = document.querySelector('#subseccion')

async function loadSubsections(value) {
  const subsections = await getSubsectionsBySectionId(parseInt(value))
    // Se limpia el select de la subsecciones
    subsectionsList.innerHTML = ''
    // Se carga el valor por defecto
    subsectionsList.appendChild(createOpt('', 'Seleccione una subsección'))
    // Cargamos el resto de las opciones
    loadLists(subsections, subsectionsList)
}

// Obtener las subsecciones segun la sección que se seleccione 
async function getSubsectionsBySectionId(sectionId) {
  return await (await fetch('/gad/subsections/'+sectionId, { method: 'GET' })).json()
}

// Añadir dentro de un select las opciones consultadas en la BD 
function loadLists(arr, listObj) {
  arr.forEach(item => {
    listObj.appendChild(createOpt(item.id, item.name))
  });
}

function loadSections(data) {
  // Limpiamos los selects
  clearSelects()
  // Cargamos la opción por defecto
  sectionsList.appendChild(createOpt('', 'Seleccione una sección'))
  subsectionsList.appendChild(createOpt('', 'Seleccione una subsección'))
  // Cargas los selects
  loadLists(data['sections'], sectionsList)  
}

// Crear opciones de los selects
function createOpt(id, name) {
  let opt = document.createElement('option')
  opt.value = id
  opt.innerHTML = name
  return opt
}

// Limpiar los selects del formulario
function clearSelects() {
  sectionsList.innerHTML = ''
  subsectionsList.innerHTML = ''
}

// Obtener los datos desde BD para cargar los selects y los checks del formulario de crear caja
async function getDataToForm() {
  return await (await fetch('/gad/box-data-form', { method: 'GET' })).json()
}

// Detectamos cuando se seleccione una sección y de ahi se carguen la subsecciones asociadas
sectionsList.onchange = async (e) => {
  let { value } = e.target
  if(value !== "") {
   await loadSubsections(value)
  } else {
    // Se limpia el select de la subsecciones
    subsectionsList.innerHTML = ''
    // Se carga el valor por defecto
    subsectionsList.appendChild(createOpt('', 'Seleccione una subsección'))
  }
}

// Obtener los datos desde BD para cargar los selects y los checks del formulario de crear caja
async function getDataToForm() {
  return await (await fetch('/gad/box-data-form', { method: 'GET' })).json()
}

async function getAllTypes() {
  return await (await fetch("/gad/types", { method: "GET" })).json();
}

function createOptions(arr, select) {
  const opt = document.createElement("option");
    opt.value = "";
    opt.innerHTML = "Selecciona el tipo de documento";
    select.appendChild(opt);
  arr.forEach((type) => {
    const opt = document.createElement("option");
    opt.value = type.id;
    opt.innerHTML = type.type;
    select.appendChild(opt);
  });
}

((async () => {
  const sectionData = await getDataToForm()
  loadSections(sectionData)
  // Cargamos los tipos de archivos en el foumulario para agregar nuevo
  const types = await getAllTypes();
  const select = document.querySelector("#file-types");
  createOptions(types, select);
}))()

document.getElementById("filter-form").addEventListener("submit", function(event) {
  event.preventDefault();
  // Obtener las fechas
  const initialDate = document.getElementById("initial_date").value;
  const finalDate = document.getElementById("final_date").value;
  
  // Validar si la fecha final es menor que la fecha inicial
  if (initialDate !== "" && finalDate !== "" && initialDate > finalDate) {
    Swal.fire({
      title: "Error",
      text: "La fecha final no puede ser menor que la fecha de creación.",
      icon: "warning",
      showCancelButton: true,
      showConfirmButton: false,
      cancelButtonColor: "#d33",
      cancelButtonText: "Cancelar"
    })
    return
  }

  // Crear un FormData con el formulario
    const formData = new FormData(event.target);
    POSTFormDataReq("/gad/search-any", formData , (data) => generateTable(data), (e) => console.log(e))
});

// Función que le da el forma de objeto para renderizar en la tabla
function objectToArray(obj, rowNumber, btns) {
  return [
    rowNumber, // Agregamos el número que tendrá la fila
    obj.filename,
    obj.file_type,
    obj.created_at,
    obj.box_number,
    obj.section,
    obj.subsection,
    obj.initial_date,
    obj.final_date,
    btns // Agregamos el html de los botones
  ]
  
}

// Convierte los objetos en arreglos y añade los botones al final de cada fila
function prepareRows(result) {
  
  return result.map((item, i) => {
    console.log(item)
    
    let btns = `
    <div class="btns-ui">
      <div class="btns-ui">
        <a href="${item.file_url}" target="_blank" class="btn btn-dark">
          <i class="fa-regular fa-rectangle-list icon-row"></i>
        </a>
      </div>
      <button data-print="${item.id}" type="button" class="btn btn-warning">
          <i data-print="${item.id}" class="fa-solid fa-print icon-row"></i>
      </button>
    </div> 
    `
    return objectToArray(item, (i+1), btns)
  })
}

async function generateTable(data) {
  const json = prepareRows(data.results)
  const rows = json.length
  const tableUI = new TableUI('myTable')
  tableProps.data = json
  tableProps.totalRows = rows
  tableUI.create(tableProps)
}