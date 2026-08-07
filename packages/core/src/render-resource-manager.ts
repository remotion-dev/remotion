import React from 'react';

type RenderResource = {
	resource: unknown;
	dispose: () => void;
};

export type RenderResourceManager = {
	getOrCreateResource: <T>({
		key,
		create,
	}: {
		key: string;
		create: () => {resource: T; dispose: () => void};
	}) => T;
	dispose: () => void;
};

export const makeRenderResourceManager = (): RenderResourceManager => {
	const resources = new Map<string, RenderResource>();
	let disposed = false;

	return {
		getOrCreateResource: <T>({
			key,
			create,
		}: {
			key: string;
			create: () => {resource: T; dispose: () => void};
		}) => {
			if (disposed) {
				throw new Error('Render resource manager has already been disposed');
			}

			const existing = resources.get(key);
			if (existing) {
				return existing.resource as T;
			}

			const created = create();
			resources.set(key, created);
			return created.resource;
		},
		dispose: () => {
			if (disposed) {
				return;
			}

			disposed = true;
			const resourcesToDispose = Array.from(resources.values());
			resources.clear();

			let firstError: unknown = null;
			for (const resource of resourcesToDispose) {
				try {
					resource.dispose();
				} catch (error) {
					firstError ??= error;
				}
			}

			if (firstError !== null) {
				throw firstError;
			}
		},
	};
};

export const RenderResourceManagerContext =
	React.createContext<RenderResourceManager | null>(null);
