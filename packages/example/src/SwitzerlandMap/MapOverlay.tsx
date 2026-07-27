import {
	forwardRef,
	useContext,
	useImperativeHandle,
	useRef,
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

type MapOverlayProps = InteractiveBaseProps &
	InteractiveTransformProps & {
		readonly children?: ReactNode;
		readonly controls?: SequenceControls;
		readonly latitude: number;
		readonly longitude: number;
		readonly stack?: string;
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
	...Interactive.transformSchema,
} as const satisfies InteractivitySchema;

const MapOverlayInner = forwardRef<
	HTMLDivElement,
	MapOverlayProps & {
		readonly stack?: undefined;
	}
>(
	(
		{
			children,
			latitude,
			longitude,
			style,
			durationInFrames,
			from,
			trimBefore,
			freeze,
			hidden,
			name,
			showInTimeline,
			controls,
			stack,
		},
		ref,
	) => {
		const {map} = useContext(MapTilerContext);
		const refForOutline = useRef<HTMLDivElement>(null);
		const point = map?.project([longitude, latitude]);

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
				_remotionInternalStack={stack}
			>
				<div
					ref={refForOutline}
					style={{
						left: point?.x ?? 0,
						pointerEvents: 'none',
						position: 'absolute',
						top: point?.y ?? 0,
						zIndex: 1,
						...style,
					}}
				>
					{children}
				</div>
			</Sequence>
		);
	},
);

export const MapOverlay = Interactive.withSchema({
	Component: MapOverlayInner,
	componentName: '<MapOverlay>',
	componentIdentity: null,
	schema: mapOverlaySchema,
	supportsEffects: false,
});
