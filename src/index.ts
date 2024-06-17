import { app, BrowserWindow, ipcMain } from "electron";
import {
  getClipboardContents,
  getTotalRecordCount,
  initializeDatabase,
} from "./db/database";
import { startClipboardMonitoring } from "./utils/clipboard-monitor";
// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = (): void => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 730,
    width: 900,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.on("resize", () => {
    const size = mainWindow.getSize();
    mainWindow.webContents.send("window-resize", size);
  });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  startClipboardMonitoring(mainWindow);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  initializeDatabase();
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
ipcMain.handle(
  "get-clipboard-contents",
  async (event, page: number, pageSize: number) => {
    try {
      const contents = await getClipboardContents(page, pageSize);
      return contents;
    } catch (error) {
      console.error("Failed to get clipboard contents:", error);
      throw error;
    }
  }
);

ipcMain.handle(
  "get-clipboard-total",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (event) => {
    try {
      const total = await getTotalRecordCount();
      return total;
    } catch (error) {
      console.error("Failed to get clipboard total:", error);
      throw error;
    }
  }
);