import React, {useMemo, useState} from 'react';
import {CommandCopyButton} from './CommandCopyButton';
import {Skill} from './Skill';

type Props = {
	readonly prompt: string;
};

const copyPrompt = async (prompt: string) => {
	if (navigator.clipboard?.writeText) {
		await navigator.clipboard.writeText(prompt);
		return;
	}

	const textarea = document.createElement('textarea');
	textarea.value = prompt;
	textarea.style.position = 'fixed';
	textarea.style.opacity = '0';
	document.body.appendChild(textarea);
	textarea.focus();
	textarea.select();
	document.execCommand('copy');
	document.body.removeChild(textarea);
};

const parsePrompt = (prompt: string) => {
	const match = /^(\/[^\s]+)(.*)$/s.exec(prompt);

	if (!match) {
		return {
			command: null,
			rest: prompt,
		};
	}

	return {
		command: match[1],
		rest: match[2],
	};
};

export const SuggestedPrompt: React.FC<Props> = ({prompt}) => {
	const [copied, setCopied] = useState(false);
	const {command, rest} = useMemo(() => parsePrompt(prompt), [prompt]);

	const onCopy = async () => {
		try {
			await copyPrompt(prompt);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			setCopied(false);
		}
	};

	return (
		<div className="suggested-prompt" style={{marginTop: 16, marginBottom: 16}}>
			<div
				style={{
					position: 'relative',
					zIndex: 1,
					borderRadius: 18,
					border: '1px solid var(--border-color)',
					backgroundColor: 'var(--ifm-background-color)',
					color: 'var(--text-color)',
					display: 'grid',
					gridTemplateColumns: 'minmax(0, 1fr) 28px',
					columnGap: 16,
					alignItems: 'end',
					padding: '12px 12px 12px 18px',
				}}
			>
				<div
					style={{
						minHeight: 28,
						fontFamily: 'GTPlanar',
						fontSize: 15,
						lineHeight: 1.6,
					}}
				>
					{command ? <Skill>{command}</Skill> : null}
					{rest ? (
						<span style={{overflowWrap: 'anywhere', whiteSpace: 'pre-wrap'}}>
							{rest}
						</span>
					) : null}
				</div>
				<button
					type="button"
					onClick={onCopy}
					aria-label={copied ? 'Copied prompt' : 'Copy prompt'}
					title={copied ? 'Copied prompt' : 'Copy prompt'}
					style={{
						border: 'none',
						borderRadius: '50%',
						backgroundColor: 'var(--text-color)',
						color: 'var(--ifm-background-color)',
						width: 28,
						height: 28,
						padding: 6,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						cursor: 'pointer',
						boxSizing: 'border-box',
					}}
				>
					<CommandCopyButton copied={copied} size={14} />
				</button>
			</div>
			<div
				style={{
					margin: '-12px 12px 0',
					borderRadius: '0 0 12px 12px',
					backgroundColor: 'var(--ifm-color-emphasis-100)',
					color: 'var(--subtitle)',
					padding: '20px 14px 8px',
					fontFamily: 'GTPlanar',
					fontSize: 12,
					lineHeight: 1.5,
				}}
			>
				Suggested prompt
			</div>
		</div>
	);
};
