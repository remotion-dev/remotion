import type {PlayerRef} from '@remotion/player';
import {useEffect} from 'react';

type Options = {
	readonly playerRef: React.RefObject<PlayerRef | null>;
	readonly containerRef: React.RefObject<HTMLElement | null>;
	readonly fps: number;
	readonly durationInFrames: number;
	readonly enabled?: boolean;
};

export const useMediaKeyboardShortcuts = ({
	playerRef,
	containerRef,
	fps,
	durationInFrames,
	enabled = true,
}: Options) => {
	useEffect(() => {
		if (!enabled) return;
		const container = containerRef.current;
		if (!container) return;

		const seekBy = (deltaSeconds: number) => {
			const player = playerRef.current;
			if (!player) return;
			const next = player.getCurrentFrame() + deltaSeconds * fps;
			const clamped = Math.max(0, Math.min(durationInFrames - 1, next));
			player.seekTo(clamped);
		};

		const adjustVolume = (delta: number) => {
			const player = playerRef.current;
			if (!player) return;
			const next = Math.max(0, Math.min(1, player.getVolume() + delta));
			player.setVolume(next);
		};

		const onKeyDown = (e: KeyboardEvent) => {
			const player = playerRef.current;
			if (!player) return;

			if (e.defaultPrevented) return;
			// Don't intercept keys when typing in a form control
			const target = e.target as HTMLElement | null;
			if (target) {
				const tag = target.tagName;
				if (
					tag === 'INPUT' ||
					tag === 'TEXTAREA' ||
					tag === 'SELECT' ||
					target.isContentEditable
				) {
					return;
				}
			}

			switch (e.key) {
				case ' ':
				case 'k':
				case 'K':
					e.preventDefault();
					player.toggle();
					return;
				case 'ArrowLeft':
					e.preventDefault();
					seekBy(e.shiftKey ? -1 : -5);
					return;
				case 'ArrowRight':
					e.preventDefault();
					seekBy(e.shiftKey ? 1 : 5);
					return;
				case 'PageUp':
					e.preventDefault();
					seekBy(10);
					return;
				case 'PageDown':
					e.preventDefault();
					seekBy(-10);
					return;
				case 'Home':
					e.preventDefault();
					player.seekTo(0);
					return;
				case 'End':
					e.preventDefault();
					player.seekTo(Math.max(0, durationInFrames - 1));
					return;
				case 'ArrowUp':
					e.preventDefault();
					adjustVolume(0.05);
					return;
				case 'ArrowDown':
					e.preventDefault();
					adjustVolume(-0.05);
					return;
				case 'm':
				case 'M':
					e.preventDefault();
					if (player.isMuted()) player.unmute();
					else player.mute();
					return;
				case 'f':
				case 'F':
					e.preventDefault();
					if (player.isFullscreen()) player.exitFullscreen();
					else player.requestFullscreen();
					break;
				default:
					break;
			}
		};

		container.addEventListener('keydown', onKeyDown);
		return () => {
			container.removeEventListener('keydown', onKeyDown);
		};
	}, [playerRef, containerRef, fps, durationInFrames, enabled]);
};
