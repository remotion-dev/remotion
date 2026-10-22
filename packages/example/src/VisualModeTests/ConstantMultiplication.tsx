import {AbsoluteFill, Sequence} from 'remotion';

const fps = 30;

export const ConstantMultiplication = () => {
	return (
		<AbsoluteFill
			style={{
				alignItems: 'center',
				backgroundColor: '#08111f',
				color: '#e8eef8',
				fontFamily: 'sans-serif',
				justifyContent: 'center',
			}}
		>
			<Sequence
				name="Numeric constant: from={-8 * fps}"
				from={-8 * fps}
				layout="none"
			>
				<div
					style={{
						backgroundColor: '#12335b',
						border: '2px solid #4ea1ff',
						borderRadius: 24,
						padding: '36px 48px',
						textAlign: 'center',
					}}
				>
					<div style={{fontSize: 42, fontWeight: 700}}>
						Constant multiplication
					</div>
					<code style={{display: 'block', fontSize: 28, marginTop: 20}}>
						{'from={-8 * fps}'}
					</code>
				</div>
			</Sequence>
		</AbsoluteFill>
	);
};
