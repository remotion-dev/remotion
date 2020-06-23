export const useFrame = () => {
  return new URLSearchParams(window.location.search).get("frame");
};
