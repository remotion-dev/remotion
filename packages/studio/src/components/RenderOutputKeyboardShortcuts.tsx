import type {StudioKeyboardShortcutAction} from '@remotion/studio-shared';
import type React from 'react';
import {useContext, useEffect} from 'react';
import {Internals} from 'remotion';
import {isKeyboardEventOwnedByControl} from '../helpers/is-keyboard-event-owned-by-control';
import {isMac} from '../helpers/is-mac';
import {getRenderOutputPlaybackTarget} from '../helpers/render-output-playback';
import {useKeybinding} from '../helpers/use-keybinding';
import {stepPlaybackRate} from '../state/playbackrate';
import {showNotification} from './Notifications/NotificationCenter';

const actions = [
	'playPause',
	'pauseAndReturnToPlaybackStart',
	'jumpToBeginning',
	'jumpToEnd',
	'pausePlayback',
	'playForward',
	'reversePlayback',
	'decreasePlaybackRate',
	'increasePlaybackRate',
	'toggleMute',
	'toggleLoop',
] as const satisfies readonly StudioKeyboardShortcutAction[];

export const RenderOutputKeyboardShortcuts: React.FC = () => {
	const keybindings = useKeybinding();
	const compositionManagerRef = useContext(
		Internals.CompositionManagerRefContext,
	);

	useEffect(() => {
		const handle = (
			event: KeyboardEvent,
			action: (typeof actions)[number] | 'ArrowLeft' | 'ArrowRight',
		) => {
			if (event.defaultPrevented || event.isComposing) return;
			if (
				(action === 'ArrowLeft' || action === 'ArrowRight') &&
				(isMac ? event.ctrlKey : event.metaKey)
			)
				return;
			if (isKeyboardEventOwnedByControl(event)) return;
			const target = getRenderOutputPlaybackTarget(
				compositionManagerRef.current.canvasContent,
			);
			if (target === null) return;
			const state = target.getState();
			if (action === 'pauseAndReturnToPlaybackStart' && !state.playing) return;
			event.preventDefault();
			if (
				event.repeat &&
				(action === 'playPause' ||
					action === 'toggleMute' ||
					action === 'toggleLoop' ||
					action === 'pauseAndReturnToPlaybackStart' ||
					action === 'reversePlayback')
			)
				return;

			const reportError = (error: unknown) => {
				if (
					getRenderOutputPlaybackTarget(
						compositionManagerRef.current.canvasContent,
					) !== target
				)
					return;
				// Pausing while native play() is still pending intentionally aborts it.
				if (
					error instanceof Error &&
					error.name === 'AbortError' &&
					!target.getState().playing
				)
					return;
				showNotification(
					`Could not control output playback: ${error instanceof Error ? error.message : String(error)}`,
					3000,
				);
			};

			try {
				switch (action) {
					case 'playPause':
						if (state.playing) target.pause();
						else target.play().catch(reportError);
						break;
					case 'pauseAndReturnToPlaybackStart':
						target.pauseAndReturnToPlayStart();
						break;
					case 'jumpToBeginning':
						target.seekToFrame(0);
						break;
					case 'jumpToEnd':
						target.seekToFrame(state.durationInFrames - 1);
						break;
					case 'ArrowLeft':
					case 'ArrowRight': {
						const backwards = action === 'ArrowLeft';
						const command = isMac ? event.metaKey : event.ctrlKey;
						const frames =
							event.shiftKey && !command ? Math.round(state.fps) : 1;
						const frame =
							event.altKey && !command
								? backwards
									? 0
									: state.durationInFrames - 1
								: state.frame + (backwards ? -frames : frames);
						target.seekToFrame(
							Math.max(0, Math.min(state.durationInFrames - 1, frame)),
						);
						break;
					}

					case 'pausePlayback':
						target.setPlaybackRate(1);
						target.pause();
						break;
					case 'playForward':
						target.setPlaybackRate(
							!state.playing || state.playbackRate < 1
								? 1
								: state.playbackRate < 2
									? 2
									: 4,
						);
						target.play().catch(reportError);
						break;
					case 'reversePlayback':
						showNotification(
							'Reverse playback is unavailable for rendered outputs.',
							3000,
						);
						break;
					case 'decreasePlaybackRate':
					case 'increasePlaybackRate':
						target.setPlaybackRate(
							stepPlaybackRate(
								state.playbackRate,
								action === 'increasePlaybackRate' ? 1 : -1,
							),
						);
						break;
					case 'toggleMute':
						target.setMuted(!state.muted);
						break;
					case 'toggleLoop':
						target.setLoop(!state.loop);
						break;
					default:
						throw new Error(
							`Unknown output playback shortcut: ${action satisfies never}`,
						);
				}
			} catch (error) {
				reportError(error);
			}
		};

		const bindings = actions.map((action) =>
			keybindings.registerKeybinding({
				event: 'keydown',
				action,
				callback: (event) => handle(event, action),
				preventDefault: false,
				triggerIfInputFieldFocused: false,
				keepRegisteredWhenNotHighestContext: false,
			}),
		);
		for (const key of ['ArrowLeft', 'ArrowRight'] as const) {
			for (const commandCtrlKey of [false, true]) {
				bindings.push(
					keybindings.registerKeybinding({
						event: 'keydown',
						key,
						commandCtrlKey,
						callback: (event) => handle(event, key),
						preventDefault: false,
						triggerIfInputFieldFocused: false,
						keepRegisteredWhenNotHighestContext: false,
					}),
				);
			}
		}

		return () => {
			for (const binding of bindings) binding.unregister();
		};
	}, [compositionManagerRef, keybindings]);
	return null;
};
