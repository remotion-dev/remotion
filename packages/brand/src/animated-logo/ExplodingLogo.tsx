import React from 'react';
import {
	AbsoluteFill,
	Freeze,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {E} from './e';
import {FirstO} from './first-o';
import {I} from './i';
import {M} from './m';
import {N} from './n';
import {R} from './r';
import {SecondO} from './second-o';
import {T} from './t';

export const ExplodingLogo: React.FC<{
	theme: 'light' | 'dark';
}> = ({theme}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const implode = spring({
		fps,
		frame,
		config: {
			mass: 1,
			damping: 200,
		},
		durationInFrames: 12,
	});

	const spr = spring({
		fps,
		frame: frame - 3,
		config: {
			mass: 1.7,
		},
		durationInFrames: 20,
	});

	const align = spring({
		fps,
		frame: frame - 10,
		config: {
			mass: 1.1,
			damping: 15,
		},
		durationInFrames: 20,
	});

	const oInnerScale = spring({
		fps,
		frame: frame - 7,
		config: {
			mass: 1,
			damping: 200,
		},
		durationInFrames: 5,
	});

	const rStyle: React.CSSProperties = {
		translate: interpolate(spr, [0, 1], [400, 0]) + 'px',
	};

	const eStyle: React.CSSProperties = {
		translate: interpolate(spr, [0, 1], [300, 0]) + 'px',
	};

	const mStyle: React.CSSProperties = {
		translate: interpolate(spr, [0, 1], [200, 0]) + 'px',
	};

	const firstOStyle: React.CSSProperties = {
		translate: interpolate(spr, [0, 1], [100, 0]) + 'px',
	};

	const tStyle: React.CSSProperties = {
		translate: interpolate(spr, [0, 1], [-100, 0]) + 'px',
	};

	const iStyle: React.CSSProperties = {
		translate: interpolate(spr, [0, 1], [-200, 0]) + 'px',
	};

	const secondOStyle: React.CSSProperties = {
		translate: interpolate(spr, [0, 1], [-300, 0]) + 'px',
	};

	const nStyle: React.CSSProperties = {
		translate: interpolate(spr, [0, 1], [-400, 0]) + 'px',
	};

	const xAlign = interpolate(align, [0, 1], [-240, 0]);

	return (
		<Freeze frame={120}>
			<AbsoluteFill
				style={{
					justifyContent: 'center',
					alignItems: 'center',
					backgroundColor: theme === 'dark' ? '#22272e' : 'white',
					color: theme === 'dark' ? 'white' : 'black',
				}}
			>
				<svg
					width="2100"
					height="800"
					style={{
						width: '100%',
					}}
					viewBox="0 0 2100 800"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<g
						style={{
							transform: `translateX(${xAlign}px)`,
						}}
					>
						<R style={rStyle} />
						<E style={eStyle} />
						<M style={mStyle} />
						<FirstO
							innerScale={oInnerScale}
							fill={frame >= 8}
							style={firstOStyle}
						/>
						<T style={tStyle} />
						<I style={iStyle} />
						<SecondO style={secondOStyle} />
						<N style={nStyle} />
					</g>
					<g
						style={{
							transform: `translateX(${interpolate(
								align,
								[0, 1],
								[-600, 0]
							)}px)`,
						}}
					>
						<path
							d="M235.44 233.13C228.453 233.509 222.824 234.617 217.15 236.776C214.321 237.841 209.683 240.16 207.13 241.764C196.454 248.459 188.316 258.522 184.071 270.234C183.225 272.553 180.936 279.948 179.463 285.038C169.647 319.064 164.075 356.27 162.88 395.65C162.69 401.921 162.69 416.856 162.88 423.026C163.682 449.133 166.176 472.702 170.697 496.738C172.535 506.466 175.481 519.534 177.187 525.47C180.673 537.532 187.791 547.8 197.913 555.326C204.695 560.372 212.395 563.756 220.928 565.418C225.041 566.221 230.466 566.585 234.462 566.323C239.99 565.958 250.958 564.485 259.869 562.895C300.036 555.734 337.14 542.914 370.788 524.566C392.096 512.942 410.313 500.355 427.888 485.085C445.404 469.887 460.339 453.537 473.48 435.19C476.529 430.945 478.06 428.466 479.591 425.345C483.529 417.294 485.382 409.287 485.367 400.332C485.367 391.989 483.792 384.58 480.394 376.996C478.76 373.335 477.199 370.71 473.699 365.722C460.806 347.359 446.498 331.359 429.055 315.812C402.014 291.718 369.898 271.955 334.034 257.326C326.26 254.161 318.603 251.376 309.385 248.357C289.871 241.983 265.718 236.455 245.284 233.699C242.076 233.261 237.715 233.013 235.44 233.13Z"
							fill={theme === 'dark' ? 'white' : '#0B84F3'}
							fillOpacity="0.3"
							style={{
								transformBox: 'fill-box',
								transformOrigin: 'center center',
							}}
						/>
						<path
							d="M211.39 188.036C202.512 188.518 195.358 189.927 188.148 192.67C184.552 194.023 178.658 196.97 175.415 199.009C161.847 207.516 151.505 220.305 146.112 235.189C145.037 238.136 142.127 247.533 140.255 254.001C127.781 297.243 120.701 344.524 119.181 394.568C118.94 402.538 118.94 421.517 119.181 429.357C120.2 462.534 123.37 492.486 129.115 523.031C131.451 535.394 135.195 552.001 137.363 559.545C141.793 574.873 150.838 587.921 163.701 597.485C172.319 603.898 182.106 608.198 192.949 610.311C198.175 611.33 205.07 611.794 210.149 611.46C217.173 610.997 231.111 609.125 242.436 607.104C293.48 598.004 340.632 581.712 383.392 558.395C410.471 543.623 433.621 527.628 455.955 508.222C478.215 488.909 497.194 468.132 513.894 444.815C517.768 439.422 519.714 436.271 521.66 432.304C526.665 422.073 529.018 411.898 529 400.518C529 389.916 526.998 380.5 522.68 370.862C520.604 366.21 518.62 362.874 514.172 356.535C497.788 333.2 479.605 312.867 457.438 293.109C423.074 262.49 382.261 237.376 336.685 218.785C326.806 214.763 317.075 211.223 305.361 207.387C280.562 199.287 249.868 192.262 223.901 188.759C219.824 188.203 214.282 187.888 211.39 188.036Z"
							fill={theme === 'dark' ? 'white' : '#0B84F3'}
							fillOpacity="0.15"
							style={{
								transformBox: 'fill-box',
								transformOrigin: 'center center',
							}}
						/>
						<path
							d="M260.331 279.901C255.307 280.174 251.259 280.971 247.179 282.523C245.144 283.289 241.809 284.956 239.973 286.11C232.295 290.924 226.443 298.162 223.391 306.584C222.782 308.252 221.136 313.569 220.076 317.23C213.017 341.7 209.011 368.456 208.151 396.776C208.014 401.286 208.014 412.026 208.151 416.463C208.727 435.237 210.521 452.187 213.773 469.472C215.094 476.468 217.213 485.866 218.44 490.135C220.947 498.809 226.065 506.193 233.344 511.605C238.221 515.234 243.759 517.667 249.895 518.863C252.853 519.44 256.755 519.702 259.629 519.513C263.604 519.251 271.491 518.192 277.9 517.049C306.786 511.899 333.469 502.679 357.666 489.484C372.99 481.125 386.09 472.073 398.729 461.092C411.326 450.163 422.066 438.405 431.516 425.21C433.708 422.158 434.81 420.375 435.911 418.13C438.743 412.341 440.075 406.582 440.064 400.142C440.064 394.143 438.932 388.815 436.488 383.361C435.313 380.728 434.191 378.84 431.673 375.253C422.402 362.048 412.112 350.542 399.568 339.361C380.122 322.034 357.026 307.822 331.235 297.302C325.644 295.026 320.138 293.022 313.509 290.851C299.475 286.268 282.106 282.292 267.411 280.31C265.104 279.995 261.968 279.817 260.331 279.901Z"
							fill={theme === 'dark' ? 'white' : '#0B84F3'}
							style={{
								transformBox: 'fill-box',
								transformOrigin: 'center center',
							}}
						/>
					</g>
				</svg>
			</AbsoluteFill>
			<AbsoluteFill
				style={{
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<div
					style={{
						height: 500,
						width: 500,
						backgroundColor: 'black',
						borderRadius: 250,
						marginLeft: -50,
						marginTop: 40,
						scale: String(7 - implode * 7),
						opacity: frame < 8 ? 1 : 0,
					}}
				/>
			</AbsoluteFill>
		</Freeze>
	);
};
