import type { SyntheticEvent } from 'react';
declare const useClickPreventionOnDoubleClick: (onClick: (e: SyntheticEvent) => void, onDoubleClick: () => void, doubleClickToFullscreen: boolean) => [(e: SyntheticEvent) => void, () => void];
export { useClickPreventionOnDoubleClick };
