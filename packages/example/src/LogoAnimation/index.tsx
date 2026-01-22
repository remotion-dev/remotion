import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Background} from './Background';
import {BrandName} from './BrandName';
import {LensFlare} from './LensFlare';
import {NLogo} from './NLogo';
import {Tagline} from './Tagline';

export const LogoAnimation: React.FC = () => {
	return (
		<AbsoluteFill>
			{/* Dark space background with moving stars */}
			<Background />

			{/* Lens flare effect */}
			<LensFlare />

			{/* Main content container */}
			<AbsoluteFill
				style={{
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
					gap: '40px',
				}}
			>
				{/* Abstract N logo */}
				<NLogo />

				{/* Brand name with 3D flip animation */}
				<BrandName />

				{/* Typewriter tagline */}
				<Tagline />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
