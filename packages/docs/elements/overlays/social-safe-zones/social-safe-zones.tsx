import React, {forwardRef, useId, useImperativeHandle, useRef} from 'react';
import {
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
		readonly direction?: 'ltr' | 'rtl';
		readonly forceVisibleForPreview?: boolean;
		readonly overlayOpacity?: number;
		readonly platform?: 'instagram' | 'tiktok' | 'youtube';
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
			tiktok: {
				direction: {
					type: 'enum',
					default: 'ltr',
					description: 'Interface direction',
					keyframable: false,
					variants: {
						ltr: {},
						rtl: {},
					},
				},
			},
			youtube: {},
		},
	},
	showInterface: {
		type: 'boolean',
		default: true,
		description: 'Show illustrative interface',
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
			direction = 'ltr',
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
		const isNineBySixteen = Math.abs(width / height - 9 / 16) < 0.001;

		useImperativeHandle(ref, () => outlineRef.current as HTMLDivElement, []);

		if ((!isStudio || isRendering) && !forceVisibleForPreview) {
			return null;
		}

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
					{isNineBySixteen ? (
						<svg
							aria-hidden="true"
							height="100%"
							preserveAspectRatio="none"
							viewBox="0 0 1080 1920"
							width="100%"
						>
							<defs>
								<filter
									id={`${maskId}-shadow`}
									x="-50%"
									y="-50%"
									width="200%"
									height="200%"
								>
									<feDropShadow
										dx="0"
										dy="3"
										floodColor="#000000"
										floodOpacity="0.55"
										stdDeviation="5"
									/>
								</filter>
								<mask
									height="1920"
									id={maskId}
									maskUnits="userSpaceOnUse"
									width="1080"
									x="0"
									y="0"
								>
									<rect fill="white" height="1920" width="1080" />
									{platform === 'tiktok' ? (
										// Checked 2026-08-24 against TikTok's official 720×1280
										// In-Feed Standard LTR template. Original safe polygon:
										// M80 160 H640 V560 H520 V840 H80 Z
										// https://ads.tiktok.com/help/article/tiktok-auction-in-feed-ads
										<path
											d="M120 240 H960 V840 H780 V1260 H120 Z"
											fill="black"
											transform={
												direction === 'rtl'
													? 'translate(1080 0) scale(-1 1)'
													: undefined
											}
										/>
									) : null}
									{platform === 'instagram' ? (
										// Checked 2026-08-24 against Meta's official Reels ad
										// guidance: 14% top, 35% bottom, and 6% on each side.
										// https://www.facebook.com/business/ads-guide/update/video/instagram-reels
										<rect
											fill="black"
											height="979.2"
											width="950.4"
											x="64.8"
											y="268.8"
										/>
									) : null}
									{platform === 'youtube' ? (
										// Checked 2026-08-24 against Google Ads' official
										// 1080×1920 vertical-video safe-zone diagram.
										// https://support.google.com/google-ads/answer/9128498
										<rect
											fill="black"
											height="960"
											width="840"
											x="48"
											y="288"
										/>
									) : null}
								</mask>
							</defs>

							<rect
								fill="#ff3158"
								height="1920"
								mask={`url(#${maskId})`}
								opacity={overlayOpacity}
								width="1080"
							/>

							{platform === 'tiktok' ? (
								<>
									<path
										d="M120 240 H960 V840 H780 V1260 H120 Z"
										fill="none"
										stroke="#c8ff3d"
										strokeDasharray="22 16"
										strokeWidth="8"
										transform={
											direction === 'rtl'
												? 'translate(1080 0) scale(-1 1)'
												: undefined
										}
									/>
									{showInterface ? (
										<g
											fill="none"
											stroke="white"
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="11"
											transform={
												direction === 'rtl'
													? 'translate(1080 0) scale(-1 1)'
													: undefined
											}
										>
											<path d="M385 124 H695" opacity="0.85" />
											<path d="M435 172 H645" opacity="0.55" />
											<circle cx="904" cy="870" r="43" />
											<path d="M878 1000 Q904 970 930 1000 Q950 1025 904 1060 Q858 1025 878 1000 Z" />
											<path d="M875 1140 H933 V1178 H909 L883 1202 V1178 H875 Z" />
											<path d="M878 1304 L936 1275 L918 1342 L902 1318 Z" />
											<path d="M120 1440 H580" />
											<path d="M120 1490 H485" opacity="0.7" />
											<path d="M120 1540 H390" opacity="0.45" />
											<rect height="96" rx="18" width="840" x="120" y="1660" />
											<path d="M170 1708 H700" opacity="0.65" />
										</g>
									) : null}
								</>
							) : null}

							{platform === 'instagram' ? (
								<>
									<rect
										fill="none"
										height="979.2"
										stroke="#c8ff3d"
										strokeDasharray="22 16"
										strokeWidth="8"
										width="950.4"
										x="64.8"
										y="268.8"
									/>
									{showInterface ? (
										<g
											fill="none"
											stroke="white"
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="11"
										>
											<path d="M90 132 H310" />
											<path d="M910 105 L970 165 M970 105 L910 165" />
											<circle cx="1042" cy="1000" r="22" />
											<path d="M1024 1125 Q1042 1105 1060 1125 Q1072 1142 1042 1165 Q1012 1142 1024 1125 Z" />
											<path d="M1018 1260 H1066 V1292 H1047 L1026 1312 V1292 H1018 Z" />
											<path d="M1018 1410 L1068 1385 L1053 1442 L1039 1422 Z" />
											<circle cx="125" cy="1425" r="46" />
											<path d="M205 1408 H690" />
											<path d="M205 1455 H595" opacity="0.65" />
											<path d="M125 1540 H660" opacity="0.55" />
											<rect height="92" rx="46" width="830" x="90" y="1690" />
											<circle cx="978" cy="1736" r="34" />
										</g>
									) : null}
								</>
							) : null}

							{platform === 'youtube' ? (
								<>
									<rect
										fill="none"
										height="960"
										stroke="#c8ff3d"
										strokeDasharray="22 16"
										strokeWidth="8"
										width="840"
										x="48"
										y="288"
									/>
									{showInterface ? (
										<g
											fill="none"
											stroke="white"
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="11"
										>
											<path d="M75 140 H280" />
											<circle cx="954" cy="770" r="43" />
											<path d="M928 920 Q954 890 980 920 Q1000 945 954 980 Q908 945 928 920 Z" />
											<path d="M925 1070 H983 V1108 H959 L933 1132 V1108 H925 Z" />
											<path d="M928 1228 L986 1198 L968 1266 L952 1242 Z" />
											<circle cx="950" cy="1410" r="48" />
											<path d="M72 1410 H700" />
											<path d="M72 1465 H575" opacity="0.65" />
											<circle cx="120" cy="1580" r="48" />
											<path d="M205 1562 H650" />
											<path d="M205 1610 H500" opacity="0.55" />
											<rect height="92" rx="20" width="820" x="72" y="1730" />
										</g>
									) : null}
								</>
							) : null}

							<g filter={`url(#${maskId}-shadow)`}>
								<rect
									fill="#111318"
									height="76"
									rx="18"
									width="610"
									x="40"
									y="40"
								/>
								<text
									fill="white"
									fontFamily="Arial, Helvetica, sans-serif"
									fontSize="31"
									fontWeight="700"
									x="72"
									y="90"
								>
									{platform === 'tiktok'
										? 'TikTok · In-Feed ad reference'
										: platform === 'instagram'
											? 'Instagram · Reels ad reference'
											: 'YouTube · Vertical ad reference'}
								</text>
							</g>
							<text
								fill="#c8ff3d"
								fontFamily="Arial, Helvetica, sans-serif"
								fontSize="29"
								fontWeight="700"
								letterSpacing="4"
								paintOrder="stroke"
								stroke="#111318"
								strokeWidth="9"
								textAnchor="middle"
								x="540"
								y={platform === 'youtube' ? 345 : 325}
							>
								SAFE AREA
							</text>
						</svg>
					) : (
						<div
							style={{
								alignItems: 'center',
								display: 'flex',
								height: '100%',
								justifyContent: 'center',
								padding: Math.max(24, Math.min(width, height) * 0.05),
								width: '100%',
							}}
						>
							<div
								style={{
									backgroundColor: 'rgba(17, 19, 24, 0.92)',
									border: '3px solid #ff3158',
									borderRadius: 18,
									boxShadow: '0 8px 28px rgba(0, 0, 0, 0.35)',
									color: 'white',
									fontFamily: 'Arial, Helvetica, sans-serif',
									fontSize: Math.max(20, Math.min(width, height) * 0.035),
									fontWeight: 700,
									lineHeight: 1.3,
									maxWidth: 720,
									padding: '24px 32px',
									textAlign: 'center',
								}}
							>
								Social Safe Zones is calibrated for 9:16 compositions
							</div>
						</div>
					)}
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
