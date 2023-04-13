import type {ChromiumOptions, OpenGlRenderer} from '@remotion/renderer';

export type RequiredChromiumOptions = Required<ChromiumOptions>;

export type UiOpenGlOptions = OpenGlRenderer | 'default';
