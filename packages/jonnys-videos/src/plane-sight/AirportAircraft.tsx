import {
	AbsoluteFill,
	Interactive,
	useVideoConfig,
	type InteractiveTransformProps,
} from 'remotion';
import {
	CloudCodePlane,
	OpenAirPlane,
	type AircraftAirframe,
} from './PixelAirlines';

type AirportAircraftProps = InteractiveTransformProps & {
	width: number | null;
	height: number | null;
	airline: 'Cloud Code' | 'OpenAir';
	airframe: AircraftAirframe;
	heading: number;
	labelPosition: 'above' | 'below' | 'left';
	status: string;
	priority: boolean;
	altitude: number;
};

const AirportAircraftContent = ({
	airline,
	airframe,
	heading,
	labelPosition,
	status,
	priority,
	altitude,
	width,
	height,
	style,
}: AirportAircraftProps) => {
	const {fps} = useVideoConfig();

	if (status === 'In flight') {
		return null;
	}

	return (
		<AbsoluteFill
			style={{width: width ?? '100%', height: height ?? '100%', ...style}}
		>
			<Interactive.Div
				name="Aircraft shadow"
				style={{
					position: 'absolute',
					left: airframe === 'widebody' ? 17 : 30,
					top: airframe === 'widebody' ? 85 : 98,
					width: airframe === 'widebody' ? 158 : 132,
					height: airframe === 'widebody' ? 158 : 132,
					rotate: `${heading}deg`,
					translate: `${altitude * 14}px ${altitude * 20}px`,
					opacity: altitude * 0.22,
					filter: 'brightness(0)',
					transformOrigin: '50% 50%',
				}}
			>
				{airline === 'Cloud Code' ? (
					<CloudCodePlane
						name="Cloud Code shadow"
						airframe={airframe}
						width={null}
						height={null}
						premountFor={fps}
					/>
				) : (
					<OpenAirPlane
						name="OpenAir shadow"
						airframe={airframe}
						width={null}
						height={null}
						premountFor={fps}
					/>
				)}
			</Interactive.Div>
			<Interactive.Div
				name="Aircraft heading"
				style={{
					position: 'absolute',
					left: airframe === 'widebody' ? 17 : 30,
					top: airframe === 'widebody' ? 85 : 98,
					width: airframe === 'widebody' ? 158 : 132,
					height: airframe === 'widebody' ? 158 : 132,
					rotate: `${heading}deg`,
					scale: 1 + altitude * 0.12,
					translate: `0px ${altitude * -12}px`,
					transformOrigin: '50% 50%',
				}}
			>
				{airline === 'Cloud Code' ? (
					<CloudCodePlane
						name="Cloud Code aircraft"
						airframe={airframe}
						width={null}
						height={null}
						premountFor={fps}
					/>
				) : (
					<OpenAirPlane
						name="OpenAir aircraft"
						airframe={airframe}
						width={null}
						height={null}
						premountFor={fps}
					/>
				)}
			</Interactive.Div>
			<Interactive.Div
				name="Flight tooltip"
				style={{
					position: 'absolute',
					left: labelPosition === 'left' ? -180 : 0,
					top:
						labelPosition === 'above'
							? 0
							: labelPosition === 'left'
								? 123
								: 246,
					width: 192,
					height: 82,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'flex-start',
					justifyContent: 'flex-start',
					padding: '8px 10px',
					gap: 5,
					textAlign: 'left',
					boxSizing: 'border-box',
					border: '2px solid',
					borderColor: priority ? '#9a692c' : '#324e41',
					borderLeftWidth: 5,
					backgroundColor: priority ? '#fff0c9' : '#f7f5e9',
					color: airline === 'Cloud Code' ? '#a3410e' : '#105734',
					fontFamily: "'Courier New', monospace",
					fontWeight: 700,
					fontSize: 18,
					lineHeight: 1,
					letterSpacing: -0.4,
					whiteSpace: 'nowrap',
					boxShadow: '3px 3px 0 #334d4133',
				}}
			>
				<div>{airline}</div>
				<div
					style={{
						fontSize: 16,
						fontWeight: 400,
						lineHeight: 1.15,
						whiteSpace: 'normal',
						color: priority ? '#86591c' : '#526557',
						letterSpacing: -0.2,
					}}
				>
					{status}
				</div>
			</Interactive.Div>
		</AbsoluteFill>
	);
};

export const AirportAircraft = Interactive.create({
	Component: AirportAircraftContent,
	componentName: 'AirportAircraft',
	schema: {
		airline: {
			type: 'enum',
			default: 'Cloud Code',
			description: 'Airline',
			variants: {'Cloud Code': {}, OpenAir: {}},
		},
		airframe: {
			type: 'enum',
			default: 'narrowbody',
			description: 'Aircraft type',
			variants: {narrowbody: {}, widebody: {}},
		},
		heading: {
			type: 'number',
			default: 90,
			description: 'Aircraft heading in degrees',
			hiddenFromList: false,
		},
		labelPosition: {
			type: 'enum',
			default: 'above',
			description: 'Name tag position',
			variants: {above: {}, below: {}, left: {}},
		},
		status: {
			type: 'text-content',
			default: 'Build failed · urgent',
			description: 'Task status',
		},
		priority: {
			type: 'boolean',
			default: false,
			description: 'Highlight the next task',
		},
		altitude: {
			type: 'number',
			default: 0,
			min: 0,
			max: 1,
			description: 'Flight height',
			hiddenFromList: false,
		},
	},
});
