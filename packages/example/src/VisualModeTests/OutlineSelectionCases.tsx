import React from 'react';
import {Interactive, Sequence, Series} from 'remotion';

const caseDurationInFrames = 180;

const CaseFrame: React.FC<{
	readonly caseNumber: number;
	readonly children: React.ReactNode;
	readonly desiredBehavior: string;
	readonly instructions: string;
	readonly status: 'Baseline' | 'Gap' | 'Partial';
	readonly summary: string;
	readonly title: string;
}> = ({
	caseNumber,
	children,
	desiredBehavior,
	instructions,
	status,
	summary,
	title,
}) => {
	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				backgroundColor: '#090f1f',
				color: '#f8fafc',
				fontFamily: 'Arial, Helvetica, sans-serif',
			}}
		>
			<div
				style={{
					position: 'absolute',
					left: 80,
					top: 68,
					width: 820,
				}}
			>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 18,
						marginBottom: 28,
					}}
				>
					<div
						style={{
							borderRadius: 999,
							padding: '10px 18px',
							backgroundColor:
								status === 'Baseline'
									? '#14532d'
									: status === 'Partial'
										? '#713f12'
										: '#7f1d1d',
							color:
								status === 'Baseline'
									? '#bbf7d0'
									: status === 'Partial'
										? '#fef08a'
										: '#fecaca',
							fontSize: 24,
							fontWeight: 700,
							textTransform: 'uppercase',
							letterSpacing: 1.5,
						}}
					>
						{status}
					</div>
					<div style={{fontSize: 28, color: '#94a3b8'}}>
						Case {String(caseNumber).padStart(2, '0')} / 15
					</div>
				</div>
				<div
					style={{
						fontSize: 68,
						fontWeight: 800,
						lineHeight: 1.04,
						letterSpacing: -2.5,
					}}
				>
					{title}
				</div>
				<div
					style={{
						fontSize: 34,
						lineHeight: 1.35,
						color: '#cbd5e1',
						marginTop: 30,
					}}
				>
					{summary}
				</div>
				<div
					style={{
						marginTop: 44,
						borderLeft: '6px solid #38bdf8',
						paddingLeft: 24,
					}}
				>
					<div
						style={{
							fontSize: 22,
							fontWeight: 800,
							textTransform: 'uppercase',
							letterSpacing: 1.8,
							color: '#7dd3fc',
						}}
					>
						Desired behavior
					</div>
					<div
						style={{
							fontSize: 34,
							lineHeight: 1.35,
							marginTop: 10,
						}}
					>
						{desiredBehavior}
					</div>
				</div>
				<div
					style={{
						position: 'absolute',
						left: 0,
						top: 820,
						width: 820,
						borderRadius: 20,
						backgroundColor: '#172033',
						padding: '22px 26px',
						fontSize: 28,
						lineHeight: 1.35,
						color: '#e2e8f0',
					}}
				>
					<span style={{fontWeight: 800, color: '#f8fafc'}}>Try: </span>
					{instructions}
				</div>
			</div>
			<div
				style={{
					position: 'absolute',
					left: 960,
					top: 90,
					width: 880,
					height: 850,
					borderRadius: 36,
					backgroundColor: '#111a2c',
					border: '2px solid #334155',
					overflow: 'visible',
				}}
			>
				<div
					style={{
						position: 'absolute',
						left: 30,
						top: 24,
						fontSize: 22,
						fontWeight: 800,
						textTransform: 'uppercase',
						letterSpacing: 1.8,
						color: '#64748b',
					}}
				>
					Interactive canvas fixture
				</div>
				{children}
			</div>
			<div
				style={{
					position: 'absolute',
					right: 80,
					bottom: 30,
					fontSize: 24,
					color: '#64748b',
				}}
			>
				Each case lasts 6 seconds · Pause the preview to interact
			</div>
		</div>
	);
};

const ShapeLabel: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				width: '100%',
				height: '100%',
				padding: 18,
				boxSizing: 'border-box',
				fontSize: 28,
				fontWeight: 800,
				textAlign: 'center',
				lineHeight: 1.15,
				color: '#ffffff',
				textShadow: '0 2px 10px rgba(0, 0, 0, 0.45)',
			}}
		>
			{children}
		</div>
	);
};

