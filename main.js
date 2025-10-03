const { app, BrowserWindow, ipcMain, dialog, desktopCapturer } = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");
const disk = require("diskusage");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  mainWindow.loadFile("index.html");
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// --- LOGGING ---
function appendLog(entry) {
  const logFile = path.join(__dirname, "agent_approvals_log.json");
  let data = [];
  if (fs.existsSync(logFile)) {
    try {
      data = JSON.parse(fs.readFileSync(logFile, "utf-8"));
    } catch {
      data = [];
    }
  }
  data.push({ timestamp: new Date().toISOString(), ...entry });
  fs.writeFileSync(logFile, JSON.stringify(data, null, 2));
}

// --- DEVICE INFO ---
ipcMain.handle("agent:getDeviceInfo", async () => {
  let diskInfo;
  try {
    const pathCheck = os.platform() === "win32" ? "C:" : "/";
    diskInfo = await disk.check(pathCheck);
  } catch (e) {
    diskInfo = { error: e.message };
  }

  const info = {
    deviceName: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    totalMem: os.totalmem(),
    freeMem: os.freemem(),
    network: os.networkInterfaces(),
    disk: diskInfo
  };

  appendLog({ action: "device-info" });
  return info;
});

// --- LOCATION SNAPSHOT ---
ipcMain.handle("agent:saveLocation", async (_, location) => {
  const file = path.join(__dirname, "location.json");
  fs.writeFileSync(file, JSON.stringify(location, null, 2));
  appendLog({ action: "location-saved", location });
  return { success: true, file };
});

// --- FILE DELETE ---
ipcMain.handle("agent:deleteFile", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: "Select file/folder to delete",
    properties: ["openFile", "openDirectory"]
  });
  if (canceled || filePaths.length === 0) return { success: false, message: "No file selected." };

  const target = filePaths[0];
  try {
    fs.rmSync(target, { recursive: true, force: true });
    appendLog({ action: "delete", target });
    return { success: true, message: `Deleted: ${target}` };
  } catch (err) {
    appendLog({ action: "delete-failed", target, error: err.message });
    return { success: false, message: `Failed: ${err.message}` };
  }
});

// --- SCREENSHOT (HQ) ---
ipcMain.handle("agent:takeScreenshot", async () => {
  const sources = await desktopCapturer.getSources({
    types: ["screen"],
    thumbnailSize: { width: 1920, height: 1080 }
  });
  appendLog({ action: "screenshot" });
  return sources[0].thumbnail.toDataURL();
});
