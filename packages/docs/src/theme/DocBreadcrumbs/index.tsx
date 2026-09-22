import type {WrapperProps} from '@docusaurus/types';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import type DocBreadcrumbsType from '@theme-original/DocBreadcrumbs';
import DocBreadcrumbs from '@theme-original/DocBreadcrumbs';
import React, {type ReactNode, useCallback, useState} from 'react';
import {decodeRawMarkdownFromCarrier} from '../RawMarkdownCarrier';
import {
	AnthropicIcon,
	ExternalLinkIcon,
	MarkdownIcon,
	OpenAIIcon,
	RemotionIcon,
	CopyIcon,
} from './icons';
import styles from './styles.module.css';

type Props = WrapperProps<typeof DocBreadcrumbsType>;

const dropdownItemStyle: React.CSSProperties = {
	padding: '6px',
	fontSize: '0.875rem',
	cursor: 'pointer',
	borderRadius: '12px',
	outline: 'none',
	display: 'flex',
	alignItems: 'center',
	gap: '4px',
};

const iconContainerStyle: React.CSSProperties = {
	border: '1px solid var(--border-color)',
	borderRadius: '8px',
	padding: '6px',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
};

const itemContentStyle: React.CSSProperties = {
	flex: 1,
	paddingLeft: '4px',
};

const itemTitleStyle: React.CSSProperties = {
	fontSize: '0.875rem',
	fontWeight: 500,
	color: 'var(--text-color)',
	display: 'flex',
	alignItems: 'center',
	gap: '4px',
};

const itemDescriptionStyle: React.CSSProperties = {
	fontSize: '0.75rem',
	color: 'var(--light-text-color)',
};

interface DropdownItemProps {
	readonly icon: ReactNode;
	readonly title: string;
	readonly description: string;
	readonly onClick?: () => void;
	readonly showExternalIcon?: boolean;
}

function AiDropdownItemComponent({
	icon,
	title,
	description,
	onClick,
	showExternalIcon = false,
}: DropdownItemProps) {
	return (
		<DropdownMenu.Item
			onClick={onClick}
			style={dropdownItemStyle}
			onMouseEnter={(e) => {
				e.currentTarget.style.backgroundColor = 'var(--clear-hover)';
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.backgroundColor = 'transparent';
			}}
		>
			<div style={iconContainerStyle}>{icon}</div>
			<div style={itemContentStyle}>
				<div style={itemTitleStyle}>
					{title}
					{showExternalIcon && <ExternalLinkIcon />}
				</div>
				<div style={itemDescriptionStyle}>{description}</div>
			</div>
		</DropdownMenu.Item>
	);
}

async function copy(text: string) {
	if (navigator.clipboard?.writeText) {
		await navigator.clipboard.writeText(text);

		return;
	}

	const ta = document.createElement('textarea');

	ta.value = text;
	ta.setAttribute('readonly', '');
	ta.style.position = 'absolute';
	ta.style.left = '-9999px';
	document.body.appendChild(ta);
	ta.select();
	const success = document.execCommand('copy');
	document.body.removeChild(ta);

	if (!success) {
		throw new Error('Copy command failed');
	}
}

export default function DocBreadcrumbsWrapper(props: Props): ReactNode {
	const [copied, setCopied] = useState<boolean>(false);

	const handleCopyMarkdown = useCallback(async () => {
		try {
			const el = document.getElementById('__doc_raw');
			let raw = '';
			const encodedRaw = el?.getAttribute('data-raw-markdown');
			if (encodedRaw) {
				raw = decodeRawMarkdownFromCarrier(encodedRaw);
			} else if (el?.textContent) {
				raw = JSON.parse(el.textContent);
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			} else if ((window as any).__DOC_RAW) {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				raw = (window as any).__DOC_RAW;
			}

			if (!raw) {
				setCopied(false);
				setTimeout(() => setCopied(false), 2000);
				return;
			}

			await copy(raw);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			setCopied(false);
			setTimeout(() => setCopied(false), 2000);
		}
	}, []);

	const getPrompt = useCallback((): string => {
		const currentUrl = window.location.href;
		return `Please read the documentation from ${currentUrl} and help me understand it. I may have questions about the content, features, and how to use what's described on this page.`;
	}, []);

	const handleOpenInChatGPT = useCallback(() => {
		const prompt = getPrompt();
		const chatgptUrl = `https://chatgpt.com/?hints=search&prompt=${encodeURIComponent(prompt)}`;
		window.open(chatgptUrl, '_blank');
	}, [getPrompt]);

	const handleOpenInClaude = useCallback(() => {
		const prompt = getPrompt();
		const claudeUrl = `https://claude.ai/?q=${encodeURIComponent(prompt)}`;
		window.open(claudeUrl, '_blank');
	}, [getPrompt]);

	const handleViewAsMarkdown = useCallback(() => {
		const currentPath = window.location.pathname.replace(/\/$/, '');
		const markdownUrl = `${currentPath}.md`;
		window.open(markdownUrl, '_blank');
	}, []);

	const handleAskAI = useCallback(() => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(window as any).crawlchatEmbed?.show();
	}, []);

	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				gap: '1rem',
			}}
		>
			<DocBreadcrumbs {...props} />
			<div className={`copy-markdown-btn ${styles.group}`}>
				<button
					onClick={handleCopyMarkdown}
					className={`${styles.button} ${styles.copyButton}`}
					type="button"
				>
					<span className={styles.icon}>
						<CopyIcon size={15} />
					</span>
					<span aria-live="polite">{copied ? 'Copied' : 'Copy page'}</span>
				</button>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger asChild>
						<button
							aria-label="Copy page options"
							className={`${styles.button} ${styles.menuButton}`}
							type="button"
						>
							<svg
								className={styles.icon}
								width="9"
								height="9"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 640 640"
								fill="currentColor"
							>
								<path d="M297.4 470.6C309.9 483.1 330.2 483.1 342.7 470.6L534.7 278.6C547.2 266.1 547.2 245.8 534.7 233.3C522.2 220.8 501.9 220.8 489.4 233.3L320 402.7L150.6 233.4C138.1 220.9 117.8 220.9 105.3 233.4C92.8 245.9 92.8 266.2 105.3 278.7L297.3 470.7z" />
							</svg>
						</button>
					</DropdownMenu.Trigger>

					<DropdownMenu.Portal>
						<DropdownMenu.Content
							align="end"
							sideOffset={5}
							style={{
								backgroundColor: 'var(--background)',
								border: '1px solid var(--border-color)',
								borderRadius: '12px',
								padding: '4px',
								minWidth: '280px',
								boxShadow: 'var(--box-shadow)',
								zIndex: 9999,
							}}
						>
							<AiDropdownItemComponent
								icon={<RemotionIcon />}
								title="Ask AI"
								description="Ask a question to our AI assistant"
								onClick={handleAskAI}
							/>

							<AiDropdownItemComponent
								icon={<MarkdownIcon />}
								title="View as Markdown"
								description="Open this page in Markdown"
								onClick={handleViewAsMarkdown}
							/>

							<AiDropdownItemComponent
								icon={<OpenAIIcon />}
								title="Open in ChatGPT"
								description="Ask questions about this page"
								onClick={handleOpenInChatGPT}
								showExternalIcon
							/>

							<AiDropdownItemComponent
								icon={<AnthropicIcon />}
								title="Open in Claude"
								description="Ask questions about this page"
								onClick={handleOpenInClaude}
								showExternalIcon
							/>
						</DropdownMenu.Content>
					</DropdownMenu.Portal>
				</DropdownMenu.Root>
			</div>
		</div>
	);
}