export const OutlineSelectionCases: React.FC = () => {
	return (
		<Series>
			<Series.Sequence
				durationInFrames={caseDurationInFrames}
				layout="none"
				name="01 - Children above parents"
			>
				<CaseFrame
					caseNumber={1}
					status="Baseline"
					title="Children are above parents"
					summary="The sequence hierarchy should determine which overlapping outline receives the pointer event."
					desiredBehavior="Clicking the overlap selects the smaller child, while the exposed parent area still selects the parent."
					instructions="Click the red child, then click the exposed blue area. The selection should switch from Child to Parent."
				>
					<Interactive.Div
						name="Parent"
						style={{
							position: 'absolute',
							left: 180,
							top: 190,
							width: 520,
							height: 430,
							backgroundColor: '#2563eb',
							borderRadius: 30,
							translate: '0px 0px',
						}}
					>
						<ShapeLabel>Parent</ShapeLabel>
						<Interactive.Div
							name="Child"
							style={{
								position: 'absolute',
								left: 160,
								top: 125,
								width: 240,
								height: 180,
								backgroundColor: '#e11d48',
								borderRadius: 24,
								translate: '0px 0px',
							}}
						>
							<ShapeLabel>Child</ShapeLabel>
						</Interactive.Div>
					</Interactive.Div>
				</CaseFrame>
			</Series.Sequence>

			<Series.Sequence
				durationInFrames={caseDurationInFrames}
				layout="none"
				name="02 - Children outside parents"
			>
				<CaseFrame
					caseNumber={2}
					status="Baseline"
					title="Children may extend outside parents"
					summary="DOM or sequence ancestry matters even when a child is not geometrically contained by its parent."
					desiredBehavior="The child remains above its parent throughout their overlap and stays selectable in the area extending beyond the parent."
					instructions="Click the red extension outside the blue parent, then click their overlap. Both clicks should select Child."
				>
					<Interactive.Div
						name="Small parent"
						style={{
							position: 'absolute',
							left: 130,
							top: 250,
							width: 360,
							height: 280,
							backgroundColor: '#2563eb',
							borderRadius: 30,
							translate: '0px 0px',
						}}
					>
						<ShapeLabel>Parent</ShapeLabel>
						<Interactive.Div
							name="Extending child"
							style={{
								position: 'absolute',
								left: 240,
								top: 100,
								width: 370,
								height: 180,
								backgroundColor: '#e11d48',
								borderRadius: 24,
								translate: '0px 0px',
							}}
						>
							<ShapeLabel>Child extends beyond parent</ShapeLabel>
						</Interactive.Div>
					</Interactive.Div>
				</CaseFrame>
			</Series.Sequence>

			<Series.Sequence
				durationInFrames={caseDurationInFrames}
				layout="none"
				name="03 - Hidden nested ancestors"
			>
				<CaseFrame
					caseNumber={3}
					status="Baseline"
					title="Arbitrary nesting still preserves hierarchy"
					summary="Some ancestors have no canvas outline. Ordering must traverse those hidden intermediate sequences transitively."
					desiredBehavior="The visible grandchild is treated as a descendant of the visible parent and wins the overlapping hit target."
					instructions="Expand the timeline to see two layout-none wrappers, then click the red grandchild. It should be selected above Parent."
				>
					<Interactive.Div
						name="Visible parent"
						style={{
							position: 'absolute',
							left: 180,
							top: 190,
							width: 520,
							height: 430,
							backgroundColor: '#2563eb',
							borderRadius: 30,
							translate: '0px 0px',
						}}
					>
						<ShapeLabel>Visible parent</ShapeLabel>
						<Sequence layout="none" name="Hidden intermediate A">
							<Sequence layout="none" name="Hidden intermediate B">
								<Interactive.Div
									name="Visible grandchild"
									style={{
										position: 'absolute',
										left: 145,
										top: 120,
										width: 250,
										height: 190,
										backgroundColor: '#e11d48',
										borderRadius: 24,
										translate: '0px 0px',
									}}
								>
									<ShapeLabel>Grandchild</ShapeLabel>
								</Interactive.Div>
							</Sequence>
						</Sequence>
					</Interactive.Div>
				</CaseFrame>
			</Series.Sequence>

			<Series.Sequence
				durationInFrames={caseDurationInFrames}
				layout="none"
				name="04 - Smaller unrelated overlap"
			>
				<CaseFrame
					caseNumber={4}
					status="Baseline"
					title="Smaller unrelated overlaps win"
					summary="When overlapping sequences have no ancestor relationship, hit-area specificity should decide their order."
					desiredBehavior="The smaller polygon is rendered above the broader polygon so it remains directly selectable."
					instructions="Click the amber square in the overlap. It should select Small unrelated, not Large unrelated."
				>
					<Interactive.Div
						name="Large unrelated"
						style={{
							position: 'absolute',
							left: 140,
							top: 170,
							width: 590,
							height: 480,
							backgroundColor: '#2563eb',
							borderRadius: 32,
							translate: '0px 0px',
						}}
					>
						<ShapeLabel>Large unrelated</ShapeLabel>
					</Interactive.Div>
					<Interactive.Div
						name="Small unrelated"
						style={{
							position: 'absolute',
							left: 420,
							top: 350,
							width: 230,
							height: 190,
							backgroundColor: '#d97706',
							borderRadius: 24,
							translate: '0px 0px',
						}}
					>
						<ShapeLabel>Small unrelated</ShapeLabel>
					</Interactive.Div>
				</CaseFrame>
			</Series.Sequence>

			<Series.Sequence
				durationInFrames={caseDurationInFrames}
				layout="none"
				name="05 - Equal-area parent and child"
			>
				<CaseFrame
					caseNumber={5}
					status="Baseline"
					title="An identical child must not hide its parent"
					summary="A full-size child and its parent can produce exactly the same canvas polygon."
					desiredBehavior="While the child is unselected, the equal-area parent is above it and remains reachable from the canvas."
					instructions="Click anywhere on the coincident rectangle. Parent should be selected first; Child remains reachable from the timeline."
				>
					<Interactive.Div
						name="Equal-area parent"
						style={{
							position: 'absolute',
							left: 190,
							top: 200,
							width: 500,
							height: 420,
							backgroundColor: '#2563eb',
							borderRadius: 30,
							translate: '0px 0px',
						}}
					>
						<Interactive.Div
							name="Equal-area child"
							style={{
								position: 'absolute',
								inset: 0,
								width: '100%',
								height: '100%',
								backgroundColor: '#e11d48',
								borderRadius: 30,
								translate: '0px 0px',
							}}
						>
							<ShapeLabel>Equal-area child</ShapeLabel>
						</Interactive.Div>
					</Interactive.Div>
				</CaseFrame>
			</Series.Sequence>

			<Series.Sequence
				durationInFrames={caseDurationInFrames}
				layout="none"
				name="06 - Selected equal-area child"
			>
				<CaseFrame
					caseNumber={6}
					status="Baseline"
					title="A selected identical child stays draggable"
					summary="The equal-area fallback must reverse once the child, or one of its properties, owns the selection."
					desiredBehavior="The selected child is raised above its parent so a direct canvas drag continues to operate on the child."
					instructions="Select Equal-area child in the timeline, then drag anywhere on the rectangle. Child should move and stay selected."
				>
					<Interactive.Div
						name="Equal-area parent"
						style={{
							position: 'absolute',
							left: 190,
							top: 200,
							width: 500,
							height: 420,
							backgroundColor: '#2563eb',
							borderRadius: 30,
							translate: '0px 0px',
						}}
					>
						<Interactive.Div
							name="Equal-area child"
							style={{
								position: 'absolute',
								inset: 0,
								width: '100%',
								height: '100%',
								backgroundColor: '#e11d48',
								borderRadius: 30,
								translate: '0px 0px',
							}}
						>
							<ShapeLabel>Select me in the timeline, then drag</ShapeLabel>
						</Interactive.Div>
					</Interactive.Div>
				</CaseFrame>
			</Series.Sequence>

			<Series.Sequence
				durationInFrames={caseDurationInFrames}
				layout="none"
				name="07 - Plain drag preserves selection"
			>
				<CaseFrame
					caseNumber={7}
					status="Partial"
					title="Plain drag preserves direct selection"
					summary="Pointer-down on an already-selected outline must not collapse or replace the current multi-selection."
					desiredBehavior="Dragging either directly selected item moves every eligible selected item and preserves the complete selection."
					instructions="Cmd/Ctrl-select both boxes in the timeline, then drag either box without a modifier. Both should move together."
				>
					<Interactive.Div
						name="Multi-select A"
						style={{
							position: 'absolute',
							left: 120,
							top: 250,
							width: 280,
							height: 260,
							backgroundColor: '#2563eb',
							borderRadius: 30,
							translate: '0px 0px',
						}}
					>
						<ShapeLabel>Selected A</ShapeLabel>
					</Interactive.Div>
					<Interactive.Div
						name="Multi-select B"
						style={{
							position: 'absolute',
							left: 480,
							top: 350,
							width: 280,
							height: 260,
							backgroundColor: '#7c3aed',
							borderRadius: 30,
							translate: '0px 0px',
						}}
					>
						<ShapeLabel>Selected B</ShapeLabel>
					</Interactive.Div>
				</CaseFrame>
			</Series.Sequence>

			<Series.Sequence
				durationInFrames={caseDurationInFrames}
				layout="none"
				name="08 - Drag threshold"
			>
				<CaseFrame
					caseNumber={8}
					status="Baseline"
					title="Small pointer movement is not a drag"
					summary="A click often includes a few pixels of hand movement and must not accidentally rewrite position values."
					desiredBehavior="Translation begins only after the pointer moves at least 4 pixels; smaller movement is treated as a click."
					instructions="Select the square, press and move by 1–3 px, then release. Its translate values should remain unchanged."
				>
					<Interactive.Div
						name="Four-pixel threshold target"
						style={{
							position: 'absolute',
							left: 240,
							top: 220,
							width: 400,
							height: 400,
							backgroundColor: '#0f766e',
							borderRadius: 42,
							translate: '0px 0px',
						}}
					>
						<ShapeLabel>Drag starts at 4 px</ShapeLabel>
					</Interactive.Div>
				</CaseFrame>
			</Series.Sequence>

			<Series.Sequence
				durationInFrames={caseDurationInFrames}
				layout="none"
				name="09 - Selection modifiers"
			>
				<CaseFrame
					caseNumber={9}
					status="Baseline"
					title="Selection modifiers never translate"
					summary="Shift and Cmd/Ctrl gestures are reserved for changing the selection set, even if the pointer moves."
					desiredBehavior="Modifier gestures add, remove, or range-select outlines without applying any translation."
					instructions="Select A, then Shift- or Cmd/Ctrl-click B with slight pointer movement. Selection may change; neither box should move."
				>
					<Interactive.Div
						name="Modifier target A"
						style={{
							position: 'absolute',
							left: 125,
							top: 260,
							width: 280,
							height: 280,
							backgroundColor: '#2563eb',
							borderRadius: 30,
							translate: '0px 0px',
						}}
					>
						<ShapeLabel>Target A</ShapeLabel>
					</Interactive.Div>
					<Interactive.Div
						name="Modifier target B"
						style={{
							position: 'absolute',
							left: 485,
							top: 330,
							width: 280,
							height: 280,
							backgroundColor: '#7c3aed',
							borderRadius: 30,
							translate: '0px 0px',
						}}
					>
						<ShapeLabel>Target B</ShapeLabel>
					</Interactive.Div>
				</CaseFrame>
			</Series.Sequence>

			<Series.Sequence
				durationInFrames={caseDurationInFrames}
				layout="none"
				name="10 - Every outline reachable"
			>
				<CaseFrame
					caseNumber={10}
					status="Gap"
					title="Every outline eventually becomes selectable"
					summary="Completely coincident outlines cannot all be reached through the canvas when only the top hit target responds."
					desiredBehavior="A deterministic click-through or cycling interaction must eventually select every outline at the pointer."
					instructions="Use the future cycling gesture repeatedly on the stack. All four named outlines should become selected in a predictable order."
				>
					<Interactive.Div
						name="Coincident outline A"
						style={{
							position: 'absolute',
							left: 190,
							top: 200,
							width: 500,
							height: 420,
							backgroundColor: '#2563eb',
							borderRadius: 30,
							translate: '0px 0px',
						}}
					>
						<ShapeLabel>4 coincident outlines</ShapeLabel>
					</Interactive.Div>
					<Interactive.Div
						name="Coincident outline B"
						style={{
							position: 'absolute',
							left: 190,
							top: 200,
							width: 500,
							height: 420,
							backgroundColor: 'rgba(225, 29, 72, 0.42)',
							borderRadius: 30,
							translate: '0px 0px',
						}}
					/>
					<Interactive.Div
						name="Coincident outline C"
						style={{
							position: 'absolute',
							left: 190,
							top: 200,
							width: 500,
							height: 420,
							backgroundColor: 'rgba(217, 119, 6, 0.36)',
							borderRadius: 30,
							translate: '0px 0px',
						}}
					/>
					<Interactive.Div
						name="Coincident outline D"
						style={{
							position: 'absolute',
							left: 190,
							top: 200,
							width: 500,
							height: 420,
							backgroundColor: 'rgba(124, 58, 237, 0.3)',
							borderRadius: 30,
							translate: '0px 0px',
						}}
					/>
				</CaseFrame>
			</Series.Sequence>

			<Series.Sequence
				durationInFrames={caseDurationInFrames}
				layout="none"
				name="11 - Equal-area siblings reachable"
			>
				<CaseFrame
					caseNumber={11}
					status="Gap"
					title="Equal-area siblings are all reachable"
					summary="Unrelated equal-area outlines retain render order, leaving the lower identical sibling inaccessible from the canvas."
					desiredBehavior="Both siblings can be selected from the canvas; source order must not permanently lock access to one of them."
					instructions="Cycle or click through the exact overlap. Both Equal sibling A and Equal sibling B should be reachable without using the timeline."
				>
					<Interactive.Div
						name="Equal sibling A"
						style={{
							position: 'absolute',
							left: 190,
							top: 200,
							width: 500,
							height: 420,
							backgroundColor: '#2563eb',
							borderRadius: 30,
							translate: '0px 0px',
						}}
					>
						<ShapeLabel>Sibling A + B</ShapeLabel>
					</Interactive.Div>
					<Interactive.Div
						name="Equal sibling B"
						style={{
							position: 'absolute',
							left: 190,
							top: 200,
							width: 500,
							height: 420,
							backgroundColor: 'rgba(225, 29, 72, 0.42)',
							borderRadius: 30,
							translate: '0px 0px',
						}}
					/>
				</CaseFrame>
			</Series.Sequence>

			<Series.Sequence
				durationInFrames={caseDurationInFrames}
				layout="none"
				name="12 - Selected outline wins"
			>
				<CaseFrame
					caseNumber={12}
					status="Gap"
					title="A selected outline always wins hit-testing"
					summary="Area and hierarchy ordering can currently put an unselected child or smaller unrelated outline above the selected target."
					desiredBehavior="Direct selection raises the selected outline for hit-testing so it remains draggable wherever its polygon is visible."
					instructions="Select Large selected target in the timeline, then drag from beneath the amber overlap. The large target should move and remain selected."
				>
					<Interactive.Div
						name="Large selected target"
						style={{
							position: 'absolute',
							left: 140,
							top: 170,
							width: 590,
							height: 480,
							backgroundColor: '#2563eb',
							borderRadius: 32,
							translate: '0px 0px',
						}}
					>
						<ShapeLabel>Select the large target first</ShapeLabel>
					</Interactive.Div>
					<Interactive.Div
						name="Smaller unselected overlap"
						style={{
							position: 'absolute',
							left: 410,
							top: 320,
							width: 250,
							height: 220,
							backgroundColor: '#d97706',
							borderRadius: 24,
							translate: '0px 0px',
						}}
					>
						<ShapeLabel>Unselected overlap</ShapeLabel>
					</Interactive.Div>
				</CaseFrame>
			</Series.Sequence>

			<Series.Sequence
				durationInFrames={caseDurationInFrames}
				layout="none"
				name="13 - Selected parent drag"
			>
				<CaseFrame
					caseNumber={13}
					status="Gap"
					title="A selected parent drags from covered areas"
					summary="A higher-priority child can receive the event inside a selected parent, replacing the selection instead of starting the drag."
					desiredBehavior="After selecting the parent, every point inside its polygon starts a parent drag—even where a child covers that point."
					instructions="Select Parent drag target in the timeline, then drag from the red child-covered area. Parent should move; Child should not become selected."
				>
					<Interactive.Div
						name="Parent drag target"
						style={{
							position: 'absolute',
							left: 150,
							top: 170,
							width: 580,
							height: 500,
							backgroundColor: '#2563eb',
							borderRadius: 32,
							translate: '0px 0px',
						}}
					>
						<ShapeLabel>Selected parent</ShapeLabel>
						<Interactive.Div
							name="Covering child"
							style={{
								position: 'absolute',
								left: 210,
								top: 110,
								width: 320,
								height: 290,
								backgroundColor: '#e11d48',
								borderRadius: 24,
								translate: '0px 0px',
							}}
						>
							<ShapeLabel>Drag parent from here</ShapeLabel>
						</Interactive.Div>
					</Interactive.Div>
				</CaseFrame>
			</Series.Sequence>

			<Series.Sequence
				durationInFrames={caseDurationInFrames}
				layout="none"
				name="14 - Property selection survives drag"
			>
				<CaseFrame
					caseNumber={14}
					status="Gap"
					title="Property selection survives outline dragging"
					summary="A selected property raises its containing sequence, but pointer-down on the polygon can promote selection to the whole sequence."
					desiredBehavior="Dragging the sequence outline preserves the property or keyframe selection while translating the owning sequence."
					instructions="Select a property of Property-selected sequence, then drag the purple rectangle. The property selection should remain active."
				>
					<Interactive.Div
						name="Property-selected sequence"
						style={{
							position: 'absolute',
							left: 190,
							top: 210,
							width: 500,
							height: 400,
							backgroundColor: '#7c3aed',
							borderRadius: 34,
							translate: '0px 0px',
						}}
					>
						<ShapeLabel>Select one of my properties, then drag me</ShapeLabel>
					</Interactive.Div>
				</CaseFrame>
			</Series.Sequence>

			<Series.Sequence
				durationInFrames={caseDurationInFrames}
				layout="none"
				name="15 - Handles above polygons"
			>
				<CaseFrame
					caseNumber={15}
					status="Partial"
					title="All selected editing handles stay on top"
					summary="Transform-origin and UV handles are already globally raised, but scale and rotation controls can be covered by a later polygon."
					desiredBehavior="Every visible handle belonging to a selected outline is rendered and hit-tested above every unselected polygon."
					instructions="Select Editable transform target and activate its transform controls. The amber polygon must not block any handle near the top-right corner."
				>
					<Interactive.Div
						name="Editable transform target"
						cropBottom={0}
						cropLeft={0}
						cropRight={0}
						cropTop={0}
						style={{
							position: 'absolute',
							left: 165,
							top: 230,
							width: 430,
							height: 360,
							backgroundColor: '#7c3aed',
							borderRadius: 34,
							rotate: '8deg',
							scale: 1,
							transformOrigin: '50% 50%',
							translate: '0px 0px',
						}}
					>
						<ShapeLabel>Selected transform target</ShapeLabel>
					</Interactive.Div>
					<Interactive.Div
						name="Handle-covering polygon"
						style={{
							position: 'absolute',
							left: 555,
							top: 170,
							width: 210,
							height: 230,
							backgroundColor: '#d97706',
							borderRadius: 24,
							translate: '0px 0px',
						}}
					>
						<ShapeLabel>Must stay below handles</ShapeLabel>
					</Interactive.Div>
				</CaseFrame>
			</Series.Sequence>
		</Series>
	);
};
