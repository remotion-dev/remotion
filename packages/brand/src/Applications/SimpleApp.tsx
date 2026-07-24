import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {ExtrudeDiv} from '../3DContext/Div3D';

const titleWords = [
	{
		key: 'summer',
		letters: [
			{key: 'summer-s', value: 'S'},
			{key: 'summer-u', value: 'U'},
			{key: 'summer-first-m', value: 'M'},
			{key: 'summer-second-m', value: 'M'},
			{key: 'summer-e', value: 'E'},
			{key: 'summer-r', value: 'R'},
		],
	},
	{
		key: 'collection',
		letters: [
			{key: 'collection-c', value: 'C'},
			{key: 'collection-o', value: 'O'},
			{key: 'collection-first-l', value: 'L'},
			{key: 'collection-second-l', value: 'L'},
			{key: 'collection-e', value: 'E'},
			{key: 'collection-c-2', value: 'C'},
			{key: 'collection-t', value: 'T'},
			{key: 'collection-i', value: 'I'},
			{key: 'collection-o-2', value: 'O'},
			{key: 'collection-n', value: 'N'},
		],
	},
] as const;
const wordLetterOffsets = [0, titleWords[0].letters.length] as const;

export function ApplicationSimpleApp({
	kineticTypeFrame,
}: {
	readonly kineticTypeFrame?: number;
}) {
	const frame = useCurrentFrame();
	const titleFrame = kineticTypeFrame ?? frame;

	return (
		<AbsoluteFill
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<ExtrudeDiv
				backFace={
					<div
						style={{
							backgroundColor: '#cfd6df',
							border: '4px solid #111111',
							borderRadius: 30,
							height: '100%',
							width: '100%',
						}}
					/>
				}
				cornerRadius={30}
				depth={46}
				height={590}
				name="Simple application"
				rotationX={-Math.PI / 24}
				rotationY={-Math.PI / 30}
				rotationZ={0.01}
				width={820}
				style={{
					translate: '-3.9px 60.7px',
				}}
			>
				<div
					style={{
						backgroundColor: '#ffffff',
						border: '4px solid #111111',
						borderRadius: 30,
						fontFamily: 'GT Planar, sans-serif',
						fontFeatureSettings: "'ss03'",
						height: '100%',
						overflow: 'hidden',
						width: '100%',
					}}
				>
					<div
						style={{
							alignItems: 'center',
							borderBottom: '2px solid #e5e7eb',
							display: 'flex',
							height: 72,
							justifyContent: 'space-between',
							padding: '0 26px',
						}}
					>
						<div style={{display: 'flex', gap: 9}}>
							<div
								style={{
									backgroundColor: '#ff5f57',
									borderRadius: '50%',
									height: 16,
									width: 16,
								}}
							/>
							<div
								style={{
									backgroundColor: '#febc2e',
									borderRadius: '50%',
									height: 16,
									width: 16,
								}}
							/>
							<div
								style={{
									backgroundColor: '#28c840',
									borderRadius: '50%',
									height: 16,
									width: 16,
								}}
							/>
						</div>
						<div style={{width: 66}} />
					</div>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							gap: 22,
							padding: 28,
						}}
					>
						<div
							style={{
								alignItems: 'center',
								backgroundColor: '#111827',
								borderRadius: 18,
								display: 'flex',
								height: 332,
								justifyContent: 'center',
								overflow: 'hidden',
							}}
						>
							<div
								style={{
									alignItems: 'center',
									color: '#ffffff',
									display: 'flex',
									fontSize: 64,
									fontWeight: 500,
									gap: 28,
									justifyContent: 'center',
									letterSpacing: 1,
									lineHeight: 1,
								}}
							>
								{titleWords.map((word, wordIndex) => (
									<div key={word.key} style={{display: 'flex'}}>
										{word.letters.map((letter, letterIndex) => {
											const globalLetterIndex =
												wordLetterOffsets[wordIndex] + letterIndex;

											return (
												<div key={letter.key} style={{overflow: 'hidden'}}>
													<span
														style={{
															display: 'inline-block',
															translate: interpolate(
																titleFrame,
																[
																	6 + globalLetterIndex * 2,
																	18 + globalLetterIndex * 2,
																],
																['0px 80px', '0px 0px'],
																{
																	easing: Easing.bezier(0.16, 1, 0.3, 1),
																	extrapolateLeft: 'clamp',
																	extrapolateRight: 'clamp',
																},
															),
														}}
													>
														{letter.value}
													</span>
												</div>
											);
										})}
									</div>
								))}
							</div>
						</div>
						<div
							style={{
								alignItems: 'center',
								backgroundColor: '#f8fafc',
								border: '2px solid #d9dee7',
								borderRadius: 12,
								color: '#15171a',
								display: 'flex',
								fontSize: 22,
								height: 58,
								padding: '0 18px',
							}}
						>
							Summer collection
						</div>
					</div>
				</div>
			</ExtrudeDiv>
		</AbsoluteFill>
	);
}
