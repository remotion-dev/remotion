import {Video} from '@remotion/media';
import {
	AbsoluteFill,
	Easing,
	Interactive,
	Sequence,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {assetUrl} from './assets';
import {NumberedChapter} from './NumberedChapter';
import {WebRendererDemo} from './WebRendererDemo';

const CssPropertyList: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'white',
				flexDirection: 'column',
				display: 'flex',
				padding: '0 40px',
			}}
		>
			<Interactive.Div
				name="New CSS properties heading"
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					fontFamily: 'GT Planar',
					fontSize: 32,
					fontWeight: 700,
					color: '#111',
					borderBottom: '1px solid #e0e0e0',
					height: 80,
					flexShrink: 0,
				}}
			>
				New CSS Properties
			</Interactive.Div>
			<Interactive.Div
				name="border-style"
				style={{
					flex: 1,
					display: 'flex',
					alignItems: 'center',
					fontFamily: 'GT Planar',
					fontSize: 28,
					fontWeight: 500,
					color: '#333',
					borderBottom: '1px solid #e0e0e0',
					paddingLeft: 24,
				}}
			>
				border-style
			</Interactive.Div>
			<Interactive.Div
				name="border-width"
				style={{
					flex: 1,
					display: 'flex',
					alignItems: 'center',
					fontFamily: 'GT Planar',
					fontSize: 28,
					fontWeight: 500,
					color: '#333',
					borderBottom: '1px solid #e0e0e0',
					paddingLeft: 24,
				}}
			>
				border-width
			</Interactive.Div>
			<Interactive.Div
				name="border-color"
				style={{
					flex: 1,
					display: 'flex',
					alignItems: 'center',
					fontFamily: 'GT Planar',
					fontSize: 28,
					fontWeight: 500,
					color: '#333',
					borderBottom: '1px solid #e0e0e0',
					paddingLeft: 24,
				}}
			>
				border-color
			</Interactive.Div>
			<Interactive.Div
				name="box-shadow"
				style={{
					flex: 1,
					display: 'flex',
					alignItems: 'center',
					fontFamily: 'GT Planar',
					fontSize: 28,
					fontWeight: 500,
					color: '#333',
					borderBottom: '1px solid #e0e0e0',
					paddingLeft: 24,
				}}
			>
				box-shadow
			</Interactive.Div>
			<Interactive.Div
				name="text-shadow"
				style={{
					flex: 1,
					display: 'flex',
					alignItems: 'center',
					fontFamily: 'GT Planar',
					fontSize: 28,
					fontWeight: 500,
					color: '#333',
					borderBottom: '1px solid #e0e0e0',
					paddingLeft: 24,
				}}
			>
				text-shadow
			</Interactive.Div>
			<Interactive.Div
				name="font-style"
				style={{
					flex: 1,
					display: 'flex',
					alignItems: 'center',
					fontFamily: 'GT Planar',
					fontSize: 28,
					fontWeight: 500,
					color: '#333',
					borderBottom: '1px solid #e0e0e0',
					paddingLeft: 24,
				}}
			>
				font-style
			</Interactive.Div>
			<Interactive.Div
				name="object-fit"
				style={{
					flex: 1,
					display: 'flex',
					alignItems: 'center',
					fontFamily: 'GT Planar',
					fontSize: 28,
					fontWeight: 500,
					color: '#333',
					borderBottom: '1px solid #e0e0e0',
					paddingLeft: 24,
				}}
			>
				object-fit
			</Interactive.Div>
			<Interactive.Div
				name="filter"
				style={{
					flex: 1,
					display: 'flex',
					alignItems: 'center',
					fontFamily: 'GT Planar',
					fontSize: 28,
					fontWeight: 500,
					color: '#333',
					borderBottom: '1px solid #e0e0e0',
					paddingLeft: 24,
				}}
			>
				filter
			</Interactive.Div>
			<Interactive.Div
				name="paint-order"
				style={{
					flex: 1,
					display: 'flex',
					alignItems: 'center',
					fontFamily: 'GT Planar',
					fontSize: 28,
					fontWeight: 500,
					color: '#333',
					borderBottom: '1px solid #e0e0e0',
					paddingLeft: 24,
				}}
			>
				paint-order
			</Interactive.Div>
			<Interactive.Div
				name="-webkit-text-stroke"
				style={{
					flex: 1,
					display: 'flex',
					alignItems: 'center',
					fontFamily: 'GT Planar',
					fontSize: 28,
					fontWeight: 500,
					color: '#333',
					borderBottom: 'none',
					paddingLeft: 24,
				}}
			>
				-webkit-text-stroke
			</Interactive.Div>
		</AbsoluteFill>
	);
};

