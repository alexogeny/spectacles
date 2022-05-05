function isLightModeEnabled(){
  const enabled = localStorage.getItem('lightModeEnabled')
  return !(enabled === null || parseInt(enabled) === 0)
}

function setThemeDisabled(name, state) {
  document.getElementById(`style-${name}`).disabled = state
}

function toggleThemeChooserContent() {
  const newState = isLightModeEnabled() ? "🌔" : "🌒"
  document.getElementById('themeChooser').innerHTML = newState
}

let lightModeEnabled = isLightModeEnabled()
setThemeDisabled('light', !lightModeEnabled)
setThemeDisabled('dark', lightModeEnabled)

function toggleTheme () {
  lightModeEnabled = isLightModeEnabled()
  localStorage.setItem('lightModeEnabled', lightModeEnabled === false ? 1 : 0)
  const newState = isLightModeEnabled()
  setThemeDisabled('light', !newState)
  setThemeDisabled('dark', newState)
  toggleThemeChooserContent()
}
