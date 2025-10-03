const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("agent", {
  getDeviceInfo: () => ipcRenderer.invoke("agent:getDeviceInfo"),
  saveLocation: (loc) => ipcRenderer.invoke("agent:saveLocation", loc),
  deleteFile: () => ipcRenderer.invoke("agent:deleteFile")
});
