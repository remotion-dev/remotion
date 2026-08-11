import {QuickLRU} from './lru/index';
import type {GifState} from './props';

export const volatileGifCache = new QuickLRU<string, GifState>({maxSize: 30});
export const manuallyManagedGifCache = new Map<string, GifState>();
