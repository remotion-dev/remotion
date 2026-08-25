import React, {forwardRef, useId, useImperativeHandle, useRef} from 'react';
import {
	Img,
	Interactive,
	Sequence,
	type InteractiveBaseProps,
	type InteractiveTransformProps,
	type InteractivitySchema,
	type SequenceControls,
	useRemotionEnvironment,
	useVideoConfig,
} from 'remotion';

type SocialSafeZonesProps = InteractiveBaseProps &
	InteractiveTransformProps & {
		readonly forceVisibleForPreview?: boolean;
		readonly overlayOpacity?: number;
		readonly platform?: 'instagram' | 'tiktok';
		readonly showInterface?: boolean;
	};

const socialSafeZonesSchema = {
	...Interactive.baseSchema,
	platform: {
		type: 'enum',
		default: 'tiktok',
		description: 'Platform',
		keyframable: false,
		variants: {
			instagram: {},
			tiktok: {},
		},
	},
	showInterface: {
		type: 'boolean',
		default: true,
		description: 'Show interface reference',
		keyframable: false,
	},
	overlayOpacity: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.05,
		default: 0.45,
		description: 'Unsafe area opacity',
		hiddenFromList: false,
		keyframable: false,
	},
	forceVisibleForPreview: {type: 'hidden'},
} as const satisfies InteractivitySchema;

const SocialSafeZonesInner = forwardRef<
	HTMLDivElement,
	SocialSafeZonesProps & {
		readonly controls: SequenceControls | undefined;
	}
>(
	(
		{
			controls,
			forceVisibleForPreview = false,
			name,
			overlayOpacity = 0.45,
			platform = 'tiktok',
			showInterface = true,
			style,
			...sequenceProps
		},
		ref,
	) => {
		const outlineRef = useRef<HTMLDivElement>(null);
		const {height, width} = useVideoConfig();
		const {isRendering, isStudio} = useRemotionEnvironment();
		const maskId = `social-safe-zone-${useId().replaceAll(':', '')}`;

		useImperativeHandle(ref, () => outlineRef.current as HTMLDivElement, []);

		if ((!isStudio || isRendering) && !forceVisibleForPreview) {
			return null;
		}

		// Both paths and interface references are measured from representative
		// iOS captures of full-green videos, rather than inferred from platform
		// marketing material. Author-specific text and avatars were replaced in
		// the transparent interface images.
		//
		// TikTok: The 1290×2293 video region at y=139 in tiktok-layout.png was
		// mapped to 1080×1920. The path clears the search UI (ending at y=132),
		// the action rail (starting at x=949, y=803), and captions (y=1749).
		//
		// Instagram: The 1290×2550 Reels viewport in reels-layout.png displays a
		// 9:16 video with cover sizing. Mapping it back to 1080×1920 leaves the
		// visible source between x=54 and x=1026. The path clears the top controls
		// (ending at y=212), action rail (starting at x=927, y=1114), and captions
		// (y=1726).
		const safeAreaPath =
			platform === 'tiktok'
				? 'M24 160 H1050 V780 H930 V1715 H24 Z'
				: 'M55 235 H1025 V1090 H900 V1700 H55 Z';

		return (
			<Sequence
				layout="none"
				{...sequenceProps}
				controls={controls}
				name={name ?? '<SocialSafeZones>'}
				outlineRef={outlineRef}
			>
				<div
					ref={outlineRef}
					style={{
						...style,
						height,
						left: 0,
						pointerEvents: 'none',
						position: 'absolute',
						top: 0,
						width,
						zIndex: 2147483647,
					}}
				>
					<svg
						aria-hidden="true"
						height="100%"
						preserveAspectRatio="xMidYMid meet"
						viewBox="0 0 1080 1920"
						width="100%"
					>
						<defs>
							<mask
								height="1920"
								id={maskId}
								maskUnits="userSpaceOnUse"
								width="1080"
								x="0"
								y="0"
							>
								<rect fill="white" height="1920" width="1080" />
								<path d={safeAreaPath} fill="black" />
							</mask>
						</defs>

						<rect
							fill="#ff3158"
							height="1920"
							mask={`url(#${maskId})`}
							opacity={overlayOpacity}
							width="1080"
						/>

						<path
							d={safeAreaPath}
							fill="none"
							stroke="#c8ff3d"
							strokeDasharray="22 16"
							strokeWidth="8"
						/>
					</svg>

					{showInterface ? (
						<Img
							alt=""
							src={
								platform === 'tiktok'
									? 'https://remotion.media/elements/social-safe-zones/tiktok-interface.png'
									: 'https://remotion.media/elements/social-safe-zones/instagram-reels-interface-v3.png'
							}
							style={{
								height: '100%',
								left: 0,
								objectFit: 'contain',
								position: 'absolute',
								top: 0,
								width: '100%',
							}}
						/>
					) : null}
				</div>
			</Sequence>
		);
	},
);

export const SocialSafeZones = Interactive.withSchema({
	Component: SocialSafeZonesInner,
	componentName: '<SocialSafeZones>',
	componentIdentity: null,
	schema: socialSafeZonesSchema,
	supportsEffects: false,
}) as React.FC<SocialSafeZonesProps>;
