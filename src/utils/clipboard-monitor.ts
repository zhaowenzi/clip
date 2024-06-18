import { ClipboardRecord } from "@/types/clipboard";
import { addRecordContent } from "../db/database";
import { clipboard, BrowserWindow } from "electron";

let previousText = "";
let clipboardInterval: NodeJS.Timeout | null = null;

export async function startClipboardMonitoring(mainWindow: BrowserWindow) {
  previousText = clipboard.readText();
  clipboardInterval = setInterval(() => checkClipboard(mainWindow), 1000);
}

function isEmptyOrWhitespace(str: string) {
  if (str === null || str === undefined) {
    return true;
  }
  return str.trim().length === 0;
}

async function checkClipboard(mainWindow: BrowserWindow) {
  const text = clipboard.readText();
  if (!isEmptyOrWhitespace(text) && text !== previousText) {
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

export function removeClipboardMonitoring() {
  if (clipboardInterval !== null) {
    clearInterval(clipboardInterval);
    clipboardInterval = null;
    console.log("Clipboard monitoring stopped.");
  }
}
