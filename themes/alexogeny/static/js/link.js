document.querySelectorAll('a').forEach(
  (x) => {
    if (x.hostname && x.hostname !== window.location.hostname && x.innerText.length > 2) {
      x.classList.add('external')
      x.setAttribute('rel', ' noopener')
    }
  })
