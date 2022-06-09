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

function yearDelta (delta) {
  return delta < 1 ? '&lt; 1 yr' : delta === 1 ? '&gt; 1 yr' : `&gt; ${ delta } yrs`
}

window.addEventListener('load', function () {
  document.querySelectorAll('.timer').forEach(timer => {
    const delta = Math.floor((new Date() - Date.parse(`01 Jan ${ timer.title }`)) / (1000 * 60 * 60 * 24 * 365))
    timer.innerHTML = yearDelta(delta)
  })
  document.querySelectorAll('.workexp').forEach(workexp => {
    const period = workexp.title.split(':').map(x => parseInt(x))
    const delta = (period[ 1 ] ? period[ 1 ] : new Date().getFullYear()) - period[ 0 ]
    workexp.innerHTML = yearDelta(delta) + (period[ 1 ] ? '' : ' (I currently work here)')
  })
})
