import {LRUMap} from 'lru_map';
import type {GifState} from './props';

export const volatileGifCache = new LRUMap<string, GifState>(30);
export const manuallyManagedGifCache = new Map<string, GifState>();
