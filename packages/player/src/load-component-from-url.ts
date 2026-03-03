import type {ComponentType} from 'react';

export type LoadComponentFromUrlOptions = {
	readonly url: string;
	readonly exportName?: string;
};

type RemoteModule<Props> = {
	readonly default?: ComponentType<Props>;
	readonly [key: string]: unknown;
};

const isComponentLike = (
	value: unknown,
): value is ComponentType<Record<string, unknown>> => {
	return (
		typeof value === 'function' || (typeof value === 'object' && value !== null)
	);
};

/**
 * POC utility to load a React component from an URL and adapt it
 * to the `lazyComponent` signature expected by `<Player />`.
 */
export const loadComponentFromUrl = <
	Props extends Record<string, unknown> = Record<string, unknown>,
>({
	url,
	exportName = 'default',
}: LoadComponentFromUrlOptions): (() => Promise<{
	default: ComponentType<Props>;
}>) => {
	if (typeof url !== 'string' || url.trim().length === 0) {
		throw new TypeError(
			'`url` passed to loadComponentFromUrl() must be a non-empty string.',
		);
	}

	if (typeof exportName !== 'string' || exportName.trim().length === 0) {
		throw new TypeError(
			'`exportName` passed to loadComponentFromUrl() must be a non-empty string.',
		);
	}

	return async () => {
		const mod = (await import(
			/* webpackIgnore: true */
			/* @vite-ignore */
			url
		)) as RemoteModule<Props>;

		const exp = exportName === 'default' ? mod.default : mod[exportName];
		if (!exp) {
			throw new Error(
				`Could not find export "${exportName}" in module loaded from "${url}".`,
			);
		}

		if (!isComponentLike(exp)) {
			throw new TypeError(
				`Export "${exportName}" from "${url}" is not a React component.`,
			);
		}

		return {
			default: exp as ComponentType<Props>,
		};
	};
};
