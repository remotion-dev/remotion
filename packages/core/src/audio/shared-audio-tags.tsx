import type {ComponentType, LazyExoticComponent} from 'react';
import React, {
	createContext,
	createRef,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {useLogLevel, useMountTime} from '../log-level-context.js';
import {playAndHandleNotAllowedError} from '../play-and-handle-not-allowed-error.js';
import type {RemotionAudioProps} from './props.js';

/**
 * This functionality of Remotion will keep a certain amount
 * of <audio> tags pre-mounted and by default filled with an empty audio track.
 * If the user interacts, the empty audio will be played.
 * If one of Remotions <Audio /> tags get mounted, the audio will not be rendered at this location, but into one of the prerendered audio tags.
 *
 * This helps with autoplay issues on iOS Safari and soon other browsers,
 * which only allow audio playback upon user interaction.
 *
 * The behavior can be disabled by passing `0` as the number of shared audio tracks.
 */

type AudioElem = {
	id: number;
	props: RemotionAudioProps;
	el: React.RefObject<HTMLAudioElement | null>;
	audioId: string;
};

const EMPTY_AUDIO =
	'data:audio/mp3;base64,/+MYxAAJcAV8AAgAABn//////+/gQ5BAMA+D4Pg+BAQBAEAwD4Pg+D4EBAEAQDAPg++hYBH///hUFQVBUFREDQNHmf///////+MYxBUGkAGIMAAAAP/29Xt6lUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxDUAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';

type SharedContext = {
	registerAudio: (aud: RemotionAudioProps, audioId: string) => AudioElem;
	unregisterAudio: (id: number) => void;
	updateAudio: (options: {
		id: number;
		aud: RemotionAudioProps;
		audioId: string;
	}) => void;
	playAllAudios: () => void;
	numberOfAudioTags: number;
};

const compareProps = (
	obj1: Record<string, unknown>,
	obj2: Record<string, unknown>,
) => {
	const keysA = Object.keys(obj1).sort();
	const keysB = Object.keys(obj2).sort();
	if (keysA.length !== keysB.length) {
		return false;
	}

	for (let i = 0; i < keysA.length; i++) {
		// Not the same keys
		if (keysA[i] !== keysB[i]) {
			return false;
		}

		// Not the same values
		if (obj1[keysA[i]] !== obj2[keysB[i]]) {
			return false;
		}
	}

	return true;
};

const didPropChange = (key: string, newProp: unknown, prevProp: unknown) => {
	// /music.mp3 and http://localhost:3000/music.mp3 are the same
	if (
		key === 'src' &&
		!(prevProp as string).startsWith('data:') &&
		!(newProp as string).startsWith('data:')
	) {
		return (
			new URL(prevProp as string, window.origin).toString() !==
			new URL(newProp as string, window.origin).toString()
		);
	}

	if (prevProp === newProp) {
		return false;
	}

	return true;
};

export const SharedAudioContext = createContext<SharedContext | null>(null);

export const SharedAudioContextProvider: React.FC<{
	readonly numberOfAudioTags: number;
	readonly children: React.ReactNode;
	readonly component: LazyExoticComponent<
		ComponentType<Record<string, unknown>>
	> | null;
}> = ({children, numberOfAudioTags, component}) => {
	const audios = useRef<AudioElem[]>([]);
	const [initialNumberOfAudioTags] = useState(numberOfAudioTags);

	if (numberOfAudioTags !== initialNumberOfAudioTags) {
		throw new Error(
			'The number of shared audio tags has changed dynamically. Once you have set this property, you cannot change it afterwards.',
		);
	}

	const refs = useMemo(() => {
		return new Array(numberOfAudioTags).fill(true).map(() => {
			return {id: Math.random(), ref: createRef<HTMLAudioElement>()};
		});
	}, [numberOfAudioTags]);

	const takenAudios = useRef<(false | number)[]>(
		new Array(numberOfAudioTags).fill(false),
	);

	const rerenderAudios = useCallback(() => {
		refs.forEach(({ref, id}) => {
			const data = audios.current?.find((a) => a.id === id);
			const {current} = ref;
			if (!current) {
				// Whole player has been unmounted, the refs don't exist anymore.
				// It is not an error anymore though
				return;
			}

			if (data === undefined) {
				current.src = EMPTY_AUDIO;
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
		(aud: RemotionAudioProps, audioId: string) => {
			const found = audios.current?.find((a) => a.audioId === audioId);
			if (found) {
				return found;
			}

			const firstFreeAudio = takenAudios.current.findIndex((a) => a === false);
			if (firstFreeAudio === -1) {
				throw new Error(
					`Tried to simultaneously mount ${
						numberOfAudioTags + 1
					} <Audio /> tags at the same time. With the current settings, the maximum amount of <Audio /> tags is limited to ${numberOfAudioTags} at the same time. Remotion pre-mounts silent audio tags to help avoid browser autoplay restrictions. See https://remotion.dev/docs/player/autoplay#using-the-numberofsharedaudiotags-prop for more information on how to increase this limit.`,
				);
			}

			const {id, ref} = refs[firstFreeAudio];
			const cloned = [...takenAudios.current];
			cloned[firstFreeAudio] = id;
			takenAudios.current = cloned;

			const newElem: AudioElem = {
				props: aud,
				id,
				el: ref,
				audioId,
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
				throw new TypeError('Error occured in ');
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
		}: {
			id: number;
			aud: RemotionAudioProps;
			audioId: string;
		}) => {
			let changed = false;

			audios.current = audios.current?.map((prevA): AudioElem => {
				if (prevA.id === id) {
					const isTheSame = compareProps(aud, prevA.props);
					if (isTheSame) {
						return prevA;
					}

					changed = true;
					return {
						...prevA,
						props: aud,
						audioId,
					};
				}

				return prevA;
			});

			if (changed) {
				rerenderAudios();
			}
		},
		[rerenderAudios],
	);

	const logLevel = useLogLevel();
	const mountTime = useMountTime();

	const playAllAudios = useCallback(() => {
		refs.forEach((ref) => {
			playAndHandleNotAllowedError({
				mediaRef: ref.ref,
				mediaType: 'audio',
				onAutoPlayError: null,
				logLevel,
				mountTime,
				reason: 'playing all audios',
			});
		});
	}, [logLevel, mountTime, refs]);

	const value: SharedContext = useMemo(() => {
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

	// Fixing a bug: In React, if a component is unmounted using useInsertionEffect, then
	// the cleanup function does sometimes not work properly. That is why when we
	// are changing the composition, we reset the audio state.

	// TODO: Possibly this does not save the problem completely, since the
	// if an audio tag that is inside a sequence will also not be removed
	// from the shared audios.

	const resetAudio = useCallback(() => {
		takenAudios.current = new Array(numberOfAudioTags).fill(false);
		audios.current = [];
		rerenderAudios();
	}, [numberOfAudioTags, rerenderAudios]);

	useEffect(() => {
		return () => {
			resetAudio();
		};
	}, [component, resetAudio]);

	return (
		<SharedAudioContext.Provider value={value}>
			{refs.map(({id, ref}) => {
				return (
					// Without preload="metadata", iOS will seek the time internally
					// but not actually with sound. Adding `preload="metadata"` helps here.
					// https://discord.com/channels/809501355504959528/817306414069710848/1130519583367888906
					<audio key={id} ref={ref} preload="metadata" src={EMPTY_AUDIO} />
				);
			})}
			{children}
		</SharedAudioContext.Provider>
	);
};

export const useSharedAudio = (aud: RemotionAudioProps, audioId: string) => {
	const ctx = useContext(SharedAudioContext);

	/**
	 * We work around this in React 18 so an audio tag will only register itself once
	 */
	const [elem] = useState((): AudioElem => {
		if (ctx && ctx.numberOfAudioTags > 0) {
			return ctx.registerAudio(aud, audioId);
		}

		return {
			el: React.createRef<HTMLAudioElement>(),
			id: Math.random(),
			props: aud,
			audioId,
		};
	});

	/**
	 * Effects in React 18 fire twice, and we are looking for a way to only fire it once.
	 * - useInsertionEffect only fires once. If it's available we are in React 18.
	 * - useLayoutEffect only fires once in React 17.
	 *
	 * Need to import it from React to fix React 17 ESM support.
	 */
	const effectToUse = React.useInsertionEffect ?? React.useLayoutEffect;

	if (typeof document !== 'undefined') {
		effectToUse(() => {
			if (ctx && ctx.numberOfAudioTags > 0) {
				ctx.updateAudio({id: elem.id, aud, audioId});
			}
		}, [aud, ctx, elem.id, audioId]);

		effectToUse(() => {
			return () => {
				if (ctx && ctx.numberOfAudioTags > 0) {
					ctx.unregisterAudio(elem.id);
				}
			};
		}, [ctx, elem.id]);
	}

	return elem;
};
