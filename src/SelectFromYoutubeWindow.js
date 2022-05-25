const { app, BrowserWindow, ipcMain, webFrameMain } = require('electron');
const validCodeFromUrl = require('./validCodeFromUrl');

module.exports = function openSelectFromYoutube(winController) {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: true,
        backgroundColor: '#282828',
    })

    // Disable menu bar on windows
    mainWindow.menuBarVisible = true

    // and load the index.html of the app.
    mainWindow.loadURL('https://www.youtube.com/')

    const locationChangeTestIsYoutube = (event, url) => {
        const code = validCodeFromUrl(url)
        if (code) {
            event.preventDefault()
            mainWindow.close()
            winController.loadCode(code)
        }
    }

    mainWindow.setAlwaysOnTop(true)

    mainWindow.webContents.on('will-navigate', locationChangeTestIsYoutube)
    mainWindow.webContents.on('did-navigate-in-page', locationChangeTestIsYoutube)
    mainWindow.webContents.on('will-navigate', (event, url) => {
        event.preventDefault()
        const code = validCodeFromUrl(url)
        if (code) {
            global.createPipViewer(code)
        } else {
            exec("start " + url + "")
        }
    })

    winController.mainWindow.on('close', () => {
        try {
            mainWindow.close()
        } catch (error) { }
    })

    return mainWindow
}