// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    on(channel: string, func: (...args: any[]) => void) {
      const validChannels = ["window-resize", "clipboard-changed"];
      if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, (event: IpcRendererEvent, ...args: any[]) =>
          func(...args)
        );
      }
    },
    removeListener(channel: string, func: (...args: any[]) => void) {
      const validChannels = ["clipboard-changed"];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async invoke(channel: string, ...args: any[]) {
      const validChannels = ["get-clipboard-contents", "get-clipboard-total"];
      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, ...args);
      }
    },
  },
});
