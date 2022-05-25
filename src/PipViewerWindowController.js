const path = require('path')
const { BrowserWindow } = require('electron')

const URL_TO_BE_INTERCEPTED_BASE = 'http://localhost:8080/__localfile__/'

module.exports = class PipViewerWindowController {
    constructor() {
    }

    createWindow() {
        // Create the browser window.
        const mainWindow = new BrowserWindow({
            width: 480,
            height: 270,
            frame: false,
            webPreferences: {
                nodeIntegration: true,
                nodeIntegrationInSubFrames: true,
                webviewTag: true,
                contextIsolation: false,
                autoplayPolicy: 'no-user-gesture-required',
            },
            backgroundColor: '#282828',
        })
        this.mainWindow = mainWindow

        mainWindow.setAlwaysOnTop(true)

        // Disable menu bar on windows
        mainWindow.menuBarVisible = false

        // tricks youtube to load some protected videos on the view anyways
        this.setSessionInterceptProtocol(mainWindow.webContents.session)

        // and load the index.html of the app.
        mainWindow.loadURL(URL_TO_BE_INTERCEPTED_BASE + 'index.html')

        // Open the DevTools.
        mainWindow.webContents.openDevTools()


        mainWindow.on('resize', event => {
            const bounds = mainWindow.getBounds()
            let w = 1
            if(bounds.width < 350) {
                w = bounds.width / 350
            } 
            if(bounds.height < 220) {
                const h = bounds.height / 220
                if(h < w) w = h
            } 
            mainWindow.webContents.setZoomFactor(w)
        })


        return mainWindow.webContents.id
    }

    loadCode(code) {
        this.mainWindow.webContents.on('did-finish-load', () => {
            this.mainWindow.webContents.send('code', code)
        })
        this.mainWindow.webContents.send('code', code)
    }

    setSessionInterceptProtocol(session) {
        session.protocol.interceptFileProtocol('http', (request, callback) => {
            const enabledFiles = new Set(['index.html', 'css/index.css', 'webjs/main.js'])


            let finalPath = ''
            if (request.url.search(URL_TO_BE_INTERCEPTED_BASE) === 0) {
                const filePath = request.url.replace(URL_TO_BE_INTERCEPTED_BASE, '')
                if (enabledFiles.has(filePath)) {
                    finalPath = filePath
                    callback(path.join(__dirname, finalPath))
                    return
                }
            }

            console.log(request.url, '==>', finalPath)


            session.protocol.uninterceptProtocol('http')
        })

        const filter = {
            urls: ['https://www.youtube.com/*']
        }

        session.webRequest.onHeadersReceived(filter, (details, callback) => {
            for (const header in details.responseHeaders) {
                if (header.toLocaleLowerCase() === 'x-frame-options') {
                    delete details.responseHeaders[header];
                }
            }
            callback({ cancel: false, responseHeaders: details.responseHeaders });
        })
    }
}