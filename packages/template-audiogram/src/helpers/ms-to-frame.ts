export const FPS = 30;

export const msToFrame = (time: number) => {
  return Math.floor((time / 1000) * FPS);
};
