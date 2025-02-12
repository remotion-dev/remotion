import React from 'react';
type Block = {
    id: string;
};
type OnBufferingCallback = () => void;
type OnResumeCallback = () => void;
type ListenForBuffering = (callback: OnBufferingCallback) => {
    remove: () => void;
};
type ListenForResume = (callback: OnResumeCallback) => {
    remove: () => void;
};
type AddBlock = (block: Block) => {
    unblock: () => void;
};
type BufferManager = {
    addBlock: AddBlock;
    listenForBuffering: ListenForBuffering;
    listenForResume: ListenForResume;
    buffering: React.MutableRefObject<boolean>;
};
export declare const BufferingContextReact: React.Context<BufferManager | null>;
export declare const BufferingProvider: React.FC<{
    readonly children: React.ReactNode;
}>;
export declare const useIsPlayerBuffering: (bufferManager: BufferManager) => boolean;
export {};
