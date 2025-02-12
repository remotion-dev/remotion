import { TransformOptions, ParserOptions } from '@babel/core';
import { PluginOption, ResolvedConfig } from 'vite';

interface Options {
    include?: string | RegExp | Array<string | RegExp>;
    exclude?: string | RegExp | Array<string | RegExp>;
    /**
     * Control where the JSX factory is imported from.
     * https://esbuild.github.io/api/#jsx-import-source
     * @default 'react'
     */
    jsxImportSource?: string;
    /**
     * Note: Skipping React import with classic runtime is not supported from v4
     * @default "automatic"
     */
    jsxRuntime?: 'classic' | 'automatic';
    /**
     * Babel configuration applied in both dev and prod.
     */
    babel?: BabelOptions | ((id: string, options: {
        ssr?: boolean;
    }) => BabelOptions);
}
type BabelOptions = Omit<TransformOptions, 'ast' | 'filename' | 'root' | 'sourceFileName' | 'sourceMaps' | 'inputSourceMap'>;
/**
 * The object type used by the `options` passed to plugins with
 * an `api.reactBabel` method.
 */
interface ReactBabelOptions extends BabelOptions {
    plugins: Extract<BabelOptions['plugins'], any[]>;
    presets: Extract<BabelOptions['presets'], any[]>;
    overrides: Extract<BabelOptions['overrides'], any[]>;
    parserOpts: ParserOptions & {
        plugins: Extract<ParserOptions['plugins'], any[]>;
    };
}
type ReactBabelHook = (babelConfig: ReactBabelOptions, context: ReactBabelHookContext, config: ResolvedConfig) => void;
type ReactBabelHookContext = {
    ssr: boolean;
    id: string;
};
type ViteReactPluginApi = {
    /**
     * Manipulate the Babel options of `@vitejs/plugin-react`
     */
    reactBabel?: ReactBabelHook;
};
declare function viteReact(opts?: Options): PluginOption[];
declare namespace viteReact {
    var preambleCode: string;
}

export { type BabelOptions, type Options, type ReactBabelOptions, type ViteReactPluginApi, viteReact as default };
