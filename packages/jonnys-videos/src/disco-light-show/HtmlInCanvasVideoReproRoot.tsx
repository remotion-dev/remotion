import {Composition, registerRoot} from 'remotion';
import {HtmlInCanvasVideoRepro} from './HtmlInCanvasVideoRepro';

const HtmlInCanvasVideoReproRoot: React.FC = () => {
	return (
		<Composition
			id="HtmlInCanvasVideoRepro"
			component={HtmlInCanvasVideoRepro}
			durationInFrames={150}
			fps={30}
			width={1280}
			height={720}
		/>
	);
};

registerRoot(HtmlInCanvasVideoReproRoot);
