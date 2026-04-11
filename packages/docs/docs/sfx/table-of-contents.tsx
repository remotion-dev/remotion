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
				<SfxItem link="/docs/sfx/faaah" src="https://remotion.media/faaah.wav" name="faaah" description="Faaah sound effect" />
				<SfxItem link="/docs/sfx/spongebob-fail" src="https://remotion.media/spongebob-fail.wav" name="spongebobFail" description="Spongebob Fail sound effect" />
				<SfxItem link="/docs/sfx/omg-hell-nah" src="https://remotion.media/omg-hell-nah.wav" name="omgHellNah" description="Omg Hell nah sound effect" />
				<SfxItem link="/docs/sfx/x-files" src="https://remotion.media/x-files.wav" name="xFiles" description="X Files sound effect" />
				<SfxItem link="/docs/sfx/fail-horn" src="https://remotion.media/fail-horn.wav" name="failHorn" description="Fail horn sound effect" />
				<SfxItem link="/docs/sfx/romance" src="https://remotion.media/romance.wav" name="romance" description="Romance sound effect" />
				<SfxItem link="/docs/sfx/bone-crack" src="https://remotion.media/bone-crack.wav" name="boneCrack" description="Bone crack sound effect" />
				<SfxItem link="/docs/sfx/anime-wow" src="https://remotion.media/anime-wow.wav" name="animeWow" description="Anime wow sound effect" />
				<SfxItem link="/docs/sfx/yippieh" src="https://remotion.media/yippieh.wav" name="yippieh" description="Yippieh sound effect" />
				<SfxItem link="/docs/sfx/lagging" src="https://remotion.media/lagging.wav" name="lagging" description="Lagging sound effect" />
				<SfxItem link="/docs/sfx/wilhelm-scream" src="https://remotion.media/wilhelm-scream.wav" name="wilhelmScream" description="Wilhelm scream sound effect" />
				<SfxItem link="/docs/sfx/quack" src="https://remotion.media/quack.wav" name="quack" description="Quack sound effect" />
				<SfxItem link="/docs/sfx/squedaddle" src="https://remotion.media/squedaddle.wav" name="squedaddle" description="Squedaddle sound effect" />
				<SfxItem link="/docs/sfx/notification" src="https://remotion.media/notification.wav" name="notification" description="Notification sound effect" />
				<SfxItem link="/docs/sfx/aah" src="https://remotion.media/aah.wav" name="aah" description="Aah sound effect" />
				<SfxItem link="/docs/sfx/what" src="https://remotion.media/what.wav" name="what" description="What? sound effect" />
				<SfxItem link="/docs/sfx/hurt" src="https://remotion.media/hurt.wav" name="hurt" description="Hurt sound effect" />
				<SfxItem link="/docs/sfx/oh-ma-gaud" src="https://remotion.media/oh-ma-gaud.wav" name="ohMaGaud" description="Oh ma gaud sound effect" />
				<SfxItem link="/docs/sfx/illuminati-confirmed" src="https://remotion.media/illuminati-confirmed.wav" name="illuminatiConfirmed" description="Illuminati confirmed sound effect" />
				<SfxItem link="/docs/sfx/dramatic-boomer" src="https://remotion.media/dramatic-boomer.wav" name="dramaticBoomer" description="Dramatic boomer sound effect" />
				<SfxItem link="/docs/sfx/core" src="https://remotion.media/core.wav" name="core" description="Core sound effect" />
			</Grid>
		</div>
	);
};
