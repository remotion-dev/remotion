export type AllowedVideoProps = Omit<
	React.DetailedHTMLProps<
		React.VideoHTMLAttributes<HTMLVideoElement>,
		HTMLVideoElement
	>,
	'autoplay' | 'controls'
>;
