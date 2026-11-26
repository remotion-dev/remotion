import {StudioServerInternals} from '@remotion/studio-server';
import type {SourceFileVersion} from '@remotion/studio-shared';

export type ConfigReloadPending = {
	originatorClientId: string | null;
	sourceVersion: SourceFileVersion | null;
};

export type ConfigReloadState =
	| {type: 'idle'}
	| {type: 'reloading'; pending: ConfigReloadPending | null};

export type ConfigReloadEvent =
	| ({type: 'change'} & ConfigReloadPending)
	| {type: 'finished'};

export type ConfigReloadEffect =
	| {type: 'none'}
	| ({type: 'start-reload'} & ConfigReloadPending);

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
					sourceVersion: event.sourceVersion,
				},
			};
		}

		return {
			state: {
				type: 'reloading',
				pending: {
					sourceVersion:
						event.sourceVersion ?? state.pending?.sourceVersion ?? null,
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
			...state.pending,
		},
	};
};

export const watchConfigFileForReloads = ({
	configFile,
	reload,
}: {
	configFile: string;
	reload: (change: ConfigReloadPending) => Promise<void>;
}) => {
	let state: ConfigReloadState = {type: 'idle'};

	const dispatch = (event: ConfigReloadEvent) => {
		const next = transitionConfigReload(state, event);
		state = next.state;
		if (next.effect.type === 'start-reload') {
			reload(next.effect).finally(() => {
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
				sourceVersion: event.type === 'deleted' ? null : event.sourceVersion,
			});
		},
	});
};
