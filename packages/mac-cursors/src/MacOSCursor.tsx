import type {CSSProperties} from 'react';
import React from 'react';
import type {
	InteractiveBaseProps,
	InteractivitySchema,
	SequenceControls,
} from 'remotion';
import {Img, Interactive, Sequence} from 'remotion';
import {macOSCursorNames, resolveCursor} from './resolve-cursor';

export type MacOSCursorProps = InteractiveBaseProps & {
	readonly cursor: string;
	readonly customCursor?: string;
	readonly className?: string;
	readonly style?: CSSProperties;
};

export const macOSCursorSchema = {
	cursor: {
		type: 'enum',
		default: 'default',
		description: 'Cursor',
		keyframable: true,
		variants: Object.assign(
			Object.fromEntries<InteractivitySchema>(
				macOSCursorNames.map((cursor) => [cursor, {}]),
			),
			{
				custom: {
					customCursor: {
						type: 'text-content',
						default: '',
						description: 'Custom cursor',
						keyframable: false,
					},
				},
			},
		),
	},
	...Interactive.transformSchema,
} as const satisfies InteractivitySchema;

const MacOSCursorInner: React.FC<
	MacOSCursorProps & {readonly controls: SequenceControls | undefined}
> = ({
	cursor,
	customCursor,
	className,
	style,
	durationInFrames,
	from,
	trimBefore,
	freeze,
	hidden,
	name,
	showInTimeline,
	controls,
}) => {
	const resolved =
		cursor === 'custom'
			? customCursor
				? resolveCursor(customCursor)
				: null
			: resolveCursor(cursor);
	const refForOutline = React.useRef<HTMLImageElement | null>(null);

	return (
		<Sequence
			layout="none"
			from={from ?? 0}
			trimBefore={trimBefore}
			durationInFrames={durationInFrames ?? Infinity}
			freeze={freeze}
			hidden={hidden}
			name={name ?? '<MacOSCursor>'}
			showInTimeline={showInTimeline ?? true}
			controls={controls}
			outlineRef={refForOutline}
		>
			{resolved ? (
				<Img
					ref={refForOutline}
					className={className}
					src={resolved.src}
					showInTimeline={false}
					style={{
						display: 'block',
						position: 'absolute',
						width: resolved.width ?? undefined,
						height: resolved.height ?? undefined,
						marginLeft: -resolved.hotspot.x,
						marginTop: -resolved.hotspot.y,
						transformOrigin: `${resolved.hotspot.x}px ${resolved.hotspot.y}px`,
						...style,
					}}
				/>
			) : null}
		</Sequence>
	);
};

export const MacOSCursor = Interactive.withSchema({
	Component: MacOSCursorInner,
	componentName: '<MacOSCursor>',
	componentIdentity: Interactive._internalMakeRemotionComponentIdentity({
		packageName: '@remotion/mac-cursors',
		componentName: 'MacOSCursor',
	}),
	schema: macOSCursorSchema,
	supportsEffects: false,
}) as React.FC<MacOSCursorProps>;

MacOSCursor.displayName = 'MacOSCursor';
