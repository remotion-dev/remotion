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
		<TOCItem link={link} draggable={false}>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'auto minmax(0, 1fr)',
					alignItems: 'center',
					gap: 12,
				}}
			>
				<PlayButton src={src} size={32} depth={0.5} showDragTarget={false} />
				<div style={{minWidth: 0}}>
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
				<SfxItem
					link="/docs/sfx/whip"
					src="https://remotion.media/whip.wav"
					name="whip"
					description="Whip sound effect"
				/>
				<SfxItem
					link="/docs/sfx/whoosh"
					src="https://remotion.media/whoosh.wav"
					name="whoosh"
					description="Whoosh sound effect"
				/>
				<SfxItem
					link="/docs/sfx/page-turn"
					src="https://remotion.media/page-turn.wav"
					name="pageTurn"
					description="Page turn sound effect"
				/>
				<SfxItem
					link="/docs/sfx/ui-switch"
					src="https://remotion.media/switch.wav"
					name="uiSwitch"
					description="UI switch sound effect"
				/>
				<SfxItem
					link="/docs/sfx/mouse-click"
					src="https://remotion.media/mouse-click.wav"
					name="mouseClick"
					description="Mouse click sound effect"
				/>
				<SfxItem
					link="/docs/sfx/shutter-modern"
					src="https://remotion.media/shutter-modern.wav"
					name="shutterModern"
					description="Modern camera shutter sound effect"
				/>
				<SfxItem
					link="/docs/sfx/shutter-old"
					src="https://remotion.media/shutter-old.wav"
					name="shutterOld"
					description="Vintage camera shutter sound effect"
				/>
				<SfxItem
					link="/docs/sfx/ding"
					src="https://remotion.media/ding.wav"
					name="ding"
					description="Ding notification sound effect"
				/>
				<SfxItem
					link="/docs/sfx/bruh"
					src="https://remotion.media/bruh.wav"
					name="bruh"
					description="Bruh sound effect"
				/>
				<SfxItem
					link="/docs/sfx/vine-boom"
					src="https://remotion.media/vine-boom.wav"
					name="vineBoom"
					description="Vine boom sound effect"
				/>
				<SfxItem
					link="/docs/sfx/windows-xp-error"
					src="https://remotion.media/windows-xp-error.wav"
					name="windowsXpError"
					description="Windows XP error sound effect"
				/>
				<SfxItem
					link="/docs/sfx/fah"
					src="https://remotion.media/fah.wav"
					name="fah"
					description="Fah meme sound effect"
				/>
				<SfxItem
					link="/docs/sfx/spongebob-fail"
					src="https://remotion.media/spongebob-fail.wav"
					name="spongebobFail"
					description="SpongeBob fail sound effect"
				/>
				<SfxItem
					link="/docs/sfx/omg-hell-nah"
					src="https://remotion.media/omg-hell-nah.wav"
					name="omgHellNah"
					description="Oh my god bro hell nah sound effect"
				/>
				<SfxItem
					link="/docs/sfx/price-is-right-fail"
					src="https://remotion.media/price-is-right-fail.wav"
					name="priceIsRightFail"
					description="Price Is Right fail horn sound effect"
				/>
				<SfxItem
					link="/docs/sfx/romance-meme"
					src="https://remotion.media/romance-meme.wav"
					name="romanceMeme"
					description="Romance meme sound effect"
				/>
				<SfxItem
					link="/docs/sfx/bone-crack"
					src="https://remotion.media/bone-crack.wav"
					name="boneCrack"
					description="Bone crack sound effect"
				/>
				<SfxItem
					link="/docs/sfx/anime-wow"
					src="https://remotion.media/anime-wow.wav"
					name="animeWow"
					description="Anime wow sound effect"
				/>
				<SfxItem
					link="/docs/sfx/yippee"
					src="https://remotion.media/yippee.wav"
					name="yippee"
					description="Yippee sound effect"
				/>
				<SfxItem
					link="/docs/sfx/loading-lag"
					src="https://remotion.media/loading-lag.wav"
					name="loadingLag"
					description="Loading lag sound effect"
				/>
				<SfxItem
					link="/docs/sfx/wilhelm-scream"
					src="https://remotion.media/wilhelm-scream.wav"
					name="wilhelmScream"
					description="Wilhelm scream sound effect"
				/>
				<SfxItem
					link="/docs/sfx/mac-quack"
					src="https://remotion.media/mac-quack.wav"
					name="macQuack"
					description="Mac quack sound effect"
				/>
				<SfxItem
					link="/docs/sfx/skedaddle"
					src="https://remotion.media/skedaddle.wav"
					name="skedaddle"
					description="Skedaddle sound effect"
				/>
				<SfxItem
					link="/docs/sfx/snapchat-notification"
					src="https://remotion.media/snapchat-notification.wav"
					name="snapchatNotification"
					description="Snapchat notification sound effect"
				/>
				<SfxItem
					link="/docs/sfx/nelly-ahh"
					src="https://remotion.media/nelly-ahh.wav"
					name="nellyAhh"
					description="Nelly ahh sound effect"
				/>
				<SfxItem
					link="/docs/sfx/sanctuary-guardian-what"
					src="https://remotion.media/sanctuary-guardian-what.wav"
					name="sanctuaryGuardianWhat"
					description="Sanctuary Guardian what meme sound effect"
				/>
				<SfxItem
					link="/docs/sfx/minecraft-hurt"
					src="https://remotion.media/minecraft-hurt.wav"
					name="minecraftHurt"
					description="Minecraft hurt sound effect"
				/>
				<SfxItem
					link="/docs/sfx/oh-my-god-vine"
					src="https://remotion.media/oh-my-god-vine.wav"
					name="ohMyGodVine"
					description="Oh my god vine sound effect"
				/>
				<SfxItem
					link="/docs/sfx/illuminati-confirmed"
					src="https://remotion.media/illuminati-confirmed.wav"
					name="illuminatiConfirmed"
					description="Illuminati confirmed sound effect"
				/>
				<SfxItem
					link="/docs/sfx/dramatic-boomer"
					src="https://remotion.media/dramatic-boomer.wav"
					name="dramaticBoomer"
					description="Dramatic boomer sound effect"
				/>
				<SfxItem
					link="/docs/sfx/triggered"
					src="https://remotion.media/triggered.wav"
					name="triggered"
					description="Triggered meme sound effect"
				/>
				<SfxItem
					link="/docs/sfx/record-scratch"
					src="https://remotion.media/record-scratch.wav"
					name="recordScratch"
					description="Record scratch sound effect"
				/>
			</Grid>
		</div>
	);
};
