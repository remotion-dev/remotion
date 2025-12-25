type BitrateUnit = 'k' | 'K' | 'm' | 'M' | 'g' | 'G';

export type Bitrate = `${number}${BitrateUnit}`;
