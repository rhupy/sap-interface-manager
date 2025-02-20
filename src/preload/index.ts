import { contextBridge } from "electron";

// 여기에 필요한 API를 노출시킬 수 있습니다
contextBridge.exposeInMainWorld("electronAPI", {
  // 예시:
  // platform: process.platform
});
