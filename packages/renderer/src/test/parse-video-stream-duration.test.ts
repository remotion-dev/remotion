import {expect, test} from 'vitest';
import {parseVideoStreamDuration} from '../assets/get-video-stream-duration';

test('Parse video stream duration', () => {
	const result = parseVideoStreamDuration(
		`
[STREAM]
index=0
codec_name=vp9
codec_long_name=Google VP9
profile=Profile 0
codec_type=video
codec_tag_string=[0][0][0][0]
codec_tag=0x0000
width=1920
height=1080
coded_width=1920
coded_height=1080
closed_captions=0
film_grain=0
has_b_frames=0
sample_aspect_ratio=1:1
display_aspect_ratio=16:9
pix_fmt=yuv420p
level=-99
color_range=tv
color_space=unknown
color_transfer=unknown
color_primaries=unknown
chroma_location=left
field_order=progressive
refs=1
id=N/A
r_frame_rate=2499/100
avg_frame_rate=2499/100
time_base=1/1000
start_pts=6
start_time=0.006000
duration_ts=N/A
duration=N/A
bit_rate=N/A
max_bit_rate=N/A
bits_per_raw_sample=N/A
nb_frames=N/A
nb_read_frames=N/A
nb_read_packets=N/A
DISPOSITION:default=1
DISPOSITION:dub=0
DISPOSITION:original=0
DISPOSITION:comment=0
DISPOSITION:lyrics=0
DISPOSITION:karaoke=0
DISPOSITION:forced=0
DISPOSITION:hearing_impaired=0
DISPOSITION:visual_impaired=0
DISPOSITION:clean_effects=0
DISPOSITION:attached_pic=0
DISPOSITION:timed_thumbnails=0
DISPOSITION:captions=0
DISPOSITION:descriptions=0
DISPOSITION:metadata=0
DISPOSITION:dependent=0
DISPOSITION:still_image=0
TAG:ALPHA_MODE=1
TAG:ENCODER=Lavc58.134.100 libvpx-vp9
TAG:DURATION=01:20:05.008000000
[/STREAM]  
  `.trim()
	);
	expect(result).toEqual({
		fps: 24.99,
		duration: 4805.008,
	});
});

test('Parse video stream duration 2', () => {
	const result = parseVideoStreamDuration(
		`
[STREAM]
r_frame_rate=2499/100
duration=5.0080000
[/STREAM]  
  `.trim()
	);
	expect(result).toEqual({
		fps: 24.99,
		duration: 5.008,
	});
});
