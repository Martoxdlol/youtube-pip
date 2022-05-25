const { ipcRenderer, clipboard } = require('electron');
const validCodeFromUrl = require('./src/validCodeFromUrl');


function send(action, param) {
    ipcRenderer.send(action, param)
}


ipcRenderer.on('code', (event, code) => {
    document.getElementById('url-input').value = 'https://www.youtube.com/watch?v=' + encodeURIComponent(code)
    window.youtubeVideoCODE = code
    startView()
})


ipcRenderer.on('no-click-throught', () => {
    document.getElementById('click-throught').innerText = 'Click throught'
})

window.youtubeVideoCODE = null

window.closeWindow = () => send('close')
window.minimize = () => send('minimize')
window.toggleMenu = () => {
    if (!window.youtubeVideoCODE) return
    if (document.getElementById('app-menu').classList.contains('no-display')) {
        document.getElementById('app-menu').classList.remove('no-display')
        document.getElementById('window-menu').classList.remove('opacity-0')
    } else {
        document.getElementById('app-menu').classList.add('no-display')
        document.getElementById('window-menu').classList.add('opacity-0')
    }
}

function setUiState() {
    if (window.youtubeVideoCODE) {
        document.getElementById('window-menu').classList.add('opacity-0')
        document.getElementById('app-menu').classList.add('no-display')
    } else {
        document.getElementById('app-menu').classList.remove('no-display')
        document.getElementById('window-menu').classList.remove('opacity-0')
    }
}

function makeEmbedUrl(code) {
    return "https://www.youtube.com/embed/" + encodeURIComponent(code) + '?autoplay=true'
}

window.submitGo = e => {
    e.preventDefault()
    const url = document.getElementById('url-input').value
    const code = testClipboardCode(url)
    if (code) {
        window.youtubeVideoCODE = code
        startView()
    }
}

function startView() {
    const embedUrl = makeEmbedUrl(window.youtubeVideoCODE)
    document.getElementById('player').src = embedUrl
    document.getElementById('player').onload = () => {
        setUiState()
    }
}

function testClipboardCode() {
    const text = clipboard.readText()
    return validCodeFromUrl(text)
}

async function fetchVideoInfo(code) {
    const r = await fetch('https://noembed.com/embed?url=' + encodeURIComponent('https://www.youtube.com/watch?v=' + encodeURIComponent(code)), {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    })
    return await r.json()
}

let lastClipCode = null
const clipboardAuto = async () => {
    const code = testClipboardCode()
    if (lastClipCode == code) return
    lastClipCode = code

    if (code) {
        const details = await fetchVideoInfo(code)
        console.log(details)
        if (details.error) return
        document.getElementById('clipboard-video').classList.remove('no-display')
        document.getElementById('clipboard-video-image').src = details.thumbnail_url
        document.getElementById('clipboard-video-title').innerText = details.title
        document.getElementById('clipboard-video-author').innerText = details.author_name
        document.getElementById('clipboard-video').onclick = () => {
            document.getElementById('url-input').value = 'https://www.youtube.com/watch?v=' + encodeURIComponent(code)
            window.youtubeVideoCODE = code
            startView()
            // send('height', window.innerHeight * (details.height / details.width))
            // Resize window
        }
    } else {
        document.getElementById('clipboard-video').classList.add('no-display')
        document.getElementById('clipboard-video').onclick = null
    }
}

window.addEventListener('load', e => {
    setInterval(clipboardAuto, 2500)
    setTimeout(clipboardAuto, 10)

    document.getElementById('close-menu').onclick = window.toggleMenu
    document.getElementById('select-video').onclick = () => send('select-from-youtube')

    const opcty = document.getElementById('opacity')
    const changeOpacity = () => send('opacity', parseInt(opcty.value) / 100)
    opcty.onchange = changeOpacity
    opcty.onmousemove = changeOpacity

    document.getElementById('url-input').oncontextmenu = e => {
        const cm = document.getElementById('contextmenu')
        cm.classList.remove('no-display')
        cm.style.left = e.pageX + 'px'
        cm.style.top = e.pageY + 'px'

        let closeCM = () => {
            cm.classList.add('no-display')
            window.removeEventListener('click', closeCM)
        }
        window.addEventListener('click', closeCM)
    }
})


function pasteClip() {
    const text = clipboard.readText()
    document.getElementById('url-input').value = text
}

function clickThrought() {
    send('click-throught')
    document.getElementById('click-throught').innerText = 'Control+F8'
}

//https://www.youtube.com/watch?v=9jtr7cRqV1c