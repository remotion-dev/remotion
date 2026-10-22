type MediaResource = {
	resource: unknown;
	dispose: () => void;
	refCount: number;
	disposeGeneration: number;
	disposed: boolean;
	values: Map<string, unknown>;
};

export type MediaResourceLease<T> = {
	resource: T;
	getOrCreateValue: <Value>(key: string, create: () => Value) => Value;
	release: () => void;
};

export type MediaResourceManager = {
	acquire: <T>({
		key,
		create,
	}: {
		key: string;
		create: () => {resource: T; dispose: () => void};
	}) => MediaResourceLease<T>;
	invalidate: (key: string) => void;
	dispose: () => void;
};

const disposeResource = (resource: MediaResource) => {
	if (resource.disposed) {
		return;
	}

	resource.disposed = true;
	resource.values.clear();
	resource.dispose();
};

export const makeMediaResourceManager = (): MediaResourceManager => {
	const resources = new Map<string, MediaResource>();
	let disposed = false;

	return {
		acquire: <T>({
			key,
			create,
		}: {
			key: string;
			create: () => {resource: T; dispose: () => void};
		}) => {
			if (disposed) {
				throw new Error('Media resource manager has already been disposed');
			}

			let entry = resources.get(key);
			if (!entry) {
				const created = create();
				entry = {
					resource: created.resource,
					dispose: created.dispose,
					refCount: 0,
					disposeGeneration: 0,
					disposed: false,
					values: new Map(),
				};
				resources.set(key, entry);
			}

			entry.refCount++;
			entry.disposeGeneration++;
			let released = false;

			return {
				resource: entry.resource as T,
				getOrCreateValue: <Value>(
					valueKey: string,
					createValue: () => Value,
				) => {
					if (entry.values.has(valueKey)) {
						return entry.values.get(valueKey) as Value;
					}

					const value = createValue();
					entry.values.set(valueKey, value);
					return value;
				},
				release: () => {
					if (released) {
						return;
					}

					released = true;
					entry.refCount--;
					if (entry.refCount !== 0) {
						return;
					}

					const disposeGeneration = ++entry.disposeGeneration;
					queueMicrotask(() => {
						if (
							entry.refCount !== 0 ||
							entry.disposeGeneration !== disposeGeneration
						) {
							return;
						}

						if (resources.get(key) === entry) {
							resources.delete(key);
						}

						disposeResource(entry);
					});
				},
			};
		},
		invalidate: (key) => {
			const entry = resources.get(key);
			if (!entry) {
				return;
			}

			resources.delete(key);
			entry.disposeGeneration++;
			if (entry.refCount === 0) {
				disposeResource(entry);
			}
		},
		dispose: () => {
			if (disposed) {
				return;
			}

			disposed = true;
			const entries = Array.from(resources.values());
			resources.clear();

			let firstError: unknown = null;
			for (const entry of entries) {
				try {
					disposeResource(entry);
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

export const getMediabunnyInputResourceKey = ({
	src,
	credentials,
	requestInitFingerprint,
	revision,
}: {
	src: string;
	credentials: RequestCredentials | null;
	requestInitFingerprint: unknown;
	revision: string | null;
}) =>
	JSON.stringify([
		'mediabunny-input',
		src,
		credentials,
		requestInitFingerprint,
		revision,
	]);

export const MEDIABUNNY_DURATION_VALUE_KEY = 'mediabunny-duration';

export const globalMediaResourceManager = makeMediaResourceManager();
