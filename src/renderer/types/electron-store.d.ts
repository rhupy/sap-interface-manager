import { Settings } from './index';

declare module 'electron-store' {
  interface ElectronStore<T> {
    set<K extends keyof T, V extends T[K]>(key: K, value: V): void;
    get<K extends keyof T>(key: K): T[K] | undefined;
  }
}
