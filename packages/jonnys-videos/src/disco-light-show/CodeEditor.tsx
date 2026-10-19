import {CanvasImage, Interactive, Solid} from 'remotion';
import {asset} from './assets';

const CodeEditorInner = () => (
	<>
		<Solid
			name="Editor background"
			color="#292c32"
			width={1188}
			height={1240}
			style={{position: 'absolute'}}
		/>
		<CanvasImage
			name="Code snippet"
			src={asset('Screenshot 2026-07-19 at 18.28.52.png')}
			cropTop={0.124}
			cropBottom={0.12}
			cropLeft={0.016}
			cropRight={0.016}
			style={{position: 'absolute', width: 1188, height: 1260}}
		/>
	</>
);

export const CodeEditor = Interactive.create({
	Component: CodeEditorInner,
	layout: 'absolute-fill',
});
