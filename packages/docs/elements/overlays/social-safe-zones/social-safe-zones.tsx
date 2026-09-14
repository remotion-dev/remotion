import React, {forwardRef, useImperativeHandle, useRef} from 'react';
import {
	CanvasImage,
	Interactive,
	Sequence,
	type InteractiveBaseProps,
	type InteractiveTransformProps,
	type InteractivitySchema,
	type SequenceControls,
} from 'remotion';

type SocialSafeZonesProps = InteractiveBaseProps &
	InteractiveTransformProps & {
		readonly platform?: 'instagram' | 'tiktok';
	};

const socialSafeZonesSchema = {
	...Interactive.baseSchema,
	platform: {
		type: 'enum',
		default: 'instagram',
		description: 'Platform',
		keyframable: false,
		variants: {
			instagram: {},
			tiktok: {},
		},
	},
	...Interactive.transformSchema,
} as const satisfies InteractivitySchema;

const SocialSafeZonesInner = forwardRef<
	HTMLDivElement,
	SocialSafeZonesProps & {
		readonly controls: SequenceControls | undefined;
	}
>(({controls, name, platform = 'instagram', style, ...sequenceProps}, ref) => {
	const outlineRef = useRef<HTMLDivElement>(null);

	useImperativeHandle(ref, () => outlineRef.current as HTMLDivElement, []);

	return (
		<Sequence
			layout="none"
			{...sequenceProps}
			controls={controls}
			name={name ?? 'Social Safe Zones'}
			outlineRef={outlineRef}
		>
			<div
				ref={outlineRef}
				style={{
					...style,
					height: 1920,
					left: 0,
					pointerEvents: 'none',
					position: 'absolute',
					top: 0,
					width: 1080,
					zIndex: 2147483647,
				}}
			>
				<CanvasImage
					aria-hidden="true"
					fit="cover"
					height={1920}
					name="Background"
					src="https://remotion.media/elements/commerce-tear-a-graphic.png"
					style={{
						height: '100%',
						left: 0,
						position: 'absolute',
						top: 0,
						width: '100%',
					}}
					width={1080}
				/>
				<CanvasImage
					aria-hidden="true"
					fit="contain"
					height={1920}
					showInTimeline={false}
					src={
						platform === 'tiktok'
							? 'https://remotion.media/elements/social-safe-zones/tiktok-interface.png'
							: 'https://remotion.media/elements/social-safe-zones/instagram-reels-interface-v3.png'
					}
					style={{
						height: '100%',
						left: 0,
						position: 'absolute',
						top: 0,
						width: '100%',
					}}
					width={1080}
				/>
			</div>
		</Sequence>
	);
});

export const SocialSafeZones = Interactive.withSchema({
	Component: SocialSafeZonesInner,
	componentName: '<SocialSafeZones>',
	schema: socialSafeZonesSchema,
	supportsEffects: false,
}) as React.FC<SocialSafeZonesProps>;
