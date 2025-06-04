// Objeto para cambiar los nombres del ingles al español
const cardsName = {
  boxes: ["Cajas", `<i class="fa-solid fa-box-open"></i>`],
  sections: ["Secciones", `<i class="fa-solid fa-rectangle-list"></i>`],
  subsections: ["Subsecciones", `<i class="fa-solid fa-ticket"></i>`],
  series: ["Series", `<i class="fa-solid fa-layer-group"></i>`],
  subseries: ["Subseries", `<i class="fa-solid fa-address-book"></i>`],
  files: ["Archivos", `<i class="fa-solid fa-file-pdf"></i>`],
};

function getProps(obj) {
  const keys = Object.keys(obj);
}
/// Datos de las cards
const cards = [[]];

async function getData() {
  return await (await fetch("/gad/counter", { method: "GET" })).json();
}

function createCards() {}

(async () => {
  const container = document.querySelector("#container");
  const data = await getData();
  const keys = Object.keys(cardsName);
  let cards = "";
  console.log(data);

  keys.forEach((key, i) => {
    let arr = cardsName[key];
    cards += `
      <div class="card">
        <div class="card-header">
          <div>${arr[0]}</div>
          <div>${arr[1]}</div>
        </div>
        <div class="card-body">${data[key]}</div>
      </div>
      `;
  });
  container.innerHTML = cards;
})();
