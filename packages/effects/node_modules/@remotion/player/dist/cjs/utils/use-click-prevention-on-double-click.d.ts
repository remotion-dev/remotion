import type { SyntheticEvent } from 'react';
type ReturnVal = {
    handlePointerDown: (e: SyntheticEvent<Element, PointerEvent> | PointerEvent) => void;
    handleDoubleClick: () => void;
};
declare const useClickPreventionOnDoubleClick: (onClick: (e: PointerEvent | SyntheticEvent<Element, PointerEvent>) => void, onDoubleClick: () => void, doubleClickToFullscreen: boolean) => ReturnVal;
export { useClickPreventionOnDoubleClick };
