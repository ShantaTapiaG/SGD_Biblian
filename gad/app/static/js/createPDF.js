function generatePDF(responseData, personData) {
  // Importar jsPDF
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const title = "DETALLES DE PRÉSTAMO DE DOCUMENTO"
  const pageWidth = doc.internal.pageSize.width;  // Ancho de la página
  const textWidth = doc.getTextWidth(title);      // Ancho del texto

  // Calcular la posición X para centrar el texto
  const xPosition = (pageWidth - textWidth - 14) / 2;  // Centrado
  const maxWidth = 180
  let yPosition = 20; 
  // Agregar título
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(title, xPosition, yPosition);
  
  yPosition += 15; 
  // Datos del archivo
  doc.setFontSize(12);
  doc.text("INFORMACIÓN DEL DOCUMENTO", 14, yPosition);
  yPosition += 5; 
  doc.setFont("helvetica", "bold"); // Negrita
  doc.text(`Nombre:`, 14, yPosition);
  yPosition += 5; 
  doc.setFont("helvetica", "normal");
  doc.text(`${responseData.docfile.name}`, 14, yPosition);
  yPosition += 5; 
  doc.setFont("helvetica", "bold"); // Negrita
  doc.text(`Tipo:`, 14, yPosition);
  yPosition += 5; 
  doc.setFont("helvetica", "normal");
  doc.text(`${responseData.docfile.type}`, 14, yPosition);
  yPosition += 5; 
  doc.setFont("helvetica", "bold"); // Negrita
  doc.text(`Descripción:`, 14, yPosition);
  yPosition += 5; 
  doc.setFont("helvetica", "normal");
  // Puedes ajustar esto según donde quieras empezar
  let lines = doc.splitTextToSize(responseData.docfile.description, maxWidth);  
  // Dibuja cada línea de texto en la página
  lines.forEach(line => {
    doc.text(line, 14, yPosition);
    yPosition += 5;  // Ajusta la distancia entre líneas (puedes cambiar 10 por el valor que prefieras)
  });
   
  doc.setFont("helvetica", "bold"); // Negrita
  doc.text(`Fecha de Creación:`, 14, yPosition);
  yPosition += 5; 
  doc.setFont("helvetica", "normal");
  doc.text(`${responseData.docfile.created_date}`, 14, yPosition);
  
  yPosition += 10; 
  // Datos de la caja
  doc.setFont("helvetica", "bold"); // Negrita
  doc.text("INFORMACIÓN DE LA CAJA", 14, yPosition);
  yPosition += 5; 
  doc.text(`Número:`, 14, yPosition);
  yPosition += 5; 
  doc.setFont("helvetica", "normal");
  doc.text(`${responseData.box.number}`, 14, yPosition);
  yPosition += 5; 
  doc.setFont("helvetica", "bold"); // Negrita
  doc.text(`Sección:`, 14, yPosition);
  yPosition += 5; 
  doc.setFont("helvetica", "normal");
  doc.text(`${responseData.box.section}`, 14, yPosition);
  yPosition += 5; 
  doc.setFont("helvetica", "bold"); // Negrita
  doc.text(`Subsección:`, 14, yPosition);
  yPosition += 5; 
  doc.setFont("helvetica", "normal");
  doc.text(`${responseData.box.subsection}`, 14, yPosition);
  yPosition += 5; 
  doc.setFont("helvetica", "bold"); // Negrita
  doc.text(`Serie:`, 14, yPosition);
  yPosition += 5; 
  doc.setFont("helvetica", "normal");
  // Puedes ajustar esto según donde quieras empezar
  lines = doc.splitTextToSize(responseData.box.series, maxWidth);  
  // Dibuja cada línea de texto en la página
  lines.forEach(line => {
    doc.text(line, 14, yPosition);
    yPosition += 5;  // Ajusta la distancia entre líneas (puedes cambiar 10 por el valor que prefieras)
  });
  
  doc.setFont("helvetica", "bold"); // Negrita
  doc.text(`Subserie:`, 14, yPosition);
  doc.setFont("helvetica", "normal");

  // Puedes ajustar esto según donde quieras empezar
  yPosition += 5
  lines = doc.splitTextToSize(responseData.box.subseries, maxWidth);
  // Dibuja cada línea de texto en la página
  lines.forEach(line => {
    doc.text(line, 14, yPosition);
    yPosition += 5;
  });

  doc.setFont("helvetica", "bold"); // Negrita
  doc.text(`Fecha Inicial:`, 14, yPosition);
  yPosition += 5
  doc.setFont("helvetica", "normal");
  doc.text(`${responseData.box["initial date"]}`, 14, yPosition);
  yPosition += 5
  doc.setFont("helvetica", "bold"); // Negrita
  doc.text(`Fecha Final:`, 14, yPosition);
  yPosition += 5
  doc.setFont("helvetica", "normal");
  doc.text(`${responseData.box["final date"]}`, 14, yPosition);
  
  // Datos de la persona que solicita el préstamo
  yPosition += 10
  doc.setFont("helvetica", "bold"); // Negrita
  doc.text("DATOS DEL SOLICITANTE", 14, yPosition);
  yPosition += 5
  doc.text(`Nombre:`, 14, yPosition);
  yPosition += 5
  doc.setFont("helvetica", "normal");
  doc.text(`${personData.name}`, 14, yPosition);
  yPosition += 5
  doc.setFont("helvetica", "bold"); // Negrita
  doc.text(`Cédula:`, 14, yPosition);
  yPosition += 5
  doc.setFont("helvetica", "normal");
  doc.text(`${personData.dni}`, 14, yPosition);
  yPosition += 5
  doc.setFont("helvetica", "bold"); // Negrita
  doc.text(`Teléfono:`, 14, yPosition);
  yPosition += 5
  doc.setFont("helvetica", "normal");
  doc.text(`${personData.telephone}`, 14, yPosition);
  yPosition += 5
  doc.setFont("helvetica", "bold"); // Negrita
  doc.text(`Dirección:`, 14, yPosition);
  yPosition += 5
  doc.setFont("helvetica", "normal");
  doc.text(`${personData.address}`, 14, yPosition, {maxWidth});
  
  // Fecha de emisión
  const today = new Date();
  // Fecha en formato dd/mm/yyyy
  const formattedDate = today.toLocaleDateString();  
  const formattedTime = today.toLocaleTimeString();

  // Posición de la fecha al pie de la página (ajustamos 'y' cerca del pie)
  const footerY = doc.internal.pageSize.height - 15;  // 25 es el margen desde el pie de la página
  // Footer text
  let footerText = `Emisión: ${formattedDate} Hora: ${formattedTime}`
  // Ajuste para alinearla a la derecha
  const dateX = pageWidth - doc.getTextWidth(footerText); 
  doc.setFontSize(10);
  // Agregar la fecha al pie (alineada a la derecha)
  doc.text(footerText, dateX, footerY);

  // Definir el ancho de la línea de firma (por ejemplo, 100 mm)
  const lineWidth = 100; 

  // Calcular la posición inicial X para centrar la línea
  const lineStartX = (pageWidth - lineWidth) / 2; 

  // Definir la posición Y de la línea (puedes ajustarla)
  const lineY = yPosition + 40; 

  // Dibujar la línea centrada
  doc.line(lineStartX, lineY, lineStartX + lineWidth, lineY); 

  // Incluir texto sobre la línea de firma
  doc.setFont('helvetica', 'italic');
  doc.text(personData.name, pageWidth / 2, lineY + 5, null, null, 'center'); // Texto centrado sobre la línea
  // Guardar el PDF
  doc.save(`Archivo - ${responseData.docfile.name} - ${personData.name} - ${personData.dni} - ${formattedDate} - ${formattedTime}.pdf`);
}
