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
import {RemotionAudioProps} from './props';

type AudioElem = {
	id: number;
	props: RemotionAudioProps;
	el: React.RefObject<HTMLAudioElement>;
};

const EMPTY_AUDIO =
	'SUQzBAAAAAACDVRYWFgAAAASAAADbWFqb3JfYnJhbmQATTRBIABUWFhYAAAAEQAAA21pbm9yX3ZlcnNpb24AMABUWFhYAAAAIAAAA2NvbXBhdGlibGVfYnJhbmRzAE00QSBpc29tbXA0MgBUWFhYAAAAfwAAA2lUdW5TTVBCACAwMDAwMDAwMCAwMDAwMDg0MCAwMDAwMDMwMyAwMDAwMDAwMDAwMDAwNEJEIDAwMDAwMDAwIDAwMDAwMDAwIDAwMDAwMDAwIDAwMDAwMDAwIDAwMDAwMDAwIDAwMDAwMDAwIDAwMDAwMDAwIDAwMDAwMDAwAFRTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAABgAAAogAcXFxcXFxcXFxcXFxcXFxcY6Ojo6Ojo6Ojo6Ojo6Ojo6OqqqqqqqqqqqqqqqqqqqqqsfHx8fHx8fHx8fHx8fHx8fH4+Pj4+Pj4+Pj4+Pj4+Pj4+P/////////////////////AAAAAExhdmM1OC4xMwAAAAAAAAAAAAAAACQDgAAAAAAAAAKIql7rrgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+MYxAALg13diAgEzAAoAZ/////81/oR/+eRv6n36v/53J////7dT29FPIzHqc76gbwgAUDdCMgAoGf/////4jF3/90X/J3y/+MYxA0MM134ABAKsH/6N////67KwkOkQiCLncaKoJ1c7jQVRdxhQiLKgwFHgOw0Wf/////njP/Gujf79xcQb/8X////+ulD/+MYxBcLu2YQAAgKsKERVViOyFKdFSRlKLxhQQxHOIibg7GFzv/////isjf/Q3+I6iqt///////GtLFVFVQxlRHeuV5VPdw7/+MYxCMLu2X8ABAKsKCwsEREREQ6BQVBjZ//CGa/ITmGQv/iE/////6rDbSq8rytc602qrqKjhZxWmFhU2igVA2ZFMiNNEZG/+MYxC8KM1ngAABRSH//8v/+ZEf///yyX8mCggVRyMv/7LLUMj5ZKRkyhnWVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVV/+MYxEEJU2FECABHSVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';

type SharedContext = {
	registerAudio: (aud: RemotionAudioProps) => AudioElem;
	unregisterAudio: (id: number) => void;
	updateAudio: (id: number, aud: RemotionAudioProps) => void;
	playAllAudios: () => void;
	numberOfAudioTags: number;
};

export const SharedAudioContext = createContext<SharedContext | null>(null);

export const SharedAudioContextProvider: React.FC<{
	numberOfAudioTags: number;
}> = ({children, numberOfAudioTags}) => {
	const [audios, setAudios] = useState<AudioElem[]>([]);
	const [initialNumberOfAudioTags] = useState(numberOfAudioTags);

	if (numberOfAudioTags !== initialNumberOfAudioTags) {
		throw new Error(
			'The number of shared audio tags has changed dynamically. Once you have set this property, you cannot change it afterwards.'
		);
	}

	const refs = useMemo(() => {
		return new Array(numberOfAudioTags).fill(true).map(() => {
			return {id: Math.random(), ref: createRef<HTMLAudioElement>()};
		});
	}, [numberOfAudioTags]);

	const takenAudios = useRef<(false | number)[]>(
		new Array(numberOfAudioTags).fill(false)
	);

	const registerAudio = useCallback(
		(aud: RemotionAudioProps) => {
			const firstFreeAudio = takenAudios.current.findIndex((a) => a === false);
			if (firstFreeAudio === -1) {
				throw new Error(
					`Tried to simultaneously mount ${
						numberOfAudioTags + 1
					} <Audio /> tags at the same time. With the current settings, the maximum amount of <Audio /> tags is limited to ${numberOfAudioTags} at the same time. Remotion pre-mounts silent audio tags to help avoid browser autoplay restrictions. See https://remotion.dev/docs/player#numberofsharedaudiotags for more information on how to increase this limit.`
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
			};
			setTimeout(() => {
				setAudios((prevAudios) => [...prevAudios, newElem]);
			}, 4);
			return newElem;
		},
		[numberOfAudioTags, refs]
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
			setAudios((prevAudios) => {
				return prevAudios.filter((a) => a.id !== id);
			});
		},
		[refs]
	);

	const updateAudio = useCallback((id: number, aud: RemotionAudioProps) => {
		setAudios((prevAudios) => {
			return prevAudios.map(
				(prevA): AudioElem => {
					if (prevA.id === id) {
						return {
							...prevA,
							props: aud,
						};
					}

					return prevA;
				}
			);
		});
	}, []);

	const playAllAudios = useCallback(() => {
		refs.forEach((ref) => {
			ref.ref.current?.play();
		});
	}, [refs]);

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
			{refs.map(({id, ref}) => {
				const data = audios.find((a) => a.id === id);
				if (data === undefined) {
					return (
						<audio
							key={id}
							ref={ref}
							src={`data:audio/mp3;base64,${EMPTY_AUDIO}`}
						/>
					);
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

	const [elem] = useState(
		(): AudioElem => {
			if (ctx && ctx.numberOfAudioTags > 0) {
				return ctx.registerAudio(aud);
			}

			return {
				el: React.createRef<HTMLAudioElement>(),
				id: Math.random(),
				props: aud,
			};
		}
	);

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
