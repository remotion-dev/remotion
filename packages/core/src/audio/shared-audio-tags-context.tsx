import React, {
	createContext,
	createRef,
	useCallback,
	useContext,
	useMemo,
	useRef,
	useState,
	type AudioHTMLAttributes,
} from 'react';
import {useLogLevel, useMountTime} from '../log-level-context.js';
import {playAndHandleNotAllowedError} from '../play-and-handle-not-allowed-error.js';
import {useTimelineContext} from '../timeline-position-state.js';
import {useRemotionEnvironment} from '../use-remotion-environment.js';
import {SharedAudioContext} from './shared-audio-context.js';
import {compareProps, didPropChange} from './shared-audio-tags-helpers.js';
import type {SharedElementSourceNode} from './shared-element-source-node.js';
import {makeSharedElementSourceNode} from './shared-element-source-node.js';

type AudioElem = {
	id: number;
	props: AudioHTMLAttributes<HTMLAudioElement>;
	el: React.RefObject<HTMLAudioElement | null>;
	audioId: string;
	mediaElementSourceNode: SharedElementSourceNode | null;
	premounting: boolean;
	postmounting: boolean;
	audioMounted: boolean;
	cleanupOnMediaTagUnmount: () => void;
};

export const EMPTY_AUDIO =
	'data:audio/mp3;base64,/+MYxAAJcAV8AAgAABn//////+/gQ5BAMA+D4Pg+BAQBAEAwD4Pg+D4EBAEAQDAPg++hYBH///hUFQVBUFREDQNHmf///////+MYxBUGkAGIMAAAAP/29Xt6lUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxDUAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';

export type SharedAudioTagsContextValue = {
	registerAudio: (options: {
		aud: AudioHTMLAttributes<HTMLAudioElement>;
		audioId: string;
		premounting: boolean;
		postmounting: boolean;
	}) => AudioElem;
	unregisterAudio: (id: number) => void;
	updateAudio: (options: {
		id: number;
		aud: AudioHTMLAttributes<HTMLAudioElement>;
		audioId: string;
		premounting: boolean;
		postmounting: boolean;
	}) => void;
	playAllAudios: () => void;
	numberOfAudioTags: number;
};

type Ref = {
	id: number;
	ref: React.RefObject<HTMLAudioElement | null>;
	mediaElementSourceNode: SharedElementSourceNode | null;
};

export const SharedAudioTagsContext =
	createContext<SharedAudioTagsContextValue | null>(null);