export const Scene6: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill>
			<Interactive.Div
				name="Presenter position"
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					width: '100%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					translate: interpolate(
						frame,
						[15, 45, 120, 150, 759.6, 789.6, 894.6, 924.6],
						[
							'0% 0px',
							'-20% 0px',
							'-20% 0px',
							'0% 0px',
							'0% 0px',
							'-20% 0px',
							'-20% 0px',
							'0% 0px',
						],
						{
							easing: [
								Easing.out(Easing.cubic),
								Easing.linear,
								Easing.in(Easing.cubic),
								Easing.linear,
								Easing.out(Easing.cubic),
								Easing.linear,
								Easing.in(Easing.cubic),
							],
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
				}}
			>
				<Video
					name="Presenter video"
					src={assetUrl('whats6.mov')}
					trimBefore={69}
					trimAfter={950}
				/>
			</Interactive.Div>
			<Interactive.Div
				name="Chapter panel"
				style={{
					position: 'absolute',
					top: 0,
					bottom: 0,
					left: '60%',
					width: '40%',
					display: 'flex',
					flexDirection: 'column',
					overflow: 'hidden',
					backgroundColor: 'white',
					translate: interpolate(
						frame,
						[15, 45, 120, 150],
						['102% 0px', '0% 0px', '0% 0px', '102% 0px'],
						{
							easing: [
								Easing.out(Easing.cubic),
								Easing.linear,
								Easing.in(Easing.cubic),
							],
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
				}}
			>
				<NumberedChapter chapterNumber={5} chapterTitle="Web Renderer Update" />
			</Interactive.Div>
			<Sequence
				name="Web renderer demo"
				from={180}
				durationInFrames={450}
				premountFor={30}
			>
				<WebRendererDemo />
			</Sequence>
			<Sequence name="Web renderer note" from={190} layout="none">
				<AbsoluteFill
					style={{
						padding: 70,
						justifyContent: 'flex-start',
						alignItems: 'flex-start',
					}}
				>
					<Interactive.Div
						name="Client-side rendering reference"
						style={{
							backgroundColor: 'white',
							fontFamily: 'GT Planar',
							padding: '24px 44px',
							fontSize: 30,
							top: 70,
							borderRadius: 18,
							boxShadow: '0 0 30px rgba(0, 0, 0, 0.1)',
							fontWeight: 'bold',
							maxWidth: 800,
							translate: interpolate(
								frame,
								[190, 213, 325, 348],
								['0px -400px', '0px 0px', '0px 0px', '0px -400px'],
								{
									easing: [
										Easing.spring({damping: 200}),
										Easing.linear,
										Easing.spring({damping: 200}),
									],
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								},
							),
							rotate: interpolate(
								frame,
								[190, 213, 325, 348],
								['9deg', '0deg', '0deg', '9deg'],
								{
									easing: [
										Easing.spring({damping: 200}),
										Easing.linear,
										Easing.spring({damping: 200}),
									],
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								},
							),
						}}
					>
						Fun fact: This video was edited with Claude Code and rendered
						completely client-side!
					</Interactive.Div>
				</AbsoluteFill>
			</Sequence>
			<Sequence name="Supported CSS properties" from={760} layout="none">
				<Interactive.Div
					name="Details panel"
					style={{
						position: 'absolute',
						top: 0,
						bottom: 0,
						left: '60%',
						width: '40%',
						display: 'flex',
						flexDirection: 'column',
						overflow: 'hidden',
						backgroundColor: 'white',
						translate: interpolate(
							frame,
							[760, 790, 895, 925],
							['102% 0px', '0% 0px', '0% 0px', '102% 0px'],
							{
								easing: [
									Easing.out(Easing.cubic),
									Easing.linear,
									Easing.in(Easing.cubic),
								],
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							},
						),
					}}
				>
					<CssPropertyList />
				</Interactive.Div>
			</Sequence>
		</AbsoluteFill>
	);
};
