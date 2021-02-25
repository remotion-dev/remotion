const validOptions = ['png', 'jpeg'] as const;

export type ImageFormat = typeof validOptions[number];
