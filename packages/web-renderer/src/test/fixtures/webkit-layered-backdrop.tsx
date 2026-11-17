export const webkitLayeredBackdrop = (translucent: boolean) => ({
	id: `webkit-layered-backdrop-${translucent ? 'translucent' : 'opaque'}`,
	width: 352,
	height: 120,
	fps: 30,
	durationInFrames: 1,
	component: () => (
		<div
			style={{
				position: 'relative',
				width: 352,
				height: 120,
				background: translucent ? '#cbd2fc66' : '#cbd2fc',
			}}
		>
			<div
				style={{
					position: 'absolute',
					top: 22,
					left: 8,
					right: 12,
					height: 40,
					background: '#32bb574d',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					top: 5,
					left: 254,
					width: 70,
					height: 96,
					background: '#de299a77',
				}}
			/>
		</div>
	),
});
