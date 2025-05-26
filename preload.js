const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  runscrapper: (param1, param2, param3, param4) =>
    ipcRenderer.invoke("run-scrapper", param1, param2, param3, param4),
});
