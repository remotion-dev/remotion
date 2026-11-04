import {createHash} from 'node:crypto';
import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import type {webpack} from '@remotion/bundler';
import {subscribeToStudioSourceWrites} from '../file-watcher';
import {subscribeToSequenceNodePathMutations} from './sequence-node-path-mutation';

// Loader-runner and SWC remove a leading BOM before transforming a module.
const sourceHash = (contents: string) =>
	createHash('sha256')
		.update(contents.replace(/^\uFEFF/, ''))
		.digest('hex');

const fastRefreshLoader = path.join(
	path.dirname(require.resolve('@remotion/bundler')),
	'fast-refresh',
	'loader.js',
);

const compiledSourceHash = (
	module: webpack.Module,
	file: string,
	context: string,
): string | null => {
	let map;
	try {
		map = module.originalSource()?.map();
	} catch {
		// An override can supply a size-only source without a readable map.
		return null;
	}

	if (!map || map.sources?.length !== 1) return null;
	const name = map.sources[0].replace(/^webpack:\/\//, '');
	if (path.resolve(context, map.sourceRoot ?? '', name) !== file) return null;
	const contents = map.sourcesContent?.[0];
	if (typeof contents !== 'string') return null;
	if (
		'loaders' in module &&
		(module as webpack.NormalModule).loaders.some(
			(loader) => loader.loader === fastRefreshLoader,
		)
	) {
		return (
			contents
				.slice(-96)
				.match(/\/\* remotion-source-sha256:([a-f0-9]{64}) \*\/\s*$/)?.[1] ??
			null
		);
	}

	return sourceHash(contents);
};

export const trackSequenceNodePathMutationBuilds = (
	compiler: webpack.Compiler,
) => {
	let sourceMutationId: string | null = null;
	type SavedFile = {
		order: number;
		written: number;
		compiled: number;
		hashes: Map<string, number>;
	};
	type Mutation = {id: string; order: number; files: string[]};
	const pending: Mutation[] = [];
	const files = new Map<string, SavedFile>();
	const writesThisTurn = new Map<string, string>();
	let order = 0;
	let building: Mutation[] = [];
	const inputs = new Map<
		string,
		SavedFile & {changed: boolean; modules: webpack.Module[]}
	>();
	let resourceHashes = new WeakMap<webpack.Module, string>();
	const recordWrite = (state: SavedFile, contents: string) => {
		state.hashes.set(sourceHash(contents), state.order);
		state.written = state.order;
	};

	const unsubscribeWrites = subscribeToStudioSourceWrites((file, contents) => {
		if (writesThisTurn.size === 0) queueMicrotask(() => writesThisTurn.clear());
		writesThisTurn.set(file, contents);
		const state = files.get(file);
		if (state) recordWrite(state, contents);
	});
	const unsubscribeMutations = subscribeToSequenceNodePathMutations(
		(mutation) => {
			const affected = mutation.applyWithoutFastRefresh
				? []
				: mutation.files.map(({absolutePath}) => absolutePath);
			const next = ++order;
			if (affected.length === 0 && pending.at(-1)?.files.length === 0)
				pending.pop();
			pending.push({id: mutation.mutationId, order: next, files: affected});
			for (const file of affected) {
				const state = files.get(file) ?? {
					order: next,
					written: 0,
					compiled: 0,
					hashes: new Map<string, number>(),
				};
				state.order = next;
				files.set(file, state);
				// Precompose broadcasts after writing; most structural edits broadcast first.
				const written = writesThisTurn.get(file);
				if (written !== undefined)
					queueMicrotask(() => {
						if (state.order === next && state.written !== next)
							recordWrite(state, written);
					});
			}
		},
	);
	compiler.hooks.shutdown.tap('remotion-source-receipts', () => {
		unsubscribeWrites();
		unsubscribeMutations();
	});

	compiler.hooks.watchRun.tap('remotion-source-receipts', () => {
		building = pending.slice();
		inputs.clear();
		resourceHashes = new WeakMap();
		for (const [file, state] of files) {
			const changed = compiler.modifiedFiles?.has(file) ?? false;
			const hashes = new Map(state.hashes);
			// External edits can supersede a Studio write before compilation begins.
			if (changed && state.written === state.order) {
				try {
					hashes.set(sourceHash(readFileSync(file, 'utf8')), state.order);
				} catch {
					// The resource can disappear between invalidation and compilation.
				}
			}

			inputs.set(file, {...state, changed, hashes, modules: []});
		}
	});
	compiler.hooks.thisCompilation.tap(
		'remotion-source-receipts',
		(compilation) => {
			if (inputs.size === 0) return;
			if (!('rspackVersion' in compiler.webpack)) {
				// FileUriPlugin reads through Webpack's input cache. These exact bytes
				// are available even when the project's loader omits its source map.
				const {readResource} =
					compiler.webpack.NormalModule.getCompilationHooks(compilation);
				readResource.for(undefined).intercept({
					register(tap) {
						if (tap.name !== 'FileUriPlugin' || tap.type !== 'async')
							return tap;
						type Callback = (
							error: Error | null,
							value: Buffer | string | null | undefined,
						) => void;
						const read = tap.fn as (
							context: webpack.LoaderContext<object>,
							callback: Callback,
						) => void;
						return {
							...tap,
							fn: (
								context: webpack.LoaderContext<object>,
								callback: Callback,
							) => {
								const module = context._module;
								if (!module || !inputs.has(context.resourcePath))
									return read(context, callback);
								read(context, (error, value) => {
									if (!error && value !== null && value !== undefined)
										resourceHashes.set(module, sourceHash(value.toString()));
									callback(error, value);
								});
							},
						};
					},
				});
			}

			compilation.hooks.succeedModule.tap(
				'remotion-source-receipts',
				(module) => {
					const file = module.nameForCondition();
					if (file !== null) inputs.get(file)?.modules.push(module);
				},
			);
		},
	);
	return (statsResult: webpack.Stats): string | null => {
		if (building.length > 0 && !statsResult.hasErrors()) {
			const {compilation} = statsResult;
			const covered = new Map<string, number>();
			const cached = new Set<string>();
			for (const [file, input] of inputs) {
				if (
					input.modules.length === 0 &&
					input.changed &&
					compilation.fileDependencies.has(file)
				)
					cached.add(file);
			}

			// A build can reuse a cached module when opposing writes restore its input.
			if (cached.size > 0)
				for (const module of compilation.modules) {
					const file = module.nameForCondition();
					if (file !== null && cached.has(file))
						inputs.get(file)?.modules.push(module);
				}

			for (const [file, input] of inputs) {
				if (input.modules.length === 0) {
					covered.set(
						file,
						compilation.fileDependencies.has(file)
							? input.compiled
							: existsSync(file)
								? input.written
								: input.order,
					);
					continue;
				}

				const revisions = input.modules.map((module) => {
					const hash =
						resourceHashes.get(module) ??
						compiledSourceHash(module, file, compiler.context);
					if (hash !== null) return input.hashes.get(hash) ?? 0;
					// An opaque override without either authored source signal retains
					// compatibility only for a directly modified, actually rebuilt target.
					return input.changed && !cached.has(file) ? input.written : 0;
				});
				covered.set(file, Math.min(...revisions));
			}

			for (const [file, revision] of covered) {
				const state = files.get(file);
				if (state) state.compiled = revision;
			}

			let confirmed = 0;
			for (const mutation of building) {
				if (
					!mutation.files.every(
						(file) => (covered.get(file) ?? 0) >= mutation.order,
					)
				)
					break;
				sourceMutationId = mutation.id;
				confirmed = mutation.order;
			}

			while (pending[0] && pending[0].order <= confirmed) pending.shift();
			if (confirmed > 0)
				for (const [file, state] of files) {
					if (state.order <= confirmed) files.delete(file);
					else
						for (const [hash, revision] of state.hashes)
							if (revision <= confirmed) state.hashes.delete(hash);
				}
		}

		building = [];
		inputs.clear();
		return sourceMutationId;
	};
};
