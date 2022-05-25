const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const PipViewerWindowController = require('./PipViewerWindowController');
const { exec } = require('child_process')
const validCodeFromUrl = require('./validCodeFromUrl')
const openSelectFromYoutube = require('./SelectFromYoutubeWindow')

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    // eslint-disable-line global-require
    app.quit();
}

const pipViewersWindows = {}

function createPipViewer(initialCode) {
    const winController = new PipViewerWindowController()

    const id = winController.createWindow()

    pipViewersWindows[id] = winController

    winController.mainWindow.webContents.on('will-navigate', (event, url) => {
        if (url === 'http://localhost:8080/__localfile__/index.html') return
        event.preventDefault()
        const code = validCodeFromUrl(url)
        if (code) {
            winController.loadCode(code)
        } else {
            exec("start " + url + "")
        }
    })

    winController.mainWindow.webContents.on('new-window', (event, url) => {
        event.preventDefault()
        exec("start " + url + "")
    })

    if (initialCode) {
        winController.loadCode(initialCode)
    }
}

global.createPipViewer = createPipViewer


function viewerOn(eventName, callback) {
    ipcMain.on(eventName, (event, arg) => {
        callback(pipViewersWindows[event.sender.id], arg, event)
    })
}

viewerOn('minimize', viewer => {
    viewer.mainWindow.minimize()
})

viewerOn('maximize', viewer => {
    viewer.mainWindow.maximize()
})

viewerOn('close', viewer => {
    viewer.mainWindow.close()
    delete pipViewersWindows[viewer.id]
})

viewerOn('select-from-youtube', viewer => {
    openSelectFromYoutube(viewer)
})

viewerOn('opacity', (viewer, opacity) => {
    viewer.mainWindow.setOpacity(opacity)
})

viewerOn('height', (viewer, h) => {
    viewer.mainWindow.setSize(viewer.mainWindow.getBounds().width, parseInt(h))
})

viewerOn('click-throught', (viewer, arg, event) => {
    viewer.mainWindow.setIgnoreMouseEvents(true)
    globalShortcut.register('CommandOrControl+F8', () => {
        viewer.mainWindow.setIgnoreMouseEvents(false)
        globalShortcut.unregister('CommandOrControl+F8')
        event.sender.send('no-click-throught')
    })
})



// ipcMain.on('maximize', (event, arg) => {
//     pipViewersWindows[event.sender.id].mainWindow.maximize()
// })


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => createPipViewer());

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createPipViewer();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
