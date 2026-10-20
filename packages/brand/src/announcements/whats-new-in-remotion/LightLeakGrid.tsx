import {LightLeak} from '@remotion/light-leaks';
import {AbsoluteFill, Interactive, Series} from 'remotion';

export const LightLeakGrid: React.FC = () => (
	<AbsoluteFill style={{backgroundColor: 'black'}}>
		<Interactive.Div
			name="Warm light leaks"
			style={{
				position: 'absolute',
				width: '50%',
				height: '50%',
				top: 0,
				left: 0,
			}}
		>
			<Series>
				<Series.Sequence name="Warm variation 1" durationInFrames={60}>
					<LightLeak seed={1} hueShift={0} />
				</Series.Sequence>
				<Series.Sequence name="Warm variation 2" durationInFrames={60}>
					<LightLeak seed={3} hueShift={0} />
				</Series.Sequence>
				<Series.Sequence name="Warm variation 3" durationInFrames={60}>
					<LightLeak seed={5} hueShift={0} />
				</Series.Sequence>
			</Series>
		</Interactive.Div>
		<Interactive.Div
			name="Blue light leaks"
			style={{
				position: 'absolute',
				width: '50%',
				height: '50%',
				top: 0,
				left: '50%',
			}}
		>
			<Series>
				<Series.Sequence name="Blue variation 1" durationInFrames={60}>
					<LightLeak seed={7} hueShift={200} />
				</Series.Sequence>
				<Series.Sequence name="Blue variation 2" durationInFrames={60}>
					<LightLeak seed={9} hueShift={200} />
				</Series.Sequence>
				<Series.Sequence name="Blue variation 3" durationInFrames={60}>
					<LightLeak seed={11} hueShift={200} />
				</Series.Sequence>
			</Series>
		</Interactive.Div>
		<Interactive.Div
			name="Green light leaks"
			style={{
				position: 'absolute',
				width: '50%',
				height: '50%',
				top: '50%',
				left: 0,
			}}
		>
			<Series>
				<Series.Sequence name="Green variation 1" durationInFrames={60}>
					<LightLeak seed={13} hueShift={120} />
				</Series.Sequence>
				<Series.Sequence name="Green variation 2" durationInFrames={60}>
					<LightLeak seed={15} hueShift={120} />
				</Series.Sequence>
				<Series.Sequence name="Green variation 3" durationInFrames={60}>
					<LightLeak seed={17} hueShift={120} />
				</Series.Sequence>
			</Series>
		</Interactive.Div>
		<Interactive.Div
			name="Purple light leaks"
			style={{
				position: 'absolute',
				width: '50%',
				height: '50%',
				top: '50%',
				left: '50%',
			}}
		>
			<Series>
				<Series.Sequence name="Purple variation 1" durationInFrames={60}>
					<LightLeak seed={21} hueShift={300} />
				</Series.Sequence>
				<Series.Sequence name="Purple variation 2" durationInFrames={60}>
					<LightLeak seed={23} hueShift={300} />
				</Series.Sequence>
				<Series.Sequence name="Purple variation 3" durationInFrames={60}>
					<LightLeak seed={25} hueShift={300} />
				</Series.Sequence>
			</Series>
		</Interactive.Div>
	</AbsoluteFill>
);
