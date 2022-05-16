function checkTheme () {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  return localStorage.getItem('theme') ? localStorage.getItem('theme') : prefersDark ? 'dark' : 'light'
}

function toggleTheme () {
  const theme = checkTheme()
  const newTheme = theme === 'dark' ? 'light' : 'dark'
  localStorage.setItem('theme', newTheme)
  setTheme(newTheme)
}

const setTheme = (theme) => document.documentElement.setAttribute('data-theme', theme)

setTheme(checkTheme())

window.onload = function () {
  const readBar = document.querySelector('#readBar')
  const contentElement = document.querySelector('#readScroller')
  contentElement.addEventListener('scroll', e => {
    let width = contentElement.scrollTop / (contentElement.scrollHeight - contentElement.clientHeight) * 100
    readBar.style.setProperty('width', `${ width }%`)
  })
}
