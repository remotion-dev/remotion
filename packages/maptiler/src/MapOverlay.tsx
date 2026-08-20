import {
	forwardRef,
	useContext,
	useImperativeHandle,
	useRef,
	type ForwardRefRenderFunction,
	type ReactNode,
} from 'react';
import {
	Interactive,
	Sequence,
	type InteractiveBaseProps,
	type InteractiveTransformProps,
	type InteractivitySchema,
	type SequenceControls,
} from 'remotion';
import {MapTilerContext} from './MapTilerContext';

export type MapOverlayAnchor =
	| 'bottom'
	| 'bottom-left'
	| 'bottom-right'
	| 'center'
	| 'left'
	| 'right'
	| 'top'
	| 'top-left'
	| 'top-right';

export type MapOverlayProps = InteractiveBaseProps &
	InteractiveTransformProps & {
		readonly anchor?: MapOverlayAnchor;
		readonly children?: ReactNode;
		readonly controls?: SequenceControls;
		readonly latitude: number;
		readonly longitude: number;
		readonly offsetX?: number;
		readonly offsetY?: number;
		readonly opacity?: number;
		readonly rotation?: number;
		readonly rotationAlignment?: 'map' | 'viewport';
	};

const mapOverlaySchema = {
	...Interactive.baseSchema,
	longitude: {
		type: 'number',
		min: -180,
		max: 180,
		step: 0.0001,
		default: 0,
		description: 'Longitude',
		hiddenFromList: false,
	},
	latitude: {
		type: 'number',
		min: -90,
		max: 90,
		step: 0.0001,
		default: 0,
		description: 'Latitude',
		hiddenFromList: false,
	},
	offsetX: {
		type: 'number',
		min: -2000,
		max: 2000,
		step: 1,
		default: 0,
		description: 'Horizontal marker offset',
		hiddenFromList: false,
		keyframable: true,
	},
	offsetY: {
		type: 'number',
		min: -2000,
		max: 2000,
		step: 1,
		default: 0,
		description: 'Vertical marker offset',
		hiddenFromList: false,
		keyframable: true,
	},
	opacity: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: 1,
		description: 'Marker opacity',
		hiddenFromList: false,
		keyframable: true,
	},
	rotation: {
		type: 'number',
		min: -360,
		max: 360,
		step: 1,
		default: 0,
		description: 'Marker rotation',
		hiddenFromList: false,
		keyframable: true,
	},
	...Interactive.transformSchema,
} as const satisfies InteractivitySchema;

const MapOverlayRefForwardingFunction: ForwardRefRenderFunction<
	HTMLDivElement,
	MapOverlayProps
> = (
	{
		anchor = 'center',
		children,
		latitude,
		longitude,
		offsetX = 0,
		offsetY = 0,
		opacity = 1,
		rotation = 0,
		rotationAlignment = 'viewport',
		style,
		durationInFrames,
		from,
		trimBefore,
		freeze,
		hidden,
		name,
		showInTimeline,
		controls,
	},
	ref,
) => {
	const {map} = useContext(MapTilerContext);
	const refForOutline = useRef<HTMLDivElement>(null);
	const point = map?.project([longitude, latitude]);
	const horizontalAnchor = anchor.includes('left')
		? 0
		: anchor.includes('right')
			? -100
			: -50;
	const verticalAnchor = anchor.includes('top')
		? 0
		: anchor.includes('bottom')
			? -100
			: -50;

	useImperativeHandle(ref, () => refForOutline.current as HTMLDivElement, []);

	return (
		<Sequence
			layout="none"
			from={from ?? 0}
			trimBefore={trimBefore}
			durationInFrames={durationInFrames ?? Infinity}
			freeze={freeze}
			hidden={hidden}
			name={name ?? '<MapOverlay>'}
			showInTimeline={showInTimeline ?? true}
			controls={controls}
			outlineRef={refForOutline}
		>
			<div
				ref={refForOutline}
				style={{
					left: (point?.x ?? 0) + offsetX,
					opacity,
					pointerEvents: 'none',
					position: 'absolute',
					rotate: `${rotation + (rotationAlignment === 'map' ? (map?.getBearing() ?? 0) : 0)}deg`,
					top: (point?.y ?? 0) + offsetY,
					translate: `${horizontalAnchor}% ${verticalAnchor}%`,
					zIndex: 1,
					...style,
				}}
			>
				{children}
			</div>
		</Sequence>
	);
};

const MapOverlayInner = forwardRef(MapOverlayRefForwardingFunction);

export const MapOverlay = Interactive.withSchema({
	Component: MapOverlayInner,
	componentName: '<MapOverlay>',
	componentIdentity: null,
	schema: mapOverlaySchema,
	supportsEffects: false,
});

export const MapMarker = MapOverlay;
