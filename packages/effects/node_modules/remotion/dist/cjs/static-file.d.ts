declare const problematicCharacters: {
    '%3A': string;
    '%2F': string;
    '%3F': string;
    '%23': string;
    '%5B': string;
    '%5D': string;
    '%40': string;
    '%21': string;
    '%24': string;
    '%26': string;
    '%27': string;
    '%28': string;
    '%29': string;
    '%2A': string;
    '%2B': string;
    '%2C': string;
    '%3B': string;
};
type HexCode = keyof typeof problematicCharacters;
export type HexInfo = {
    containsHex: false;
} | {
    containsHex: true;
    hexCode: HexCode;
};
export declare const includesHexOfUnsafeChar: (path: string) => HexInfo;
export declare const staticFile: (path: string) => string;
export {};