export const SharedAudioTagsContextProvider: React.FC<{
	readonly numberOfAudioTags: number;
	readonly children: React.ReactNode;
}> = ({children, numberOfAudioTags}) => {
	const audios = useRef<AudioElem[]>([]);
	const [initialNumberOfAudioTags] = useState(numberOfAudioTags);

	if (numberOfAudioTags !== initialNumberOfAudioTags) {
		throw new Error(
			'The number of shared audio tags has changed dynamically. Once you have set this property, you cannot change it afterwards.',
		);
	}

	const logLevel = useLogLevel();
	const mountTime = useMountTime();
	const env = useRemotionEnvironment();
	const audioCtx = useContext(SharedAudioContext);
	const audioContext = audioCtx?.audioContext ?? null;
	const resume = audioCtx?.resume;

	const [refs] = useState(() => {
		return new Array(numberOfAudioTags).fill(true).map((): Ref => {
			const ref = createRef<HTMLAudioElement>();
			return {
				id: Math.random(),
				ref,
				mediaElementSourceNode: makeSharedElementSourceNode({
					audioContext,
					ref,
				}),
			};
		});
	});

	for (const {mediaElementSourceNode} of refs) {
		mediaElementSourceNode?.setAudioContext(audioContext);
	}

	const effectToUse = React.useInsertionEffect ?? React.useLayoutEffect;

	effectToUse(() => {
		return () => {
			requestAnimationFrame(() => {
				refs.forEach(({mediaElementSourceNode}) => {
					mediaElementSourceNode?.cleanup();
				});
			});
		};
	}, [refs]);

	const takenAudios = useRef<(false | number)[]>(
		new Array(numberOfAudioTags).fill(false),
	);

	const rerenderAudios = useCallback(() => {
		refs.forEach(({ref, id}) => {
			const data = audios.current?.find((a) => a.id === id);
			const {current} = ref;
			if (!current) {
				return;
			}

			if (data === undefined) {
				if (current.src !== EMPTY_AUDIO) {
					current.src = EMPTY_AUDIO;
				}
				return;
			}

			if (!data) {
				throw new TypeError('Expected audio data to be there');
			}

			Object.keys(data.props).forEach((key) => {
				// @ts-expect-error
				if (didPropChange(key, data.props[key], current[key])) {
					// @ts-expect-error
					current[key] = data.props[key];
				}
			});
		});
	}, [refs]);

	const registerAudio = useCallback(
		(options: {
			aud: AudioHTMLAttributes<HTMLAudioElement>;
			audioId: string;
			premounting: boolean;
			postmounting: boolean;
		}) => {
			const {aud, audioId, premounting, postmounting} = options;
			const found = audios.current?.find((a) => a.audioId === audioId);
			if (found) {
				return found;
			}

			const firstFreeAudio = takenAudios.current.findIndex((a) => a === false);
			if (firstFreeAudio === -1) {
				throw new Error(
					`Tried to simultaneously mount ${
						numberOfAudioTags + 1
					} <Html5Audio /> tags at the same time. With the current settings, the maximum amount of <Html5Audio /> tags is limited to ${numberOfAudioTags} at the same time. Remotion pre-mounts silent audio tags to help avoid browser autoplay restrictions. See https://remotion.dev/docs/player/autoplay#using-the-numberofsharedaudiotags-prop for more information on how to increase this limit.`,
				);
			}

			const {id, ref, mediaElementSourceNode} = refs[firstFreeAudio];
			const cloned = [...takenAudios.current];
			cloned[firstFreeAudio] = id;
			takenAudios.current = cloned;

			const newElem: AudioElem = {
				props: aud,
				id,
				el: ref,
				audioId,
				mediaElementSourceNode,
				premounting,
				audioMounted: Boolean(ref.current),
				postmounting,
				cleanupOnMediaTagUnmount: () => {
					// Don't disconnect here, only when the Player unmounts.
				},
			};
			audios.current?.push(newElem);
			rerenderAudios();
			return newElem;
		},
		[numberOfAudioTags, refs, rerenderAudios],
	);

	const unregisterAudio = useCallback(
		(id: number) => {
			const cloned = [...takenAudios.current];
			const index = refs.findIndex((r) => r.id === id);
			if (index === -1) {
				throw new TypeError(
					`Unknown audio ref ${id}; refs: ${refs.map((r) => r.id).join(', ')}`,
				);
			}

			cloned[index] = false;

			takenAudios.current = cloned;
			audios.current = audios.current?.filter((a) => a.id !== id);

			rerenderAudios();
		},
		[refs, rerenderAudios],
	);

	const updateAudio = useCallback(
		({
			aud,
			audioId,
			id,
			premounting,
			postmounting,
		}: {
			id: number;
			aud: AudioHTMLAttributes<HTMLAudioElement>;
			audioId: string;
			premounting: boolean;
			postmounting: boolean;
		}) => {
			let changed = false;

			audios.current = audios.current?.map((prevA): AudioElem => {
				const audioMounted = Boolean(prevA.el.current);
				if (prevA.audioMounted !== audioMounted) {
					changed = true;
				}

				if (prevA.id === id) {
					const isTheSame =
						compareProps(
							aud as Record<string, unknown>,
							prevA.props as Record<string, unknown>,
						) &&
						prevA.premounting === premounting &&
						prevA.postmounting === postmounting;
					if (isTheSame) {
						return prevA.audioMounted === audioMounted
							? prevA
							: {...prevA, audioMounted};
					}

					changed = true;

					return {
						...prevA,
						props: aud,
						premounting,
						postmounting,
						audioId,
						audioMounted,
					};
				}

				return prevA.audioMounted === audioMounted
					? prevA
					: {...prevA, audioMounted};
			});

			if (changed) {
				rerenderAudios();
			}
		},
		[rerenderAudios],
	);

	const playAllAudios = useCallback(() => {
		refs.forEach((ref) => {
			const audio = audios.current.find((a) => a.el === ref.ref);
			if (audio?.premounting) {
				return;
			}

			playAndHandleNotAllowedError({
				mediaRef: ref.ref,
				mediaType: 'audio',
				onAutoPlayError: null,
				logLevel,
				mountTime,
				reason: 'playing all audios',
				isPlayer: env.isPlayer,
			});
		});
		resume?.();
	}, [logLevel, mountTime, refs, env.isPlayer, resume]);

	useTimelineContext({
		subscriber: useCallback(
			(playing: boolean) => {
				if (playing) {
					playAllAudios();
				}
			},
			[playAllAudios],
		),
	});

	const audioTagsValue: SharedAudioTagsContextValue = useMemo(() => {
		return {
			registerAudio,
			unregisterAudio,
			updateAudio,
			playAllAudios,
			numberOfAudioTags,
		};
	}, [
		numberOfAudioTags,
		playAllAudios,
		registerAudio,
		unregisterAudio,
		updateAudio,
	]);
	const sharedAudioTagElements = useMemo(() => {
		return refs.map(({id, ref}) => {
			return <audio key={id} ref={ref} preload="metadata" src={EMPTY_AUDIO} />;
		});
	}, [refs]);

	return (
		<SharedAudioTagsContext.Provider value={audioTagsValue}>
			{sharedAudioTagElements}
			{children}
		</SharedAudioTagsContext.Provider>
	);
};

