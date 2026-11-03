import {Interactive} from 'remotion';

type BeatPlaceholderProps = {
	readonly title: string;
	readonly cue: string;
};

const BeatPlaceholderContent = ({title, cue}: BeatPlaceholderProps) => {
	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 48,
				padding: 160,
				backgroundColor: '#0b0e14',
				color: 'white',
				fontFamily: 'Arial, sans-serif',
				textAlign: 'center',
			}}
		>
			<div style={{fontSize: 160, fontWeight: 700, lineHeight: 1.1}}>
				{title}
			</div>
			<div style={{fontSize: 64, lineHeight: 1.3, color: '#a7b0bd'}}>{cue}</div>
		</div>
	);
};

export const BeatPlaceholder = Interactive.create({
	Component: BeatPlaceholderContent,
	layout: 'absolute-fill',
	schema: {
		title: {type: 'string', default: '', description: 'Beat description'},
		cue: {type: 'string', default: '', description: 'Editing cue'},
	},
});
