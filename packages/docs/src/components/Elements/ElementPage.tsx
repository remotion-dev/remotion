import {
	makeElementDragData,
	type ComponentDimensions,
} from '@remotion/studio-shared';
import React, {useMemo, type ComponentType, type ReactNode} from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {setElementDragData, setElementDragImage} from './element-drag-data';
import {ElementPreview} from './ElementPreview';

type ElementPageProps = {
	readonly children?: ReactNode;
	readonly component: ComponentType<Record<string, never>>;
	readonly displayName?: string;
	readonly durationInFrames?: number;
	readonly elementHeight?: number;
	readonly elementWidth?: number;
	readonly fps?: number;
	readonly height?: number;
	readonly previewPadding?: number;
	readonly slug?: string;
	readonly sourceCode?: string;
	readonly width?: number;
};

const dragButtonStyle: React.CSSProperties = {
	display: 'inline-flex',
	alignItems: 'center',
	gap: 10,
	padding: '12px 16px',
	borderRadius: 10,
	border: '1px solid var(--ifm-color-emphasis-300)',
	background: 'var(--ifm-background-surface-color)',
	boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)',
	cursor: 'grab',
	fontWeight: 700,
	userSelect: 'none',
};

export const ElementPage: React.FC<ElementPageProps> = ({
	children,
	component,
	displayName,
	durationInFrames = 120,
	elementHeight,
	elementWidth,
	fps = 30,
	height = 1080,
	previewPadding = 0,
	slug,
	sourceCode,
	width = 1920,
}) => {
	const hasElementDimensions =
		elementWidth !== undefined && elementHeight !== undefined;
	const previewWidth =
		hasElementDimensions && previewPadding > 0
			? elementWidth + previewPadding * 2
			: width;
	const previewHeight =
		hasElementDimensions && previewPadding > 0
			? elementHeight + previewPadding * 2
			: height;

	const dragData = useMemo(() => {
		if (!slug || !displayName || !sourceCode) {
			return null;
		}

		const dimensions: ComponentDimensions | undefined =
			elementWidth !== undefined && elementHeight !== undefined
				? {
						width: elementWidth,
						height: elementHeight,
					}
				: undefined;

		return makeElementDragData({
			dimensions,
			displayName,
			slug,
			sourceCode,
		});
	}, [displayName, elementHeight, elementWidth, slug, sourceCode]);

	const PreviewComponent = useMemo(() => {
		if (!hasElementDimensions) {
			return component;
		}

		const Component = component;

		return () => {
			if (previewPadding > 0) {
				return (
					<AbsoluteFill
						style={{
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<Sequence height={elementHeight} layout="none" width={elementWidth}>
							<div
								style={{
									height: elementHeight,
									position: 'relative',
									width: elementWidth,
								}}
							>
								<Component />
							</div>
						</Sequence>
					</AbsoluteFill>
				);
			}

			return (
				<Sequence height={elementHeight} width={elementWidth}>
					<Component />
				</Sequence>
			);
		};
	}, [
		component,
		elementHeight,
		elementWidth,
		hasElementDimensions,
		previewPadding,
	]);

	return (
		<>
			<h2>Preview</h2>
			<ElementPreview
				component={PreviewComponent}
				durationInFrames={durationInFrames}
				fps={fps}
				height={previewHeight}
				width={previewWidth}
			/>

			<h2>Use it</h2>
			<p>
				Copy the source code into your Remotion project. The file exports the
				Element component. Preview dimensions, frame rate, and duration are
				supplied by the gallery.
			</p>
			{dragData === null ? null : (
				<p>
					<button
						draggable
						onDragStart={(event) => {
							setElementDragData({
								dataTransfer: event.dataTransfer,
								dragData,
							});
							setElementDragImage(event.dataTransfer);
						}}
						style={dragButtonStyle}
						title="Drag into Remotion Studio"
						type="button"
					>
						<span aria-hidden="true">↘</span>
						Drag into Remotion Studio
					</button>
				</p>
			)}

			<h2>Source</h2>
			{children}
		</>
	);
};
