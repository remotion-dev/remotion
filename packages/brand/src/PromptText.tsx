import type {ReactNode} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {CodexSkillMention} from './CodexSkillMention';
import {getNaturalTypedCharacterCount} from './natural-typing';

export const PromptText = ({
	prompt,
	typingStartFrame,
	typingDurationInFrames,
	showCaret,
	caretColor,
	skillColor,
}: {
	readonly prompt: string;
	readonly typingStartFrame: number;
	readonly typingDurationInFrames: number;
	readonly showCaret: boolean;
	readonly caretColor: string | null;
	readonly skillColor: string | null;
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const mentionPattern =
		/\$([a-z][a-z0-9-]*)|(\/remotion-[a-z0-9-]+)|https?:\/\/[^\s]+/g;
	const mentions = [...prompt.matchAll(mentionPattern)];
	const typedText = prompt.replace(mentionPattern, '');
	const visibleCharacters = getNaturalTypedCharacterCount({
		text: typedText,
		frame,
		startFrame: typingStartFrame,
		durationInFrames: typingDurationInFrames,
		startCharacter: 0,
		endCharacter: typedText.length,
	});
	const promptParts: ReactNode[] = [];
	let textStart = 0;
	let remainingCharacters = visibleCharacters;
	let typedCharactersBefore = 0;
	for (const match of mentions) {
		const start = match.index;
		const end = start + match[0].length;
		const text = prompt.slice(textStart, start);

		promptParts.push(text.slice(0, remainingCharacters));
		remainingCharacters = Math.max(0, remainingCharacters - text.length);
		typedCharactersBefore += text.length;
		if (match[1] || match[2]) {
			promptParts.push(
				<CodexSkillMention
					key={start}
					name={match[1] ?? match[2]}
					color={skillColor}
				/>,
			);
		} else if (visibleCharacters >= typedCharactersBefore) {
			const displayUrl = match[0].replace(/^https?:\/\/(?:www\.)?/, '');
			const domain = displayUrl.split('/')[0];
			promptParts.push(
				<span key={start} style={{color: '#7db4f4'}}>
					<span style={{whiteSpace: 'nowrap'}}>
						<svg
							width="1em"
							height="1em"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							style={{
								display: 'inline-block',
								verticalAlign: '-0.125em',
								marginRight: '0.25em',
							}}
						>
							<circle cx="12" cy="12" r="9" />
							<ellipse cx="12" cy="12" rx="4" ry="9" />
							<path d="M3 12h18" />
						</svg>
						{domain}
					</span>
					{displayUrl.slice(domain.length)}
				</span>,
			);
		}

		textStart = end;
	}

	promptParts.push(prompt.slice(textStart, textStart + remainingCharacters));

	return (
		<span style={{whiteSpace: 'pre-wrap', overflowWrap: 'anywhere'}}>
			{promptParts}
			{showCaret ? (
				<span
					style={{
						display: 'inline-block',
						width: '0.0465em',
						height: '1.116em',
						verticalAlign: '-0.2326em',
						backgroundColor: caretColor ?? '#d6d6d6',
						opacity:
							(frame >= typingStartFrame &&
								frame < typingStartFrame + typingDurationInFrames) ||
							frame % fps < fps / 2
								? 1
								: 0,
					}}
				/>
			) : null}
		</span>
	);
};
