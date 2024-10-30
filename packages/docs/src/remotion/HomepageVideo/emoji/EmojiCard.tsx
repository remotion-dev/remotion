import React, {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
} from 'react';
import {AbsoluteFill} from 'remotion';
import {DisplayedEmoji} from './DisplayedEmoji';

export type EmojiCardRef = {
	onLeft: () => void;
	onRight: () => void;
};

type Transforms = [number, number, number];

type Anim = {
	ref1: HTMLDivElement;
	ref2: HTMLDivElement;
	ref3: HTMLDivElement;
	transforms: Transforms;
};

const applyTransforms = ({ref1, ref2, ref3, transforms}: Anim) => {
	ref1.style.transform = `translateX(${transforms[0]}%)`;
	ref2.style.transform = `translateX(${transforms[1]}%)`;
	ref3.style.transform = `translateX(${transforms[2]}%)`;
};

const waitForRaq = async () => {
	await new Promise((resolve) => {
		requestAnimationFrame(resolve);
	});
};

const moveLeft = async ({ref1, ref2, ref3, transforms}: Anim) => {
	for (let i = 0; i < 20; i++) {
		transforms[0] -= 5;
		transforms[1] -= 5;
		transforms[2] -= 5;
		applyTransforms({ref1, ref2, ref3, transforms});
		await waitForRaq();
	}
};

const moveRight = async ({ref1, ref2, ref3, transforms}: Anim) => {
	for (let i = 0; i < 20; i++) {
		transforms[0] += 5;
		transforms[1] += 5;
		transforms[2] += 5;
		applyTransforms({ref1, ref2, ref3, transforms});
		await waitForRaq();
	}
};

const EmojiCardRefFn: React.ForwardRefRenderFunction<EmojiCardRef> = (
	_,
	ref,
) => {
	const ref1 = useRef<HTMLDivElement>(null);
	const ref2 = useRef<HTMLDivElement>(null);
	const ref3 = useRef<HTMLDivElement>(null);
	const transforms = useRef<Transforms>([-100, 0, 100]);

	const onLeft = useCallback(() => {
		if (!ref1.current || !ref2.current || !ref3.current) {
			return;
		}

		moveLeft({
			ref1: ref1.current,
			ref2: ref2.current,
			ref3: ref3.current,
			transforms: transforms.current,
		});
	}, []);

	const onRight = useCallback(() => {
		if (!ref1.current || !ref2.current || !ref3.current) {
			return;
		}

		moveRight({
			ref1: ref1.current,
			ref2: ref2.current,
			ref3: ref3.current,
			transforms: transforms.current,
		});
	}, []);

	useEffect(() => {
		if (!ref1.current || !ref2.current || !ref3.current) {
			return;
		}

		applyTransforms({
			ref1: ref1.current,
			ref2: ref2.current,
			ref3: ref3.current,
			transforms: transforms.current,
		});
	}, []);

	useImperativeHandle(ref, () => {
		return {
			onLeft,
			onRight,
		};
	}, [onLeft, onRight]);

	useEffect(() => {
		if (!ref1.current || !ref2.current || !ref3.current) {
			return;
		}

		applyTransforms({
			ref1: ref1.current,
			ref2: ref2.current,
			ref3: ref3.current,
			transforms: transforms.current,
		});
	}, []);

	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				overflow: 'hidden',
			}}
		>
			<div
				style={{
					color: '#0b84f3',
					fontFamily: 'GTPlanar',
					fontWeight: '500',
					fontSize: 13,
					textAlign: 'center',
					position: 'absolute',
					marginTop: -90,
				}}
			>
				Choose an emoji
			</div>
			<div
				style={{
					position: 'absolute',
					width: '300%',
					display: 'flex',
					whiteSpace: 'nowrap',
					height: '100%',
				}}
			>
				<div
					ref={ref1}
					style={{
						width: '100%',
						position: 'absolute',
						left: '100%',
						top: 'calc(50% - 50px)',
					}}
				>
					<DisplayedEmoji emoji={'melting'} />
				</div>
				<div
					ref={ref2}
					style={{
						width: '100%',
						position: 'absolute',
						left: '100%',
						top: 'calc(50% - 50px)',
					}}
				>
					<DisplayedEmoji emoji={'partying-face'} />
				</div>
				<div
					ref={ref3}
					style={{
						width: '100%',
						position: 'absolute',
						left: '100%',
						top: 'calc(50% - 50px)',
					}}
				>
					<DisplayedEmoji emoji={'fire'} />
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const EmojiCard = forwardRef<EmojiCardRef, {}>(EmojiCardRefFn);
