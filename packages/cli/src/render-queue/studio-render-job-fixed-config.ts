import type {
	BundlerOverrideFn,
	RspackOverrideFn,
	WebpackOverrideFn,
} from '@remotion/bundler';

export type StudioRenderJobFixedConfig = {
	readonly bundlerOverride: BundlerOverrideFn;
	readonly publicDir: string | null;
	readonly rendererPort: number | null;
	readonly rspackOverride: RspackOverrideFn;
	readonly rspack: boolean;
	readonly webpackOverride: WebpackOverrideFn;
};
