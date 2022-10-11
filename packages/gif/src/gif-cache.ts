import {LRUMap} from 'lru_map';
import type {GifState} from './props';

export const gifCache = new LRUMap<string, GifState>(30);
