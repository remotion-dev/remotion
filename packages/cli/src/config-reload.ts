import {StudioServerInternals} from '@remotion/studio-server';

export type ConfigReloadPending = {originatorClientId: string | null};

export type ConfigReloadState =
	| {type: 'idle'}
	| {type: 'reloading'; pending: ConfigReloadPending | null};

export type ConfigReloadEvent =
	| {type: 'change'; originatorClientId: string | null}
	| {type: 'finished'};

export type ConfigReloadEffect =
	| {type: 'none'}
	| {type: 'start-reload'; originatorClientId: string | null};

export const transitionConfigReload = (
	state: ConfigReloadState,
	event: ConfigReloadEvent,
): {state: ConfigReloadState; effect: ConfigReloadEffect} => {
	if (event.type === 'change') {
		if (state.type === 'idle') {
			return {
				state: {type: 'reloading', pending: null},
				effect: {
					type: 'start-reload',
					originatorClientId: event.originatorClientId,
				},
			};
		}

		return {
			state: {
				type: 'reloading',
				pending: {
					originatorClientId:
						state.pending === null ||
						state.pending.originatorClientId === event.originatorClientId
							? event.originatorClientId
							: null,
				},
			},
			effect: {type: 'none'},
		};
	}

	if (state.type === 'idle') {
		return {state, effect: {type: 'none'}};
	}

	if (state.pending === null) {
		return {state: {type: 'idle'}, effect: {type: 'none'}};
	}

	return {
		state: {type: 'reloading', pending: null},
		effect: {
			type: 'start-reload',
			originatorClientId: state.pending.originatorClientId,
		},
	};
};

export const watchConfigFileForReloads = ({
	configFile,
	reload,
}: {
	configFile: string;
	reload: (originatorClientId: string | null) => Promise<void>;
}) => {
	let state: ConfigReloadState = {type: 'idle'};

	const dispatch = (event: ConfigReloadEvent) => {
		const next = transitionConfigReload(state, event);
		state = next.state;
		if (next.effect.type === 'start-reload') {
			reload(next.effect.originatorClientId).finally(() => {
				dispatch({type: 'finished'});
			});
		}
	};

	return StudioServerInternals.installFileWatcher({
		file: configFile,
		existenceOnly: false,
		onChange: (event) => {
			dispatch({
				type: 'change',
				originatorClientId:
					event.type === 'deleted' ? null : (event.originatorClientId ?? null),
			});
		},
	});
};
