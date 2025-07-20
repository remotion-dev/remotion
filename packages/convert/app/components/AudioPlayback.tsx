import {createRef, useCallback, useEffect, useMemo, useRef} from 'react';
import type {Source} from '~/lib/convert-state';
import {useAudioPlayback} from '~/lib/use-audio-playback';

export const audioPlaybackRef = createRef<HTMLAudioElement>();

const getLeftPercentage = ({
	e,
	ref,
}: {
	e: React.PointerEvent<HTMLDivElement> | PointerEvent;
	ref: React.RefObject<HTMLDivElement | null>;
}) => {
	const leftFromContainer = ref.current?.getBoundingClientRect().left;
	const containerWidth = ref.current?.getBoundingClientRect().width;
	const pointerX = e.clientX;
	const pointerXFromContainer = pointerX - (leftFromContainer ?? 0);
	return (pointerXFromContainer / (containerWidth ?? 0)) * 100;
};

export const AudioPlayback: React.FC<{
	src: Source;
}> = ({src}) => {
	const ref = useRef<HTMLDivElement>(null);
	const url = useMemo(() => {
		if (src.type === 'url') {
			return src.url;
		}

		return URL.createObjectURL(src.file);
	}, [src]);

	useEffect(() => {
		return () => {
			URL.revokeObjectURL(url);
		};
	}, [url]);

	const toggle = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
		e.stopPropagation();
		e.preventDefault();

		if (audioPlaybackRef.current) {
			if (audioPlaybackRef.current.paused) {
				audioPlaybackRef.current.play();
			} else {
				audioPlaybackRef.current.pause();
			}
		}
	}, []);

	const {playing, seekToPercentage} = useAudioPlayback();

	const onPointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (!ref.current) {
				return;
			}

			const leftPercentage = getLeftPercentage({e, ref});
			seekToPercentage(leftPercentage);

			const onPointerMove = (e2: PointerEvent) => {
				const leftPercentageAgain = getLeftPercentage({e: e2, ref});
				seekToPercentage(leftPercentageAgain);
			};

			const cleanup = () => {
				ref.current?.removeEventListener('pointermove', onPointerMove);
				ref.current?.removeEventListener('pointerup', cleanup);
			};

			ref.current.addEventListener('pointermove', onPointerMove);
			ref.current.addEventListener('pointerup', cleanup);

			return () => {
				cleanup();
			};
		},
		[seekToPercentage],
	);

	return (
		<div
			ref={ref}
			className="absolute w-full h-full flex items-end justify-start p-4"
			onPointerDown={onPointerDown}
		>
			<audio ref={audioPlaybackRef} src={url} crossOrigin="anonymous" />
			<div
				onPointerDown={toggle}
				className="border-3 border-black w-14 h-14 rounded-full bg-white flex items-center justify-center cursor-pointer"
			>
				{playing ? (
					<svg className="w-5" viewBox="0 0 320 512">
						<path d="M48 64C21.5 64 0 85.5 0 112L0 400c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48L48 64zm192 0c-26.5 0-48 21.5-48 48l0 288c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48l-32 0z" />
					</svg>
				) : (
					<svg viewBox="0 0 384 512" className="w-5 ml-1">
						<path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z" />
					</svg>
				)}
			</div>
		</div>
	);
};
