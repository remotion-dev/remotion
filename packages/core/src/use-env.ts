export const useEnv = () => {
    return typeof window.remotion_env === 'object' ? {...window.remotion_env} : {};
};