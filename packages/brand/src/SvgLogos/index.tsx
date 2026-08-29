import {Composition, Folder} from 'remotion';
import type {SvgLogoVariant} from './Logos';
import {SvgLogo} from './Logos';

const logos: readonly {
	readonly id: string;
	readonly variant: SvgLogoVariant;
	readonly width: number;
	readonly height: number;
}[] = [
	{id: 'SvgLogo', variant: 'compact-blue', width: 410, height: 425},
	{
		id: 'SvgLogoOnWhite',
		variant: 'compact-blue-on-white',
		width: 410,
		height: 425,
	},
	{id: 'SvgLogoWhite', variant: 'compact-white', width: 410, height: 425},
	{id: 'SvgLogoOnly', variant: 'square-blue', width: 1024, height: 1024},
	{
		id: 'SvgLogoOnlyOnWhite',
		variant: 'square-blue-on-white',
		width: 1024,
		height: 1024,
	},
	{
		id: 'SvgLogoOnlyWhite',
		variant: 'square-white',
		width: 1024,
		height: 1024,
	},
	{
		id: 'SvgBannerLight',
		variant: 'banner-light',
		width: 2000,
		height: 800,
	},
	{
		id: 'SvgBannerLightOnWhite',
		variant: 'banner-light-on-white',
		width: 2000,
		height: 800,
	},
	{
		id: 'SvgBannerDark',
		variant: 'banner-dark',
		width: 2000,
		height: 800,
	},
	{
		id: 'SvgBannerDarkOnBlack',
		variant: 'banner-dark-on-black',
		width: 2000,
		height: 800,
	},
];

export const SvgLogoCompositions = () => {
	return (
		<Folder name="svg-logos">
			{logos.map((logo) => (
				<Composition
					key={logo.id}
					id={logo.id}
					component={SvgLogo}
					defaultProps={{variant: logo.variant}}
					width={logo.width}
					height={logo.height}
					fps={30}
					durationInFrames={1}
				/>
			))}
		</Folder>
	);
};
