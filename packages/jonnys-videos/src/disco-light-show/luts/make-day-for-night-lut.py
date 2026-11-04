import cv2, numpy as np, glob
def lab_stats(files):
    px = []
    for f in files:
        im = cv2.imread(f).astype(np.float32) / 255.0
        lab = cv2.cvtColor(im, cv2.COLOR_BGR2LAB).reshape(-1, 3)
        px.append(lab)
    px = np.concatenate(px)
    return px.mean(0), px.std(0)
ms, ss = lab_stats(sorted(glob.glob('src_*.png')))
mt, st = lab_stats([f for f in sorted(glob.glob('tgt_*.png')) if any(t in f for t in ['2150','2175','2340','2390','2510','2760','1750','1780'])])
print('source mean/std', ms.round(1), ss.round(1)); print('target mean/std', mt.round(1), st.round(1))
N = 17; STRENGTH = 0.5
g = np.linspace(0, 1, N)
# .cube order: red changes fastest, then green, then blue
b, gg, r = np.meshgrid(g, g, g, indexing='ij')
rgb = np.stack([r, gg, b], -1).reshape(-1, 3).astype(np.float32)
lab = cv2.cvtColor(rgb[:, ::-1].reshape(-1, 1, 3), cv2.COLOR_BGR2LAB).reshape(-1, 3)
ratio = st / ss
ratio[1:] = np.minimum(ratio[1:], 0.85)   # never stretch chroma (avoids blotchy colour)
shift = mt - ms
shift[1:] *= 0.5                          # move the colour cast most of the way
out = (lab - ms) * ratio + ms + shift
out = lab + (out - lab) * STRENGTH
out[:, 0] = np.clip(out[:, 0], 0, 100)
res = cv2.cvtColor(out.reshape(-1, 1, 3).astype(np.float32), cv2.COLOR_LAB2BGR).reshape(-1, 3)[:, ::-1]
res = np.clip(res, 0, 1)
lines = ['TITLE "Day for night, subtle (party match)"', f'LUT_3D_SIZE {N}', 'DOMAIN_MIN 0.0 0.0 0.0', 'DOMAIN_MAX 1.0 1.0 1.0']
lines += [f'{a:.5f} {c:.5f} {d:.5f}' for a, c, d in res]
cube = '\n'.join(lines) + '\n'
open('day-for-night.cube', 'w').write(cube)
ts = ('// Day-for-night LUT: Lab colour transfer from the daytime setup footage\n'
      '// (IMG_7301) to the night party footage (IMG_7933), baked as a 17^3 .cube.\n'
      '// The source .cube sits next to this file.\n'
      'export const DAY_FOR_NIGHT_LUT = `' + cube + '`;\n')
open('day-for-night-lut.ts', 'w').write(ts)
