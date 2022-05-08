function toggleTheme () {
  const theme = localStorage.getItem('theme') ? localStorage.getItem('theme') : 'dark'
  const newTheme = theme === 'dark' ? 'light' : 'dark'
  localStorage.setItem('theme', newTheme)
  setTheme(newTheme)
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
}

const theme = localStorage.getItem('theme') ? localStorage.getItem('theme') : 'dark'
setTheme(theme)
