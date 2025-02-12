declare const config: (style: 'glob' | 'minimatch') => {
  files: string[];
  rules: Record<string, 'error' | 'off' | 'warn'>;
};
export = config;
