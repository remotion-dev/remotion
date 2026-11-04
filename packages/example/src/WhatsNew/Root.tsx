import {Composition, Folder, Still} from 'remotion';

export const WhatsNewRoot: React.FC = () => {
	return (
		<>
			<Composition
				defaultProps={{
					style: {
						overflow: 'visible',
						flexDirection: 'column',
						backgroundColor: '#000',
					},
				}}
				id="WhatsNew"
				lazyComponent={async () => {
					const {WhatsNew} = await import('./WhatsNew');
					return {default: WhatsNew};
				}}
				durationInFrames={7328}
				fps={30}
				width={1920}
				height={1080}
			/>
			<Still
				defaultProps={{
					style: {
						overflow: 'hidden',
						flexDirection: 'column',
						backgroundColor: '#06080E',
					},
				}}
				id="WhatsNew-Thumbnail"
				lazyComponent={async () => {
					const {Thumbnail} = await import('./Thumbnail');
					return {default: Thumbnail};
				}}
				width={1280}
				height={720}
			/>
			<Folder name="WhatsNew-Scenes">
				<Composition
					defaultProps={{style: {overflow: 'visible', flexDirection: 'column'}}}
					id="WhatsNew-Intro"
					lazyComponent={async () => {
						const {IntroScene} = await import('./scenes/Intro');
						return {default: IntroScene};
					}}
					durationInFrames={208}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					defaultProps={{style: {overflow: 'visible', flexDirection: 'column'}}}
					id="WhatsNew-LightLeaks"
					lazyComponent={async () => {
						const {LightLeaksScene} = await import('./scenes/LightLeaks');
						return {default: LightLeaksScene};
					}}
					durationInFrames={720}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					defaultProps={{style: {overflow: 'visible', flexDirection: 'column'}}}
					id="WhatsNew-SoundEffects"
					lazyComponent={async () => {
						const {SoundEffectsScene} = await import('./scenes/SoundEffects');
						return {default: SoundEffectsScene};
					}}
					durationInFrames={1152}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					defaultProps={{style: {overflow: 'visible', flexDirection: 'column'}}}
					id="WhatsNew-Vercel"
					lazyComponent={async () => {
						const {VercelScene} = await import('./scenes/Vercel');
						return {default: VercelScene};
					}}
					durationInFrames={1040}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					defaultProps={{style: {overflow: 'visible', flexDirection: 'column'}}}
					id="WhatsNew-Skills"
					lazyComponent={async () => {
						const {SkillsScene} = await import('./scenes/Skills');
						return {default: SkillsScene};
					}}
					durationInFrames={608}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					defaultProps={{style: {overflow: 'visible', flexDirection: 'column'}}}
					id="WhatsNew-ClientSide"
					lazyComponent={async () => {
						const {ClientSideScene} = await import('./scenes/ClientSide');
						return {default: ClientSideScene};
					}}
					durationInFrames={832}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					defaultProps={{style: {overflow: 'visible', flexDirection: 'column'}}}
					id="WhatsNew-Agents"
					lazyComponent={async () => {
						const {AgentsScene} = await import('./scenes/Agents');
						return {default: AgentsScene};
					}}
					durationInFrames={976}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					defaultProps={{style: {overflow: 'visible', flexDirection: 'column'}}}
					id="WhatsNew-Bundling"
					lazyComponent={async () => {
						const {BundlingScene} = await import('./scenes/Bundling');
						return {default: BundlingScene};
					}}
					durationInFrames={720}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					defaultProps={{style: {overflow: 'visible', flexDirection: 'column'}}}
					id="WhatsNew-SneakPeek"
					lazyComponent={async () => {
						const {SneakPeekScene} = await import('./scenes/SneakPeek');
						return {default: SneakPeekScene};
					}}
					durationInFrames={912}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					defaultProps={{
						style: {
							overflow: 'visible',
							flexDirection: 'column',
							backgroundColor: '#000',
						},
					}}
					id="WhatsNew-Outro"
					lazyComponent={async () => {
						const {OutroScene} = await import('./scenes/Outro');
						return {default: OutroScene};
					}}
					durationInFrames={160}
					fps={30}
					width={1920}
					height={1080}
				/>
			</Folder>
		</>
	);
};
