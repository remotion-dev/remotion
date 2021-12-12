import React, {
	createContext,
	createRef,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import {RemotionAudioProps} from './props';

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
	el: React.RefObject<HTMLAudioElement>;
};

const EMPTY_AUDIO =
	'data:audio/mp3;base64,/+MYxAAJcAV8AAgAABn//////+/gQ5BAMA+D4Pg+BAQBAEAwD4Pg+D4EBAEAQDAPg++hYBH///hUFQVBUFREDQNHmf///////+MYxBUGkAGIMAAAAP/29Xt6lUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxDUAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';

type SharedContext = {
	registerAudio: (aud: RemotionAudioProps) => AudioElem;
	unregisterAudio: (id: number) => void;
	updateAudio: (id: number, aud: RemotionAudioProps) => void;
	playAllAudios: () => void;
	numberOfAudioTags: number;
};

type Ref = {
	id: number;
	ref: React.RefObject<HTMLAudioElement>;
};

export const SharedAudioContext = createContext<SharedContext | null>(null);

export const SharedAudioContextProvider: React.FC<{
	numberOfAudioTags: number;
}> = ({children, numberOfAudioTags}) => {
	const [state, setState] = useState<{
		audios: AudioElem[];
		refs: Ref[];
		takenAudios: (false | number)[];
	}>(() => {
		return {
			audios: [],
			refs: new Array(numberOfAudioTags).fill(true).map(() => {
				return {id: Math.random(), ref: createRef<HTMLAudioElement>()};
			}),
			takenAudios: new Array(numberOfAudioTags).fill(false),
		};
	});
	const [initialNumberOfAudioTags] = useState(numberOfAudioTags);

	if (numberOfAudioTags !== initialNumberOfAudioTags) {
		throw new Error(
			'The number of shared audio tags has changed dynamically. Once you have set this property, you cannot change it afterwards.'
		);
	}

	const registerAudio = useCallback(
		(aud: RemotionAudioProps) => {
			// We need a timeout because this state setting is triggered by another state being set, causing React to throw an error.
			// By setting a timeout, we are bypassing the error and allowing the state
			// to be updated in the next tick.
			// This can lead to a tiny delay of audio playback, improvement ideas are welcome.

			const firstFreeAudio = state.takenAudios.findIndex((a) => a === false);
			const {id} = state.refs[firstFreeAudio];
			const newElem: AudioElem = {
				props: aud,
				id,
				el: state.refs[firstFreeAudio].ref,
			};

			setTimeout(() => {
				setState((prevState) => {
					if (firstFreeAudio === -1) {
						throw new Error(
							`Tried to simultaneously mount ${
								numberOfAudioTags + 1
							} <Audio /> tags at the same time. With the current settings, the maximum amount of <Audio /> tags is limited to ${numberOfAudioTags} at the same time. Remotion pre-mounts silent audio tags to help avoid browser autoplay restrictions. See https://remotion.dev/docs/player#numberofsharedaudiotags for more information on how to increase this limit.`
						);
					}

					const cloned = [...state.takenAudios];
					cloned[firstFreeAudio] = id;

					return {
						audios: [...prevState.audios, newElem],
						refs: prevState.refs,
						takenAudios: cloned,
					};
				});
			}, 4);
			return newElem;
		},
		[numberOfAudioTags, state.refs, state.takenAudios]
	);

	const unregisterAudio = useCallback((id: number) => {
		setState((prevState) => {
			const cloned = [...prevState.takenAudios];
			const index = prevState.refs.findIndex((r) => r.id === id);
			if (index === -1) {
				throw new TypeError('Error occured in ');
			}

			cloned[index] = false;
			return {
				audios: prevState.audios.filter((a) => a.id !== id),
				refs: prevState.refs,
				takenAudios: cloned,
			};
		});
	}, []);

	const updateAudio = useCallback((id: number, aud: RemotionAudioProps) => {
		setState((prevState) => {
			return {
				...prevState,
				audios: prevState.audios.map((prevA): AudioElem => {
					if (prevA.id === id) {
						return {
							...prevA,
							props: aud,
						};
					}

					return prevA;
				}),
			};
		});
	}, []);

	const playAllAudios = useCallback(() => {
		state.refs.forEach((ref) => {
			ref.ref.current?.play();
		});
	}, [state.refs]);

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
	return (
		<SharedAudioContext.Provider value={value}>
			{state.refs.map(({id, ref}) => {
				const data = state.audios.find((a) => a.id === id);
				if (data === undefined) {
					return <audio key={id} ref={ref} src={EMPTY_AUDIO} />;
				}

				if (!data) {
					throw new TypeError('Expected audio data to be there');
				}

				return <audio key={id} ref={ref} {...data.props} />;
			})}
			{children}
		</SharedAudioContext.Provider>
	);
};

export const useSharedAudio = (aud: RemotionAudioProps) => {
	const ctx = useContext(SharedAudioContext);

	const [elem] = useState((): AudioElem => {
		if (ctx && ctx.numberOfAudioTags > 0) {
			return ctx.registerAudio(aud);
		}

		return {
			el: React.createRef<HTMLAudioElement>(),
			id: Math.random(),
			props: aud,
		};
	});

	useEffect(() => {
		return () => {
			if (ctx && ctx.numberOfAudioTags > 0) {
				ctx.unregisterAudio(elem.id);
			}
		};
	}, [ctx, elem.id]);

	useEffect(() => {
		if (ctx && ctx.numberOfAudioTags > 0) {
			ctx.updateAudio(elem.id, aud);
		}
	}, [aud, ctx, elem.id]);

	return elem;
};
