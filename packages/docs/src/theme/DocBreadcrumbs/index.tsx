import type {WrapperProps} from '@docusaurus/types';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import DocBreadcrumbs from '@theme-original/DocBreadcrumbs';
import type DocBreadcrumbsType from '@theme/DocBreadcrumbs';
import React, {type ReactNode, useCallback, useState} from 'react';

type Props = WrapperProps<typeof DocBreadcrumbsType>;

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
	document.execCommand('copy');
	document.body.removeChild(ta);
}

export default function DocBreadcrumbsWrapper(props: Props): ReactNode {
	const [copied, setCopied] = useState<boolean>(false);

	const handleCopyMarkdown = useCallback(async () => {
		try {
			const el = document.getElementById('__doc_raw');
			let raw = '';
			if (el?.textContent) {
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
			<div
				style={{display: 'inline-flex', alignItems: 'stretch'}}
				className="copy-markdown-btn"
			>
				<button
					onClick={handleCopyMarkdown}
					style={{
						all: 'unset',
						cursor: 'pointer',
						display: 'inline-flex',
						alignItems: 'center',
						fontSize: '0.875rem',
						whiteSpace: 'nowrap',
						border: '1px solid var(--border-color)',
						borderRadius: '6px 0 0 6px',
						padding: '6px 10px',
					}}
					type="button"
				>
					<svg
						height="14"
						width="14"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 448 512"
						style={{marginRight: '0.4em'}}
					>
						<path
							fill="currentcolor"
							d="M384 336H192c-8.8 0-16-7.2-16-16V64c0-8.8 7.2-16 16-16l140.1 0L400 115.9V320c0 8.8-7.2 16-16 16zM192 384H384c35.3 0 64-28.7 64-64V115.9c0-12.7-5.1-24.9-14.1-33.9L366.1 14.1c-9-9-21.2-14.1-33.9-14.1H192c-35.3 0-64 28.7-64 64V320c0 35.3 28.7 64 64 64zM64 128c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64H256c35.3 0 64-28.7 64-64V416H272v32c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192c0-8.8 7.2-16 16-16H96V128H64z"
						/>
					</svg>
					{copied ? 'Copied' : 'Copy page'}
				</button>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger asChild>
						<button
							style={{
								all: 'unset',
								cursor: 'pointer',
								display: 'inline-flex',
								alignItems: 'center',
								justifyContent: 'center',
								padding: '6px 8px',
								border: '1px solid var(--border-color)',
								borderLeft: 'none',
								borderRadius: '0 6px 6px 0',
							}}
							type="button"
						>
							<svg
								width="10"
								height="10"
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
								borderRadius: '6px',
								padding: '4px',
								minWidth: '180px',
								boxShadow: 'var(--box-shadow)',
								zIndex: 9999,
							}}
						>
							<DropdownMenu.Item
								onClick={handleCopyMarkdown}
								style={{
									padding: '8px 12px',
									fontSize: '0.875rem',
									cursor: 'pointer',
									borderRadius: '4px',
									outline: 'none',
									color: 'var(--text-color)',
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.backgroundColor = 'var(--clear-hover)';
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.backgroundColor = 'transparent';
								}}
							>
								Copy as Markdown
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Portal>
				</DropdownMenu.Root>
			</div>
		</div>
	);
}
