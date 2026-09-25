import type {CSSProperties} from 'react';
import React from 'react';
import type {
	InteractiveBaseProps,
	InteractivePremountProps,
	InteractivitySchema,
	SequenceControls,
} from 'remotion';
import {
	Freeze,
	Sequence,
	Interactive,
	Internals,
	useCurrentScale,
} from 'remotion';
import {macOSCursorNames, resolveCursor} from './resolve-cursor';

export type MacOSCursorProps = InteractiveBaseProps &
	InteractivePremountProps & {
		readonly cursor?: string;
		readonly customCursor?: string;
		readonly className?: string;
		readonly style?: CSSProperties;
	};

export const macOSCursorSchema: InteractivitySchema = {
	...Interactive.baseSchema,
	...Interactive.premountSchema,
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
	cursor = 'default',
	customCursor,
	className,
	style,
	durationInFrames,
	from,
	premountFor,
	postmountFor,
	styleWhilePremounted,
	styleWhilePostmounted,
	trimBefore,
	playbackRate,
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
	const width = resolved?.width ?? undefined;
	const height = resolved?.height ?? undefined;
	const currentScale = useCurrentScale({dontThrowIfOutsideOfRemotion: true});

	const {
		effectivePremountFor,
		effectivePostmountFor,
		freezeFrame,
		isPremountingOrPostmounting,
		premountingActive,
		postmountingActive,
		premountingStyle,
	} = Internals.usePremounting({
		from: from ?? 0,
		durationInFrames: durationInFrames ?? Infinity,
		premountFor: premountFor ?? null,
		postmountFor: postmountFor ?? null,
		style: style ?? null,
		styleWhilePremounted: styleWhilePremounted ?? null,
		styleWhilePostmounted: styleWhilePostmounted ?? null,
		hideWhilePremounted: 'opacity',
	});
	return (
		<Freeze frame={freezeFrame} active={isPremountingOrPostmounting}>
			<Sequence
				layout="none"
				from={from ?? 0}
				trimBefore={trimBefore}
				playbackRate={playbackRate}
				durationInFrames={durationInFrames ?? Infinity}
				freeze={freeze}
				hidden={hidden}
				name={name ?? '<MacOSCursor>'}
				showInTimeline={showInTimeline ?? true}
				controls={controls}
				_remotionInternalPremountDisplay={effectivePremountFor || null}
				_remotionInternalPostmountDisplay={effectivePostmountFor || null}
				_remotionInternalIsPremounting={premountingActive}
				_remotionInternalIsPostmounting={postmountingActive}
			>
				{resolved ? (
					<svg
						className={className}
						width={width}
						height={height}
						viewBox={width && height ? `0 0 ${width} ${height}` : undefined}
						xmlns="http://www.w3.org/2000/svg"
						style={{
							display: 'block',
							position: 'absolute',
							width,
							height,
							overflow: 'visible',
							marginLeft: -resolved.hotspot.x,
							marginTop: -resolved.hotspot.y,
							transformOrigin: `${resolved.hotspot.x}px ${resolved.hotspot.y}px`,
							...premountingStyle,
						}}
					>
						{/* Reload custom SVG images when the preview scale changes. */}
						<image
							key={cursor === 'custom' ? currentScale : undefined}
							href={resolved.src}
							width={width}
							height={height}
							preserveAspectRatio="xMinYMin meet"
						/>
					</svg>
				) : null}
			</Sequence>
		</Freeze>
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
