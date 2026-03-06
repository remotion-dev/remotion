import {evolvePath, reversePath} from '@remotion/paths';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {extendViewbox} from './extend-viewbox';

const d = reversePath(
	'M211.39 188.036C202.512 188.518 195.358 189.927 188.148 192.67C184.552 194.023 178.658 196.97 175.415 199.009C161.847 207.516 151.505 220.305 146.112 235.189C145.037 238.136 142.127 247.533 140.255 254.001C127.781 297.243 120.701 344.524 119.181 394.568C118.94 402.538 118.94 421.517 119.181 429.357C120.2 462.534 123.37 492.486 129.115 523.031C131.451 535.394 135.195 552.001 137.363 559.545C141.793 574.873 150.838 587.921 163.701 597.485C172.319 603.898 182.106 608.198 192.949 610.311C198.175 611.33 205.07 611.794 210.149 611.46C217.173 610.997 231.111 609.125 242.436 607.104C293.48 598.004 340.632 581.712 383.392 558.395C410.471 543.623 433.621 527.628 455.955 508.222C478.215 488.909 497.194 468.132 513.894 444.815C517.768 439.422 519.714 436.271 521.66 432.304C526.665 422.073 529.018 411.898 529 400.518C529 389.916 526.998 380.5 522.68 370.862C520.604 366.21 518.62 362.874 514.172 356.535C497.788 333.2 479.605 312.867 457.438 293.109C423.074 262.49 382.261 237.376 336.685 218.785C326.806 214.763 317.075 211.223 305.361 207.387C280.562 199.287 249.868 192.262 223.901 188.759C219.824 188.203 214.282 187.888 211.39 188.036Z'
);

export const Arcs: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const progress = spring({
		frame,
		fps,
		config: {
			damping: 200,
		},
		durationInFrames: 80,
	});
	const viewBox = extendViewbox('118.94 187.888 410.078 423.906', 1.25);
	const {strokeDasharray, strokeDashoffset} = evolvePath(progress, d);

	const totalScale = spring({
		fps,
		frame: frame - 40,
		config: {
			damping: 200,
		},
		durationInFrames: 30,
	});

	return (
		<svg
			style={{
				transform: `scale(${
					interpolate(totalScale, [0, 1], [1.15, 2.8]) +
					interpolate(frame, [0, 250], [0, 1])
				})`,
				width: '100%',
				left: '18%',
				top: '28%',
				position: 'absolute',
			}}
			viewBox={viewBox}
		>
			<path
				strokeDasharray={strokeDasharray}
				strokeDashoffset={strokeDashoffset}
				d={d}
				stroke="#0B84F3"
				fill="none"
				strokeWidth={35}
				style={{
					transformBox: 'fill-box',
					transformOrigin: 'center center',
					transform: 'rotate(120deg)',
				}}
				strokeLinecap="round"
			/>
		</svg>
	);
};
