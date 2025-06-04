const errorMsg = `
Contraseña debe tener:<br><br>
  - Al menos una letra mayúscula<br>
  - Al menos un número<br>
  - Al menos un carácter especial (@, #, $, %, _)<br>
  - Mínimo 8 caracteres permitidos
  - No incluya espacios en blanco`;

document
  .getElementById("updateForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    Swal.fire({
      title: "¿Deseas actualizar el usuario?",
      text: "Recuerda que esta acción no se puede deshacer",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, actualizar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        let pwd = this["password"].value;
        if(sendEmptySpaces(pwd)) {
          Swal.fire({
            title: "Atención",
            text:'Envie contraseña válida, no espacios vacios',
            icon: "error",
            showCancelButton: false,
            confirmButtonColor: "#3085d6",
            confirmButtonText: "Ok, entiendo",
          });
          return
        }

        let noSpaces = this["password"].value.replace(/\s+/g, "");
        this['password'].value = noSpaces
      
        if (noSpaces !== "") {
          if (!validatePassword(noSpaces)) {
            Swal.fire({
              title: "Atención",
              html:
                '<p style="display: flex; justify-content: center;"><span style="width: fit-content; text-align: left">' +
                errorMsg +
                "</span></p>",
              icon: "error",
              showCancelButton: false,
              confirmButtonColor: "#3085d6",
              confirmButtonText: "Ok, entiendo",
            });
          } else {
            this.submit();
          }
        } else {
          this.submit();
        }
      }
    });
  });

function validatePassword(password) {
  const strongPasswordRegex =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%_])[A-Za-z\d@#$%_]{8,}$/;

  return strongPasswordRegex.test(password);
}

function sendEmptySpaces(text) {
  let totalSpaces = (text.match(/\s/g) || []).length;
  console.log(totalSpaces, text.length)

  if(text.length === 0 && totalSpaces === 0) {
    return false
  } 
  
  return text.length === totalSpaces

}