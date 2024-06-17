import { ClipboardRecord } from "@/types/clipboard";
import { addRecordContent } from "../db/database";
import { clipboard, BrowserWindow } from "electron";

let previousText = "";

export async function startClipboardMonitoring(mainWindow: BrowserWindow) {
  previousText = clipboard.readText();
  setInterval(() => checkClipboard(mainWindow), 1000);
}

async function checkClipboard(mainWindow: BrowserWindow) {
  const text = clipboard.readText();
  if (text !== previousText) {
    previousText = text;
    const timestamp = new Date().toISOString();

    try {
      const id = await addRecordContent(text, timestamp);
      console.log("Record added successfully, and id:", id);

      const clipboardRecord: ClipboardRecord = {
        id: id,
        content: text,
        timestamp: timestamp,
      };
      if (mainWindow) {
        mainWindow.webContents.send("clipboard-changed", clipboardRecord);
      }
    } catch (error) {
      console.error("Error adding record:", error);
    }
  }
}
