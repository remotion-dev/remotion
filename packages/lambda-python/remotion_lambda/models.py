# pylint: disable=too-few-public-methods, missing-module-docstring, broad-exception-caught,invalid-name

from typing import Optional, List, Dict
from dataclasses import dataclass, field
from .version import VERSION


# pylint: disable=too-many-instance-attributes
@dataclass
class RenderParams:
    """
    Parameters for video rendering.
    """
    data: Optional[List] = None
    bucket_name: Optional[str] = None
    region: Optional[str] = None
    out_name: Optional[str] = None
    composition: str = ""
    serve_url: str = ""
    frames_per_lambda: Optional[int] = None
    private_serialized_input_props: Optional[Dict] = None
    codec: str = 'h264'
    version: str = ""
    image_format: str = 'jpeg'
    crf: Optional[int] = None
    env_variables: Optional[Dict] = None
    max_retries: int = 1
    jpeg_quality: int = 80
    privacy: str = 'public'
    color_space: str = 'default'
    log_level: str = 'info'
    frame_range: Optional[str] = None
    timeout_in_milliseconds: Optional[int] = 30000
    chromium_options: Optional[Dict] = None
    scale: Optional[int] = 1
    every_nth_frame: Optional[int] = 1
    number_of_gif_loops: Optional[int] = 0
    concurrency_per_lambda: Optional[int] = 1
    download_behavior: Dict = field(default_factory=lambda: {
                                    'type': 'play-in-browser'})
    muted: bool = False
    overwrite: bool = False
    audio_bitrate: Optional[int] = None
    video_bitrate: Optional[int] = None
    webhook: Optional[str] = None
    force_height: Optional[int] = None
    offthreadvideo_cache_size_in_bytes: Optional[int] = None
    force_width: Optional[int] = None
    audio_codec: Optional[str] = None
    renderer_function_name: Optional[str] = None
    pro_res_profile: Optional[str] = None
    x264_preset: Optional[str] = None
    pixel_format: Optional[str] = None
    delete_after: Optional[str] = None

    def serialize_params(self) -> Dict:
        """
        Convert instance attributes to a dictionary for serialization.
        """
        parameters = {
            'rendererFunctionName': self.renderer_function_name,
            'framesPerLambda': self.frames_per_lambda,
            'composition': self.composition,
            'serveUrl': self.serve_url,
            'inputProps': self.private_serialized_input_props,
            'codec': self.codec,
            'imageFormat': self.image_format,
            'maxRetries': self.max_retries,
            'jpegQuality': self.jpeg_quality,
            'envVariables': self.env_variables,
            'privacy': self.privacy,
            'colorSpace': self.color_space,
            'logLevel': self.log_level,
            'frameRange': self.frame_range,
            'outName': self.out_name,
            'timeoutInMilliseconds': self.timeout_in_milliseconds,
            'chromiumOptions': self.chromium_options if self.chromium_options is not None else {},
            'scale': self.scale,
            'everyNthFrame': self.every_nth_frame,
            'numberOfGifLoops': self.number_of_gif_loops,
            'concurrencyPerLambda': self.concurrency_per_lambda,
            'downloadBehavior': self.download_behavior,
            'muted': self.muted,
            'version': VERSION,
            'overwrite': self.overwrite,
            'audioBitrate': self.audio_bitrate,
            'videoBitrate': self.video_bitrate,
            'webhook': self.webhook,
            'forceHeight': self.force_height,
            'offthreadVideoCacheSizeInBytes': self.offthreadvideo_cache_size_in_bytes,
            'forceWidth': self.force_width,
            'bucketName': self.bucket_name,
            'audioCodec': self.audio_codec,
            'x264Preset': self.x264_preset,
            'deleteAfter': self.delete_after,
            'type': 'start'
        }

        if self.crf is not None:
            parameters['crf'] = self.crf

        if self.env_variables is None:
            parameters['envVariables'] = {}

        if self.pixel_format is not None:
            parameters['pixelFormat'] = self.pixel_format

        if self.pro_res_profile is not None:
            parameters['proResProfile'] = self.pro_res_profile

        if self.x264_preset is not None:
            parameters['x264Preset'] = self.x264_preset

        return parameters


# pylint: disable=too-many-instance-attributes
class RenderResponse:
    """
    Response data after rendering.
    """

    def __init__(self, bucketName, renderId):
        self.bucketName = bucketName
        self.renderId = renderId


@dataclass
class RenderProgressParams:
    """
    Parameters for checking the progress of video rendering.
    """

    render_id: str
    bucket_name: str
    function_name: str
    region: str

    def serialize_params(self) -> Dict:
        """
        Convert instance attributes to a dictionary for serialization.
        """
        parameters = {
            'renderId': self.render_id,
            'bucketName': self.bucket_name,
            'type': 'status',
            "version": VERSION,
            "s3OutputProvider": None,
        }
        return parameters


class RenderProgress:
    """
    Progress of video rendering.
    """

    def __init__(self):
        self.overallProgress = float()
        self.chunks = int()
        self.done = bool()
        self.encodingStatus = None
        self.costs = None
        self.renderId = str()
        self.renderMetadata = None
        self.outputFile = None
        self.outKey = None
        self.timeToFinish = None
        self.errors = []
        self.fatalErrorEncountered = bool()
        self.currentTime = int()
        self.renderSize = int()
        self.outputSizeInBytes = None
        self.lambdasInvoked = int()
        self.framesRendered = None
