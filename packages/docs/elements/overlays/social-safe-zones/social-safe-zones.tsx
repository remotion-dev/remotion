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

		// Both paths are measured from representative iOS captures of full-green
		// videos, rather than inferred from platform marketing material.
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

							{platform === 'tiktok' && showInterface ? (
								<g
									filter={`url(#${maskId}-shadow)`}
									fontFamily="Arial, Helvetica, sans-serif"
								>
									<g
										fill="none"
										stroke="white"
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="5"
									>
										<path d="M64 66 L44 87 L64 108" strokeWidth="7" />
										<rect height="90" rx="22" width="919" x="121" y="42" />
										<circle cx="168" cy="85" r="19" />
										<path d="M182 99 L196 113" />
										<path d="M856 58 V116" opacity="0.35" strokeWidth="2" />
									</g>
									<text fill="white" fontSize="31" fontWeight="600" x="216" y="97">
										Search
									</text>
									<text fill="white" fontSize="29" fontWeight="700" x="896" y="97">
										Search
									</text>

									<g stroke="white" strokeLinejoin="round">
										<circle
											cx="1003"
											cy="829"
											fill="rgba(255, 255, 255, 0.18)"
											r="29"
											stroke="none"
										/>
										<circle cx="1003" cy="829" fill="none" r="17" strokeWidth="5" />
										<circle cx="996" cy="829" fill="white" r="2.5" stroke="none" />
										<circle cx="1003" cy="829" fill="white" r="2.5" stroke="none" />
										<circle cx="1010" cy="829" fill="white" r="2.5" stroke="none" />

										<circle cx="1003" cy="973" fill="#dadde1" r="52" strokeWidth="4" />
										<circle cx="1003" cy="960" fill="none" r="17" stroke="#555b63" strokeWidth="5" />
										<path
											d="M971 1000 Q1003 972 1035 1000"
											fill="none"
											stroke="#555b63"
											strokeWidth="5"
										/>
										<circle cx="1003" cy="1025" fill="#fe2c55" r="25" stroke="none" />
										<path d="M991 1025 H1015 M1003 1013 V1037" fill="none" strokeWidth="5" />

										<path
											d="M1003 1186 C991 1176 968 1161 968 1138 C968 1118 993 1110 1003 1128 C1013 1110 1038 1118 1038 1138 C1038 1161 1015 1176 1003 1186 Z"
											fill="white"
											stroke="none"
										/>
										<path
											d="M973 1297 H1033 V1340 H1012 L989 1360 V1340 H973 Z"
											fill="white"
											stroke="none"
										/>
										<path
											d="M979 1460 H1027 V1520 L1003 1504 L979 1520 Z"
											fill="white"
											stroke="none"
										/>
										<path
											d="M968 1650 L1017 1611 V1634 C1040 1638 1052 1654 1056 1678 C1045 1664 1033 1659 1017 1659 V1682 Z"
											fill="white"
											stroke="none"
										/>
										<circle cx="1003" cy="1867" fill="#dadde1" r="37" strokeWidth="4" />
									</g>
									<g fill="white" fontSize="24" fontWeight="600" textAnchor="middle">
										<text x="1003" y="1234">12K</text>
										<text x="1003" y="1402">306</text>
										<text x="1003" y="1570">1K</text>
										<text x="1003" y="1731">Share</text>
									</g>
									<g fill="white">
										<text fontSize="34" fontWeight="700" x="31" y="1782">
											@creator
										</text>
										<text fontSize="32" x="31" y="1848">
											Caption text for your video
										</text>
										<text fontSize="32" fontWeight="700" x="31" y="1896">
											#hashtag · more
										</text>
									</g>
								</g>
							) : null}

							{platform === 'instagram' && showInterface ? (
								<g
									filter={`url(#${maskId}-shadow)`}
									fontFamily="Arial, Helvetica, sans-serif"
								>
									<rect fill="black" height="82" rx="41" width="482" x="313" y="26" />
									<text fill="white" fontSize="31" fontWeight="600" x="127" y="77">
										9:41
									</text>
									<g fill="none" stroke="white" strokeLinecap="round" strokeWidth="6">
										<path d="M151 168 L127 190 L151 212" />
										<circle cx="950" cy="188" r="21" />
										<path d="M966 204 L980 218" />
										<path d="M833 69 Q851 48 869 69 M840 77 Q851 65 862 77" strokeWidth="5" />
										<rect height="29" rx="7" width="55" x="890" y="53" />
									</g>

									<g fill="white" stroke="white" strokeLinejoin="round">
										<path
											d="M956 1163 C944 1153 930 1142 930 1127 C930 1110 949 1103 956 1118 C963 1103 982 1110 982 1127 C982 1142 968 1153 956 1163 Z"
											fill="none"
											strokeWidth="6"
										/>
										<path
											d="M931 1281 H981 V1317 H964 L944 1334 V1317 H931 Z"
											fill="none"
											strokeWidth="6"
										/>
										<path
											d="M932 1387 H974 M974 1387 L961 1374 M974 1387 L961 1400 M980 1421 H938 M938 1421 L951 1408 M938 1421 L951 1434"
											fill="none"
											strokeLinecap="round"
											strokeWidth="6"
										/>
										<path
											d="M930 1569 L982 1544 L965 1601 L951 1579 Z"
											fill="none"
											strokeWidth="6"
										/>
										<path d="M934 1719 H978 M934 1738 H966" fill="none" strokeLinecap="round" strokeWidth="6" />
									</g>
									<g fill="white" fontSize="24" fontWeight="600" textAnchor="middle">
										<text x="956" y="1217">21</text>
										<text x="956" y="1356">1</text>
										<text x="956" y="1492">8</text>
										<text x="956" y="1648">Share</text>
									</g>
									<circle cx="130" cy="1766" fill="#dadde1" r="40" stroke="white" strokeWidth="4" />
									<g fill="white">
										<text fontSize="31" fontWeight="700" x="191" y="1755">
											creator
										</text>
										<rect fill="none" height="48" rx="14" stroke="white" strokeWidth="3" width="122" x="480" y="1718" />
										<text fontSize="27" fontWeight="700" x="501" y="1752">
											Follow
										</text>
										<text fontSize="27" opacity="0.75" x="191" y="1800">
											♫ Original audio
										</text>
										<text fontSize="31" x="92" y="1858">
											Caption text #hashtag · more
										</text>
									</g>
									<rect fill="#dadde1" height="68" rx="16" stroke="white" strokeWidth="4" width="68" x="922" y="1805" />
								</g>
							) : null}

					</svg>
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
