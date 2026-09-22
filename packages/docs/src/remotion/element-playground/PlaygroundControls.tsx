import {installInStudio} from '@remotion/studio-protocol';
import React, {useState} from 'react';
import {createPortal} from 'react-dom';
import {getRemotionEnvironment} from 'remotion';
import {elementDefinitions} from '../../components/Elements/element-definitions';
import {createElementPayloadFromDefinition} from '../../components/Elements/element-drag-data';
import sources from './element-sources';

export const PlaygroundControls: React.FC = () => {
	const [installing, setInstalling] = useState(false);
	const [error, setError] = useState<string | null>(null);
	if (!getRemotionEnvironment().isStudio) return null;

	return createPortal(
		<section
			aria-label="Add element"
			style={{
				position: 'fixed',
				bottom: 40,
				right: 16,
				zIndex: 10,
				background: '#202020',
				color: 'white',
				padding: 12,
				font: '13px system-ui',
			}}
		>
			<div style={{marginBottom: 8}}>Add element</div>
			<form
				style={{display: 'flex', gap: 8, height: 32}}
				onSubmit={async (event) => {
					event.preventDefault();
					const input = event.currentTarget.elements.namedItem(
						'element',
					) as HTMLSelectElement;
					const definition = elementDefinitions.find(
						({slug}) => slug === input.value,
					);
					const sourceCode = sources[input.value];
					if (!definition || typeof sourceCode !== 'string') {
						input.setCustomValidity('Choose a local Element from the list.');
						input.reportValidity();
						return;
					}

					setInstalling(true);
					setError(null);
					try {
						const result = await installInStudio({
							payload: createElementPayloadFromDefinition({
								definition,
								sourceCode,
							}),
						});
						if (!result.success) setError(result.message);
					} catch (err) {
						setError(String(err));
					} finally {
						setInstalling(false);
					}
				}}
			>
				<select
					name="element"
					aria-label="Local element"
					defaultValue=""
					required
					onChange={(event) => event.currentTarget.setCustomValidity('')}
				>
					<option value="" disabled>
						Choose an element
					</option>
					{elementDefinitions.map(({slug, displayName}) => (
						<option key={slug} value={slug}>
							{displayName}
						</option>
					))}
				</select>
				<button type="submit" disabled={installing} style={{cursor: 'default'}}>
					Install element
				</button>
			</form>
			{error ? <p role="alert">{error}</p> : null}
		</section>,
		document.body,
	);
};
