// TypeScript bindings for emscripten-generated code.  Automatically generated at compile time.
declare namespace RuntimeExports {
    let print: any;
    let printErr: any;
    /**
     * @param {string|null=} returnType
     * @param {Array=} argTypes
     * @param {Arguments|Array=} args
     * @param {Object=} opts
     */
    function ccall(ident: any, returnType?: (string | null) | undefined, argTypes?: any[] | undefined, args?: (Arguments | any[]) | undefined, opts?: any | undefined): any;
    /**
     * @param {string=} returnType
     * @param {Array=} argTypes
     * @param {Object=} opts
     */
    function cwrap(ident: any, returnType?: string | undefined, argTypes?: any[] | undefined, opts?: any | undefined): any;
    let HEAPU8: any;
    function FS_createPath(...args: any[]): any;
    function FS_createDataFile(...args: any[]): any;
    function FS_createPreloadedFile(parent: any, name: any, url: any, canRead: any, canWrite: any, onload: any, onerror: any, dontCreateFile: any, canOwn: any, preFinish: any): void;
    function FS_unlink(...args: any[]): any;
    function FS_createLazyFile(...args: any[]): any;
    function FS_createDevice(...args: any[]): any;
    let addRunDependency: any;
    let removeRunDependency: any;
}
interface WasmModule {
}

type EmbindString = ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string;
interface EmbindModule {
  full_default(_0: EmbindString, _1: any, _2: EmbindString, _3: EmbindString, _4: number, _5: boolean): number;
}

export type MainModule = WasmModule & typeof RuntimeExports & EmbindModule;
export default function MainModuleFactory (options?: unknown): Promise<MainModule>;
