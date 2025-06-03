const bar = document.querySelector('#bar')
const collapse = document.querySelector('#collapse')
const navBg = document.querySelector('.nav-bg')

bar.onclick = (e) => {
  collapse.classList.toggle('collapse')
  navBg.classList.toggle('hide-bg')
}

navBg.onclick = (e) => {
  collapse.classList.toggle('collapse')
  e.target.classList.toggle('hide-bg')
}