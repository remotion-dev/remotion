import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';
import {PlayButton} from './PlayButton';

const SfxItem: React.FC<{
	readonly link: string;
	readonly src: string;
	readonly name: string;
	readonly description: string;
}> = ({link, src, name, description}) => {
	return (
		<TOCItem link={link}>
			<div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12}}>
				<PlayButton src={src} size={32} depth={0.5} />
				<div>
					<strong>{name}</strong>
					<div>{description}</div>
				</div>
			</div>
		</TOCItem>
	);
};

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<SfxItem link="/docs/sfx/whip" src="https://remotion.media/whip.wav" name="whip" description="Whip sound effect" />
				<SfxItem link="/docs/sfx/whoosh" src="https://remotion.media/whoosh.wav" name="whoosh" description="Whoosh sound effect" />
				<SfxItem link="/docs/sfx/page-turn" src="https://remotion.media/page-turn.wav" name="pageTurn" description="Page turn sound effect" />
				<SfxItem link="/docs/sfx/ui-switch" src="https://remotion.media/switch.wav" name="uiSwitch" description="UI switch sound effect" />
				<SfxItem link="/docs/sfx/mouse-click" src="https://remotion.media/mouse-click.wav" name="mouseClick" description="Mouse click sound effect" />
				<SfxItem link="/docs/sfx/shutter-modern" src="https://remotion.media/shutter-modern.wav" name="shutterModern" description="Modern camera shutter sound effect" />
				<SfxItem link="/docs/sfx/shutter-old" src="https://remotion.media/shutter-old.wav" name="shutterOld" description="Vintage camera shutter sound effect" />
				<SfxItem link="/docs/sfx/ding" src="https://remotion.media/ding.wav" name="ding" description="Ding notification sound effect" />
				<SfxItem link="/docs/sfx/bruh" src="https://remotion.media/bruh.wav" name="bruh" description="Bruh sound effect" />
				<SfxItem link="/docs/sfx/vine-boom" src="https://remotion.media/vine-boom.wav" name="vineBoom" description="Vine boom sound effect" />
				<SfxItem link="/docs/sfx/windows-xp-error" src="https://remotion.media/windows-xp-error.wav" name="windowsXpError" description="Windows XP error sound effect" />
			</Grid>
		</div>
	);
};