export const useSharedAudio = ({
	aud,
	audioId,
	premounting,
	postmounting,
}: {
	aud: AudioHTMLAttributes<HTMLAudioElement>;
	audioId: string;
	premounting: boolean;
	postmounting: boolean;
}) => {
	const audioCtx = useContext(SharedAudioContext);
	const tagsCtx = useContext(SharedAudioTagsContext);

	const [elem] = useState((): AudioElem => {
		if (tagsCtx && tagsCtx.numberOfAudioTags > 0) {
			return tagsCtx.registerAudio({aud, audioId, premounting, postmounting});
		}

		const el = React.createRef<HTMLAudioElement>();
		const mediaElementSourceNode = makeSharedElementSourceNode({
			audioContext: audioCtx?.audioContext ?? null,
			ref: el,
		});

		return {
			el,
			id: Math.random(),
			props: aud,
			audioId,
			mediaElementSourceNode,
			premounting,
			audioMounted: Boolean(el.current),
			postmounting,
			cleanupOnMediaTagUnmount: () => {
				mediaElementSourceNode?.cleanup();
			},
		};
	});
	elem.mediaElementSourceNode?.setAudioContext(audioCtx?.audioContext ?? null);

	const effectToUse = React.useInsertionEffect ?? React.useLayoutEffect;

	if (typeof document !== 'undefined') {
		effectToUse(() => {
			if (tagsCtx && tagsCtx.numberOfAudioTags > 0) {
				tagsCtx.updateAudio({
					id: elem.id,
					aud,
					audioId,
					premounting,
					postmounting,
				});
			}
		}, [aud, tagsCtx, elem.id, audioId, premounting, postmounting]);

		effectToUse(() => {
			return () => {
				if (tagsCtx && tagsCtx.numberOfAudioTags > 0) {
					tagsCtx.unregisterAudio(elem.id);
				}
			};
		}, [tagsCtx, elem.id]);
	}

	return elem;
};
