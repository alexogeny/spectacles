function toggleTheme () {
  const theme = localStorage.getItem('theme') ? localStorage.getItem('theme') : 'dark'
  const newTheme = theme === 'dark' ? 'light' : 'dark'
  localStorage.setItem('theme', newTheme)
  setTheme(newTheme)
}

function setTheme (theme) {
  document.documentElement.setAttribute('data-theme', theme)
}

const theme = localStorage.getItem('theme') ? localStorage.getItem('theme') : 'dark'
setTheme(theme)

window.onload = function () {
  const readBar = document.querySelector('#readBar')
  const contentElement = document.querySelector('#readScroller')
  contentElement.addEventListener('scroll', e => {
    let width = contentElement.scrollTop / (contentElement.scrollHeight - contentElement.clientHeight) * 100
    readBar.style.setProperty('width', `${ width }%`)
  })
}
