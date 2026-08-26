import {loadFont} from '@remotion/google-fonts/Inter';
import {AbsoluteFill, Interactive} from 'remotion';

loadFont('normal', {
	subsets: ['latin'],
	weights: ['500'],
});

export const ChatMessageScene = () => {
	return (
		<AbsoluteFill
			name="Chat message scene"
			style={{
				alignItems: 'center',
				display: 'flex',
				justifyContent: 'center',
			}}
		>
			<Interactive.Div
				name="Chat message"
				style={{
					backgroundColor: '#f3f3f3',
					border: '1px solid #dedede',
					borderRadius: 44,
					boxShadow: '0 12px 28px rgba(0, 0, 0, 0.06)',
					color: '#171717',
					fontFamily: 'Inter',
					fontSize: 84,
					fontWeight: 500,
					letterSpacing: -3,
					lineHeight: 1.05,
					padding: '52px 68px',
				}}
			>
				make this bigger
			</Interactive.Div>
		</AbsoluteFill>
	);
};
