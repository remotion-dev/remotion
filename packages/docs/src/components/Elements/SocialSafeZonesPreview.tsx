import React from 'react';
import {SocialSafeZones} from '../../../elements/overlays/social-safe-zones/social-safe-zones';

export const SocialSafeZonesPreview: React.FC = () => {
	return (
		<SocialSafeZones
			forceVisibleForPreview
			name="Social safe zones"
			overlayOpacity={0.45}
			platform={'instagram'}
		/>
	);
};
