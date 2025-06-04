

const createRow = function (rowData){  
  return `
      <tr>
        <td></td>
        <td>${rowData}</td>
        <td>${rowData}</td>
        <td>${rowData}</td>
        <td>${rowData}</td>
        <td>${rowData}</td>
        <td>${rowData}</td>
        <td>${rowData}</td>
        <td>${rowData}</td>
        <td>
          <div class="btns">
            <button data-id="1" type="button" class="btn btn-dark">
              <i class="fa-regular fa-rectangle-list icon-row"></i>
            </button>
            <button data-id="1" type="button" class="btn btn-primary">
              <i class="fa-solid fa-pen-to-square icon-row"></i>
            </button>
            <button data-id="1" type="button" class="btn btn btn-danger btn-row">
              <i class="fa-solid fa-trash-can icon-row"></i>
            </button>
          </div>
        </td>
      </tr>
    `
}

const renderRows = function(object){
  let body = ''
  object.forEach(row => {
    body += createRow(row)
  });
  return body
}