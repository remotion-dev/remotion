import {Composition, Folder} from 'remotion';
import {
	LogoOnlyOnWhiteSvg,
	LogoOnlySvg,
	LogoOnlyWhiteSvg,
	LogoOnWhiteSvg,
	LogoSvg,
	LogoWhiteSvg,
} from './Logos';

export const SvgLogoCompositions = () => {
	return (
		<Folder name="svg-logos">
			<Composition
				id="SvgLogo"
				component={LogoSvg}
				width={410}
				height={425}
				fps={30}
				durationInFrames={1}
			/>
			<Composition
				id="SvgLogoOnWhite"
				component={LogoOnWhiteSvg}
				width={410}
				height={425}
				fps={30}
				durationInFrames={1}
			/>
			<Composition
				id="SvgLogoWhite"
				component={LogoWhiteSvg}
				width={410}
				height={425}
				fps={30}
				durationInFrames={1}
			/>
			<Composition
				id="SvgLogoOnly"
				component={LogoOnlySvg}
				width={1024}
				height={1024}
				fps={30}
				durationInFrames={1}
			/>
			<Composition
				id="SvgLogoOnlyOnWhite"
				component={LogoOnlyOnWhiteSvg}
				width={1024}
				height={1024}
				fps={30}
				durationInFrames={1}
			/>
			<Composition
				id="SvgLogoOnlyWhite"
				component={LogoOnlyWhiteSvg}
				width={1024}
				height={1024}
				fps={30}
				durationInFrames={1}
			/>
		</Folder>
	);
};
