import { contextBridge, ipcRenderer } from 'electron'

import type { ElectronApi } from '../types/ipc'

const electronAPI : ElectronApi = {
  // 示例API
  ping: () => ipcRenderer.send('ping'),
  onPong: (callback: (message: string) => void) => {
    ipcRenderer.on('pong', (_, message) => callback(message))
  },

  // 用户管理API
  userRegister: (data: any) => ipcRenderer.invoke('user:register', data),
  userLogin: (data: any) => ipcRenderer.invoke('user:login', data),
  userInfoGet: (data: any) => ipcRenderer.invoke('user:info:get', data),
  userInfoUpdate: (data: any) => ipcRenderer.invoke('user:info:update', data),
  userPasswordUpdate: (data: any) => ipcRenderer.invoke('user:password:update', data),

  // 根口令管理API
  rootPasswordSet: (data: any) => ipcRenderer.invoke('root:password:set', data),
  rootPasswordUpdate: (data: any) => ipcRenderer.invoke('root:password:update', data),
  rootPasswordStatus: (data: any) => ipcRenderer.invoke('root:password:status', data),

  // 平台分类管理API
  platformCategoryCreate: (data: any) => ipcRenderer.invoke('platform:category:create', data),
  platformCategoryList: (data: any) => ipcRenderer.invoke('platform:category:list', data),
  platformCategoryUpdate: (data: any) => ipcRenderer.invoke('platform:category:update', data),
  platformCategoryDelete: (data: any) => ipcRenderer.invoke('platform:category:delete', data),
  platformCategorySort: (data: any) => ipcRenderer.invoke('platform:category:sort', data),

  // 平台口令管理API
  platformPasswordCreate: (data: any) => ipcRenderer.invoke('platform:password:create', data),
  platformPasswordList: (data: any) => ipcRenderer.invoke('platform:password:list', data),
  platformPasswordUpdate: (data: any) => ipcRenderer.invoke('platform:password:update', data),
  platformPasswordDelete: (data: any) => ipcRenderer.invoke('platform:password:delete', data),
  platformPasswordDetail: (data: any) => ipcRenderer.invoke('platform:password:detail', data),
  platformPasswordHistory: (data: any) => ipcRenderer.invoke('platform:password:history', data),
  platformPasswordHistoryDetail: (data: any) => ipcRenderer.invoke('platform:password:history:detail', data),
  platformPasswordGenerate: (data: any) => ipcRenderer.invoke('platform:password:generate', data),

  // 数据管理API
  dataOperationLogs: (data: any) => ipcRenderer.invoke('data:operation:logs', data),
  dataBackup: (data: any) => ipcRenderer.invoke('data:backup', data),
  dataRestore: (data: any) => ipcRenderer.invoke('data:restore', data),
}

// 暴露安全的API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', electronAPI)