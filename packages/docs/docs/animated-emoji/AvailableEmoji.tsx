import {getAvailableEmojis} from '@remotion/animated-emoji';
import React from 'react';

export const AvailableEmoji: React.FC = () => {
	return (
		<table>
			<tbody>
				<tr>
					<th>
						<code>name</code>
					</th>
					<th>Preview</th>
				</tr>
				{getAvailableEmojis().map((emoji) => (
					<tr key={emoji.name}>
						<td>{emoji.name}</td>
						<td>
							<img
								style={{
									height: 50,
								}}
								src={`https://fonts.gstatic.com/s/e/notoemoji/latest/${emoji.codepoint}/emoji.svg`}
							/>
						</td>
					</tr>
				))}
			</tbody>
		</table>
	);
};
