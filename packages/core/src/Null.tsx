/**
 * @deprecated <Null /> has been removed as of Remotion v4.0.228. The native clipping APIs were experimental and subject to removal at any time. We removed them because they were sparingly used and made rendering often slower rather than faster.
 */
export const Null: React.FC = () => {
	throw new Error(
		'<Null> has been removed as of Remotion v4.0.228. The native clipping APIs were experimental and subject to removal at any time. We removed them because they were sparingly used and made rendering often slower rather than faster.',
	);
};
