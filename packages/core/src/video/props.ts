export type RemotionMainVideoProps = {
	startAt?: number;
	endTo?: number;
};

export type RemotionVideoProps = Omit<
	React.DetailedHTMLProps<
		React.VideoHTMLAttributes<HTMLVideoElement>,
		HTMLVideoElement
	>,
	'autoplay' | 'controls'
>;
