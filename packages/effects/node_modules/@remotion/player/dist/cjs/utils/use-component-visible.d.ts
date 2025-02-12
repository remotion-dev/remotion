export default function useComponentVisible(initialIsVisible: boolean): {
    ref: import("react").RefObject<HTMLDivElement | null>;
    isComponentVisible: boolean;
    setIsComponentVisible: import("react").Dispatch<import("react").SetStateAction<boolean>>;
};
