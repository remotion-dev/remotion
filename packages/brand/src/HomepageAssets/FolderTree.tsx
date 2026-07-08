import React from 'react';
import {
	AbsoluteFill,
	Composition,
	Easing,
	Interactive,
	interpolate,
	interpolateColors,
	useCurrentFrame,
} from 'remotion';
import {ExtrudeDiv} from '../3DContext/Div3D';

const panelWidth = 360;
const panelHeight = 98;
const panelRadius = 8;
const contentPadding = 4;
const rowHeight = 32;
const rowGap = 1;
const selectionHeight = 28;
const selectionRadius = Math.max(panelRadius - contentPadding, 0);
const childRowOffset = rowHeight + rowGap;
const finalSelectionY = panelHeight - contentPadding - selectionHeight;

export const FolderTree: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill className="justify-center items-center">
			<ExtrudeDiv
				height={panelHeight}
				depth={27}
				cornerRadius={panelRadius}
				translationX={-15}
				translationY={5}
				scaleX={1.15}
				scaleY={1.15}
				scaleZ={1.15}
				rotationX={0.12}
				rotationY={-0.54}
				rotationZ={-0.06}
				backFace={
					<Interactive.Div
						style={{
							backgroundColor: '#141414',
							borderRadius: panelRadius,
							height: '100%',
							width: '100%',
						}}
					/>
				}
				translationZ={3}
			>
				<Interactive.Div
					style={{
						backgroundColor: 'rgb(31,36,40)',
						borderRadius: panelRadius,
						height: panelHeight,
						overflow: 'hidden',
						position: 'relative',
						width: panelWidth,
					}}
				>
					<Interactive.Div
						style={{
							backgroundColor: 'hsla(0, 0%, 100%, 0.15)',
							borderRadius: selectionRadius,
							height: selectionHeight,
							left: contentPadding,
							position: 'absolute',
							right: contentPadding,
							top: 0,
							translate: interpolate(
								frame,
								[0, 18, 84, 119],
								[
									`0px ${childRowOffset + contentPadding / 2}px`,
									`0px ${childRowOffset + contentPadding / 2}px`,
									`0px ${finalSelectionY}px`,
									`0px ${finalSelectionY}px`,
								],
								{
									easing: Easing.bezier(0.16, 1, 0.3, 1),
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								},
							),
						}}
					/>
					<Interactive.Div
						style={{
							alignItems: 'center',
							boxSizing: 'border-box',
							display: 'flex',
							fontFamily:
								'-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
							fontSize: 13,
							height: rowHeight,
							left: contentPadding,
							lineHeight: '18px',
							paddingLeft: 12,
							paddingRight: 10,
							position: 'absolute',
							right: contentPadding,
							top: 0,
							translate: '0px 0px',
							userSelect: 'none',
						}}
					>
						<Interactive.Svg
							viewBox="0 0 576 512"
							style={{
								flexShrink: 0,
								height: 18,
								width: 18,
							}}
						>
							<Interactive.Path
								fill="#A6A7A9"
								d="M566.6 211.6C557.5 199.1 543.4 192 527.1 192H134.2C114.3 192 96.2 204.5 89.23 223.1L32 375.8V96c0-17.64 14.36-32 32-32h117.5c8.549 0 16.58 3.328 22.63 9.375L258.7 128H448c17.64 0 32 14.36 32 32h32c0-35.35-28.65-64-64-64H272L226.7 50.75C214.7 38.74 198.5 32 181.5 32H64C28.65 32 0 60.65 0 96v320c0 35.35 28.65 64 64 64h403.1c21.11 0 39.53-13.53 45.81-33.69l60-192C578.4 239.6 575.8 224 566.6 211.6zM543.2 244.8l-60 192C481.1 443.5 475 448 467.1 448H64c-3.322 0-6.357-.9551-9.373-1.898c-2.184-1.17-4.109-2.832-5.596-4.977c-3.031-4.375-3.703-9.75-1.828-14.73l72-192C121.5 228.2 127.5 224 134.2 224h393.8c5.141 0 9.844 2.375 12.89 6.516C543.9 234.7 544.8 239.9 543.2 244.8z"
							/>
						</Interactive.Svg>
						<Interactive.Div
							style={{
								color: '#A6A7A9',
								marginLeft: 8,
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
							}}
						>
							assets
						</Interactive.Div>
					</Interactive.Div>
					<Interactive.Div
						style={{
							alignItems: 'center',
							boxSizing: 'border-box',
							display: 'flex',
							fontFamily:
								'-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
							fontSize: 13,
							height: rowHeight,
							left: contentPadding,
							lineHeight: '18px',
							paddingLeft: 20,
							paddingRight: 10,
							position: 'absolute',
							right: contentPadding,
							top: 0,
							translate: `0px ${childRowOffset}px`,
							userSelect: 'none',
						}}
					>
						<Interactive.Svg
							viewBox="0 0 512 512"
							style={{
								flexShrink: 0,
								height: 18,
								width: 18,
							}}
						>
							<Interactive.Path
								fill={interpolateColors(
									interpolate(frame, [0, 18, 84, 119], [1, 1, 0, 0], {
										easing: Easing.bezier(0.16, 1, 0.3, 1),
										extrapolateLeft: 'clamp',
										extrapolateRight: 'clamp',
									}),
									[0, 1],
									['#A6A7A9', '#fff'],
								)}
								d="M448 32H64C28.65 32 0 60.65 0 96v320c0 35.35 28.65 64 64 64h384c35.35 0 64-28.65 64-64V96C512 60.65 483.3 32 448 32zM384 64v176H128V64H384zM32 96c0-17.64 14.36-32 32-32h32v80H32V96zM32 176h64v64H32V176zM32 272h64v64H32V272zM64 448c-17.64 0-32-14.36-32-32v-48h64V448H64zM128 448V272h256V448H128zM480 416c0 17.64-14.36 32-32 32h-32v-80h64V416zM480 336h-64v-64h64V336zM480 240h-64v-64h64V240zM480 144h-64V64h32c17.64 0 32 14.36 32 32V144z"
							/>
						</Interactive.Svg>
						<Interactive.Div
							style={{
								color: interpolateColors(
									interpolate(frame, [0, 18, 84, 119], [1, 1, 0, 0], {
										easing: Easing.bezier(0.16, 1, 0.3, 1),
										extrapolateLeft: 'clamp',
										extrapolateRight: 'clamp',
									}),
									[0, 1],
									['#A6A7A9', '#fff'],
								),
								marginLeft: 8,
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
							}}
						>
							animated-logo
						</Interactive.Div>
					</Interactive.Div>
					<Interactive.Div
						style={{
							alignItems: 'center',
							boxSizing: 'border-box',
							display: 'flex',
							fontFamily:
								'-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
							fontSize: 13,
							height: rowHeight,
							left: contentPadding,
							lineHeight: '18px',
							paddingLeft: 20,
							paddingRight: 10,
							position: 'absolute',
							right: contentPadding,
							top: 0,
							translate: `0px ${childRowOffset * 2}px`,
							userSelect: 'none',
						}}
					>
						<Interactive.Svg
							viewBox="0 0 512 512"
							style={{
								flexShrink: 0,
								height: 18,
								width: 18,
							}}
						>
							<Interactive.Path
								fill={interpolateColors(
									interpolate(frame, [0, 18, 84, 119], [0, 0, 1, 1], {
										easing: Easing.bezier(0.16, 1, 0.3, 1),
										extrapolateLeft: 'clamp',
										extrapolateRight: 'clamp',
									}),
									[0, 1],
									['#A6A7A9', '#fff'],
								)}
								d="M448 32H64C28.65 32 0 60.65 0 96v320c0 35.35 28.65 64 64 64h384c35.35 0 64-28.65 64-64V96C512 60.65 483.3 32 448 32zM384 64v176H128V64H384zM32 96c0-17.64 14.36-32 32-32h32v80H32V96zM32 176h64v64H32V176zM32 272h64v64H32V272zM64 448c-17.64 0-32-14.36-32-32v-48h64V448H64zM128 448V272h256V448H128zM480 416c0 17.64-14.36 32-32 32h-32v-80h64V416zM480 336h-64v-64h64V336zM480 240h-64v-64h64V240zM480 144h-64V64h32c17.64 0 32 14.36 32 32V144z"
							/>
						</Interactive.Svg>
						<Interactive.Div
							style={{
								color: interpolateColors(
									interpolate(frame, [0, 18, 84, 119], [0, 0, 1, 1], {
										easing: Easing.bezier(0.16, 1, 0.3, 1),
										extrapolateLeft: 'clamp',
										extrapolateRight: 'clamp',
									}),
									[0, 1],
									['#A6A7A9', '#fff'],
								),
								marginLeft: 8,
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
							}}
						>
							endcard
						</Interactive.Div>
					</Interactive.Div>
				</Interactive.Div>
			</ExtrudeDiv>
		</AbsoluteFill>
	);
};

export const FolderTreeComposition: React.FC = () => {
	return (
		<Composition
			id="FolderTree"
			component={FolderTree}
			durationInFrames={120}
			fps={30}
			width={480}
			height={160}
		/>
	);
};
