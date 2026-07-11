import React, {useMemo, useState} from 'react';
import {CommandCopyButton} from './CommandCopyButton';

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
	const match = /^(\/[^\s]+)(.*)$/.exec(prompt);

	if (!match) {
		return {
			command: null,
			rest: prompt,
		};
	}

	return {
		command: match[1],
		rest: match[2].trimStart(),
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
		<div
			style={{
				borderRadius: 18,
				marginTop: 16,
				marginBottom: 16,
				backgroundColor: 'var(--ifm-color-emphasis-100)',
				color: 'var(--text-color)',
				display: 'flex',
				alignItems: 'center',
				gap: 12,
				padding: '16px 18px',
				boxShadow: '0 6px 24px rgba(0, 0, 0, 0.08)',
			}}
		>
			<div
				style={{
					flex: 1,
					minWidth: 0,
					fontFamily: 'GTPlanar',
					fontSize: 14,
					lineHeight: 1.6,
				}}
			>
				{command ? (
					<span
						style={{
							border: '1px solid var(--ifm-color-emphasis-200)',
							borderRadius: 6,
							padding: '1px 6px',
							color: 'var(--ifm-color-primary)',
							backgroundColor: 'var(--ifm-background-surface-color)',
							fontWeight: 700,
							whiteSpace: 'nowrap',
							display: 'inline-block',
							marginLeft: -6,
							marginRight: 8,
						}}
					>
						{command}
					</span>
				) : null}
				{rest ? <span style={{overflowWrap: 'anywhere'}}>{rest}</span> : null}
			</div>
			<button
				type="button"
				onClick={onCopy}
				aria-label={copied ? 'Copied prompt' : 'Copy prompt'}
				title={copied ? 'Copied prompt' : 'Copy prompt'}
				style={{
					border: 'none',
					borderRadius: 6,
					backgroundColor: 'var(--ifm-background-surface-color)',
					color: 'var(--subtitle)',
					width: 26,
					height: 26,
					padding: 6,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					cursor: 'pointer',
					flexShrink: 0,
					boxSizing: 'border-box',
				}}
			>
				<CommandCopyButton copied={copied} size={14} />
			</button>
		</div>
	);
};
