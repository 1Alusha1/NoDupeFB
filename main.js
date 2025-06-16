const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

const scrapper = require("./fbscrap/index.js");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile("index.html");
};

app.whenReady().then(() => {
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length !== 0) createWindow();
  });
});

ipcMain.handle("run-scrapper", async (event, ids, type) => {
  return scrapper(ids, type);
});
