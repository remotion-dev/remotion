import type { FC } from 'react';
export type TFolder = {
    name: string;
    parent: string | null;
};
type FolderContextType = {
    folderName: string | null;
    parentName: string | null;
};
export declare const FolderContext: import("react").Context<FolderContextType>;
export declare const Folder: FC<{
    readonly name: string;
    readonly children: React.ReactNode;
}>;
export {};
