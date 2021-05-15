import { Canvas, render, unmountComponentAtNode } from '@react-three/fiber';
import React from 'react';
import ReactDOM from 'react-dom';
import { Internals } from 'remotion';
import { RemotionThreeContext, RemotionThreeContextType } from './ThreeContext';

const block: React.CSSProperties = {
	display: 'block',
};

export type ThreeCanvasProps = React.ComponentProps<typeof Canvas>;

export const ThreeCanvas = ({
	children,
	tabIndex,
	resize,
	id,
	style,
	className,
	events,
	...rest
}: ThreeCanvasProps) => {
	const wrapperRef = React.useRef<HTMLDivElement>(null);
	const canvasRef = React.useRef<HTMLCanvasElement>(null);

	const remotionContexts = Internals.useRemotionContexts();

	const [
		threeDomNodesWrapper,
		remotionThreeContext,
	] = useCreateRemotionThreeContext();

	const width = wrapperRef.current?.clientWidth;
	const height = wrapperRef.current?.clientHeight;
	const size = React.useMemo(
		() => (!width || !height ? undefined : { width, height }),
		[width, height]
	);

	React.useLayoutEffect(() => {
		if (!canvasRef.current) {
			return;
		}
		const threeFiberContent = (
			<RemotionThreeContext.Provider value={remotionThreeContext}>
				<Internals.RemotionContextProvider contexts={remotionContexts}>
					{children}
				</Internals.RemotionContextProvider>
			</RemotionThreeContext.Provider>
		);
		render(threeFiberContent, canvasRef.current, {
			frameloop: 'demand',
			orthographic: true,
			...rest,
			size,
		});
	});

	React.useEffect(() => {
		const canvas = canvasRef.current as HTMLCanvasElement;
		return () => {
			unmountComponentAtNode(canvas);
		};
	}, []);

	return (
		<div
			ref={wrapperRef}
			id={id}
			className={className}
			tabIndex={tabIndex}
			style={{
				position: 'relative',
				width: '100%',
				height: '100%',
				overflow: 'hidden',
				...style,
			}}
		>
			<canvas ref={canvasRef} style={block} />
			{threeDomNodesWrapper}
		</div>
	);
};

function useCreateRemotionThreeContext() {
	const isMountedRef = React.useRef(true);
	React.useEffect(
		() => () => {
			isMountedRef.current = false;
		},
		[]
	);

	const portalRef = React.useRef<HTMLDivElement>(null);

	const remotionThreeContext = React.useState<RemotionThreeContextType>(() => ({
		useDomNode: (node) => {
			const _remotionContexts = Internals.useRemotionContexts();

			const [containerNode] = React.useState(() =>
				document.createElement('div')
			);
			React.useEffect(() => {
				if (!portalRef.current) {
					return;
				}
				(portalRef.current as HTMLDivElement).appendChild(containerNode);
				return () => {
					ReactDOM.unmountComponentAtNode(containerNode);
					containerNode.remove();
				};
			}, [containerNode]);

			React.useEffect(() => {
				// Updating threeDomNodes has to happen outside the react-three render loop, so use a timeout
				setTimeout(() => {
					if (isMountedRef.current) {
						const finalNode = (
							<Internals.RemotionContextProvider contexts={_remotionContexts}>
								{node}
							</Internals.RemotionContextProvider>
						);
						ReactDOM.render(finalNode, containerNode);
					}
				});
			});
		},
	}))[0];

	const threeDomNodesWrapper = (
		<div
			ref={portalRef}
			style={{
				position: 'absolute',
				top: 0,
				left: 0,
				overflow: 'hidden',
				visibility: 'hidden',
			}}
		/>
	);
	return [threeDomNodesWrapper, remotionThreeContext] as const;
}

// Alternative implementation which does not directly call ReactDOM.render.
// It causes huge lags right now, however it would allow using all contexts present in the canvas scope
// Should be evaluated again

// function useCreateRemotionThreeContext() {
//     const isMountedRef = React.useRef(true);
//     React.useEffect(() => () => {
//         isMountedRef.current = false;
//     }, []);

//     const [threeDomNodes, setThreeDomNodes] = React.useState<React.ReactElement[]>([]);

//     const remotionThreeContext = React.useState<RemotionThreeContextType>(() => ({
//         useDomNode: node => {
//             const _remotionContexts = Internals.useRemotionContexts();

//             // Generate static, unique key
//             const key = React.useState(() => String(Math.random()))[0];

//             React.useEffect(() => {
//                 // Updating threeDomNodes has to happen outside the react-three render loop, so use a timeout
//                 setTimeout(() => {
//                     // Only perform update, if the ThreeCanvas is still mounted
//                     if (isMountedRef.current) {
//                         const finalNode = (
//                             <Internals.RemotionContextProvider key={key} contexts={_remotionContexts}>
//                                 {node}
//                             </Internals.RemotionContextProvider>
//                         );
//                         // Append to nodes array
//                         setThreeDomNodes(sn => sn.filter(x => x.key !== key).concat(finalNode));
//                     }
//                 });
//             });

//             React.useEffect(() => () => {
//                 setTimeout(() => {
//                     // Only perform unmount, if the ThreeCanvas is still mounted
//                     if (isMountedRef.current) {
//                         // Remove from nodes array
//                         setThreeDomNodes(sn => sn.filter(x => x.key !== key));
//                     }
//                 });
//             }, []); // eslint-disable-line react-hooks/exhaustive-deps
//         }
//     }))[0];

//     const threeDomNodesWrapper = (
//         <div
//             style={{
//                 position: 'absolute',
//                 top: 0,
//                 left: 0,
//                 overflow: 'hidden',
//                 visibility: 'hidden'
//             }}
//         >
//             {threeDomNodes}
//         </div>
//     );
//     return [threeDomNodesWrapper, remotionThreeContext] as const;
// }
