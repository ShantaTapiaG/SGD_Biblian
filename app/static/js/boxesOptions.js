const sectionsList = document.querySelector('#seccion_documental')
const subsectionsList = document.querySelector('#subseccion_documental')
const btnNewBox = document.querySelector('#btn-new-box')
const seriesChecks = document.querySelector('#series')
const subseriesChecks = document.querySelector('#subseries')
const boxNumberInput = document.querySelector('#box-number')
const fileNumberInput = document.querySelector('#file-number')
const initialDateInput = document.querySelector('#initial-date')
const finalDateInput = document.querySelector('#final-date')
let formTitle = document.getElementById('newBoxLabel')

const formType = {
  create: "create",
  update: "update"
}

const urls = {
  create: '/gad/box/new',
  update: '/gad/update-box/',
  searchBox: '/gad/search-box/',
  delete: '/gad/delete-box/'
}

let formTypeSelected = formType.create
let selectedBox = ""

const subsectionSelected = {
  state: false,
  value: ""
} 

async function loadSubsections(value) {
  const subsections = await getSubsectionsBySectionId(parseInt(value))
    // Se limpia el select de la subsecciones
    subsectionsList.innerHTML = ''
    // Se carga el valor por defecto
    subsectionsList.appendChild(createOpt('', 'Seleccione una subsección'))
    // Cargamos el resto de las opciones
    loadLists(subsections, subsectionsList) 
    if(subsectionSelected.state) {
      subsectionsList.value = subsectionSelected.value
      subsectionSelected.state = false
    }
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

// Detectamos cuando el formulario de crear caja se abre
btnNewBox.onclick = async (e) => { 
  // Reseteamos los datos de la subseccion seleccionada
  subsectionSelected.state = false;
  formTypeSelected = formType.create
  // Carga todos los datos del formulario
  formTitle.innerHTML = 'NUEVA CAJA'
  prepareForm()    
}

// Obtiene las cajas desde la BD
async function getAllBoxes() {
  const boxes = await (await fetch('/gad/all-boxes', { method: 'GET' })).json()
  return boxes
}

// Convierte los objetos en arreglos y añade los botones al final de cada fila
function prepareRows(result) {
  return result.map((item, i) => {
    let btns = `
    <div class="btns-ui">
      <button data-id="${item.id}" type="button" class="btn btn-dark">
        <i class="fa-regular fa-rectangle-list icon-row"></i>
      </button>
      <button data-edit="${item.id}" type="button" class="btn btn-primary">
        <i class="fa-solid fa-pen-to-square icon-row"></i>
      </button>
      <button data-delete="${item.id}" type="button" class="btn btn btn-danger btn-row">
        <i class="fa-solid fa-trash-can icon-row"></i>
      </button>
    </div>
    `
    return objectToArray(item, (i+1), btns)
  })
}

// Función que le da el forma de objeto para renderizar en la tabla
function objectToArray(obj, rowNumber, btns) {
  return [
    rowNumber, // Agregamos el número que tendrá la fila
    obj.number,
    obj.file_number,
    obj.initial_date,
    obj.final_date,
    obj.created_at,
    obj.updated_at,
    obj.section,
    obj.subsection,
    obj.series,
    obj.subseries,
    btns // Agregamos el html de los botones
  ]
  
}

async function generateTable(data) {
  const json = await prepareRows(data)
  const rows = json.length
  // Mostramos la cantidad de cajas que hay registradas
  document.getElementById('total-results').innerHTML = rows
  // Creamos la tabla
  const tableUI = new TableUI('myTable')
  tableProps.data = json
  tableProps.totalRows = rows
  tableUI.create(tableProps)
}

// Obtener las subsecciones segun la sección que se seleccione 
async function getSubsectionsBySectionId(sectionId) {
  return await (await fetch('/gad/subsections/'+sectionId, { method: 'GET' })).json()
}

// Obtener los datos desde BD para cargar los selects y los checks del formulario de crear caja
async function getDataToForm() {
  return await (await fetch('/gad/box-data-form', { method: 'GET' })).json()
}

// Cargamos los datos del formulario vacio para agregar una nueva caja
async function prepareForm() {
  const data = await getDataToForm()
  // Limpiamos el número de caja
  boxNumberInput.value = ''
  // Limpiamos el níumero de expediente
  fileNumberInput.value = ''
  // Limpiamos la fecha inicial
  initialDateInput.value = ''
  // Limpiamos la fecha final
  finalDateInput.value = ''
  loadSections(data)
}

function loadSections(data) {
  // Limpiamos los selects
  clearSelects()
  // Cargamos la opción por defecto
  sectionsList.appendChild(createOpt('', 'Seleccione una sección'))
  subsectionsList.appendChild(createOpt('', 'Seleccione una subsección'))
  // Cargas los selects
  loadLists(data['sections'], sectionsList)
  // limpiamos los contenedores de las series y subseries
  clearSeriesAndSubseries()
  // Carga las series y subseries documentales
  renderizeCheckBoxes(data['series'], seriesChecks, "series", "serie-")
  renderizeCheckBoxes(data['subseries'], subseriesChecks, "subseries", "subserie-")
}

function renderizeCheckBoxes(arr, element, name, sufix) {
  arr.forEach((item) => {
    element.appendChild(createCheckBox(item.id, item.name, name, sufix))
  })
}

function createCheckBox(id, labelText, name, sufix) {
  const div = document.createElement('div')
  div.classList.add('form-check')
  const input = document.createElement('input')
  input.classList.add('form-check-input')
  input.type = "checkbox"
  input.id = sufix+id
  input.value = id
  const label = document.createElement('label')
  label.classList.add('form-check-label')
  label.setAttribute('for', sufix+id)
  label.textContent = labelText
  input.name = name
  // Agregamos el input y el label dentro del div
  div.appendChild(input)
  div.appendChild(label)
  return div
}

// Limpiar los selects del formulario
function clearSelects() {
  sectionsList.innerHTML = ''
  subsectionsList.innerHTML = ''
}

// Limpiar divs de series y subseries
function clearSeriesAndSubseries() {
  seriesChecks.innerHTML = ''
  subseriesChecks.innerHTML = ''
}

// Crear opciones de los selects
function createOpt(id, name) {
  let opt = document.createElement('option')
  opt.value = id
  opt.innerHTML = name
  return opt
}

// Añadir dentro de un select las opciones consultadas en la BD 
function loadLists(arr, listObj) {
  arr.forEach(item => {
    listObj.appendChild(createOpt(item.id, item.name))
  });
}

// Función que inicializa la tabla 
(async() => {
  const data = await getAllBoxes()
  await generateTable(data)
})()

