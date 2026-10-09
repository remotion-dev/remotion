from pathlib import Path
import shutil
import subprocess

folder = Path(__file__).parent / 'fixtures'
folder.mkdir(exist_ok=True)
filters = ['drawbox=x=0:y=0:w=256:h=32:color=black:t=fill']
for bit in range(8):
    filters.append(f"drawbox=x={bit*32}:y=0:w=32:h=32:color=white:t=fill:enable='eq(mod(floor(n/{2**bit}),2),1)'")
subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-f', 'lavfi', '-i', 'testsrc2=size=1920x1080:rate=30', '-t', '60', '-vf', ','.join(filters), '-c:v', 'libx264', '-preset', 'fast', '-crf', '20', '-g', '60', '-keyint_min', '60', '-sc_threshold', '0', '-bf', '2', '-pix_fmt', 'yuv420p', str(folder / 'source-60s.mp4')], check=True)
shutil.copyfile(folder / 'source-60s.mp4', folder / 'second-60s.mp4')
