const language = {
  decimal: "",
  emptyTable: "No hay información",
  info: "Mostrando _START_ a _END_ de _TOTAL_ Entradas",
  infoEmpty: "Mostrando 0 to 0 of 0 Entradas",
  infoFiltered: "(Filtrado de _MAX_ total entradas)",
  infoPostFix: "",
  thousands: ",",
  lengthMenu: "Mostrar _MENU_ Entradas",
  loadingRecords: "Cargando...",
  processing: "Procesando...",
  search: "Buscar:",
  zeroRecords: "Sin resultados encontrados",
  paginate: {
    next: "Siguiente",
    previous: "Anterior",
  },
}

new DataTable("#myTable", {
  responsive: true,
  language,
  columnDefs: [
    {responsivePriority: 1, targets: 9},
    { 
      orderable: false, 
      targets: 0 
    } // Evitar que la columna de numeración sea ordenable
  ],
  order: [[1, 'asc']], // Ordenar por la segunda columna (Nombre)
  rowCallback: function(row, data, index) {
    $('td:eq(0)', row).html(index + 1); // Insertar numeración en la primera columna
  }
})

new DataTable("#boxes-files", {
  responsive: true,
  language: {
    decimal: "",
    emptyTable: "No hay información",
    info: "Mostrando _START_ a _END_ de _TOTAL_ Entradas",
    infoEmpty: "Mostrando 0 to 0 of 0 Entradas",
    infoFiltered: "(Filtrado de _MAX_ total entradas)",
    infoPostFix: "",
    thousands: ",",
    lengthMenu: "Mostrar _MENU_ Entradas",
    loadingRecords: "Cargando...",
    processing: "Procesando...",
    search: "Buscar:",
    zeroRecords: "Sin resultados encontrados",
    paginate: {
      next: "Siguiente",
      previous: "Anterior",
    },
  },
  columnDefs: [
    {responsivePriority: 1, targets:5},
    { 
      orderable: false, 
      targets: 0 
    } // Evitar que la columna de numeración sea ordenable
  ],
  order: [[1, 'asc']], // Ordenar por la segunda columna (Nombre)
  rowCallback: function(row, data, index) {
    $('td:eq(0)', row).html(index + 1); // Insertar numeración en la primera columna
  }
})