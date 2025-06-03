function getCSRFToken() {
  return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
  
}


function POSTRequest(url, data , successFn, errorFn) {
  fetch(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken()
    },
    credentials: 'same-origin',
    body: JSON.stringify(data)
  })
  .then(response => response.json()) // Parseamos la respuesta como JSON
  .then(data => {
    successFn(data)
  })
  .catch(error => {
    errorFn(error)
  })
}

function POSTFormDataReq(url, formData , successFn, errorFn) {
  fetch(url, {
    method: 'POST',
    headers: {
      'X-CSRFToken': getCSRFToken()
    },
    credentials: 'same-origin',
    body: formData 
  })
  .then(response => response.json())  // Parseamos la respuesta como JSON
  .then(data => {
    successFn(data)
  })
  .catch(error => {
    errorFn(error)
  })
}
