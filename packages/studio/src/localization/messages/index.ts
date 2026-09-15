import {en} from './en';
import {ja} from './ja';

export {en, ja};

export const messages = {en, ja} as const;

export const SUPPORTED_LOCALES = ['en', 'ja'] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];
export type MessageKey = keyof typeof en;
export type MessageCatalog = Partial<Record<MessageKey, string>>;
