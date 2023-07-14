from typing import Optional, List, Dict
from dataclasses import dataclass, field
from version import VERSION


@dataclass
class RenderParams:
    data: Optional[List] = None
    bucketName: Optional[str] = None
    region: Optional[str] = None
    outName: Optional[str] = None
    composition: str = ""
    serveUrl: str = ""
    framesPerLambda: Optional[int] = None
    inputProps: Optional[Dict] = None
    codec: str = 'h264'
    version: str = ""
    imageFormat: str = 'jpeg'
    crf: Optional[int] = None
    envVariables: Optional[List] = None
    quality: Optional[int] = None
    maxRetries: int = 1
    privacy: str = 'private'
    logLevel: str = 'info'
    frameRange: Optional[str] = None
    timeoutInMilliseconds: Optional[int] = 30000
    chromiumOptions: Optional[Dict] = None
    scale: Optional[int] = 1
    everyNthFrame: Optional[int] = 1
    numberOfGifLoops: Optional[int] = 0
    concurrencyPerLambda: Optional[int] = 1
    downloadBehavior: Dict = field(default_factory=lambda: {
                                   'type': 'play-in-browser'})
    muted: bool = False
    overwrite: bool = False
    audioBitrate: Optional[int] = None
    videoBitrate: Optional[int] = None
    webhook: Optional[str] = None
    forceHeight: Optional[int] = None
    forceWidth: Optional[int] = None
    audioCodec: Optional[str] = None
    rendererFunctionName: Optional[str] = None
    proResProfile: Optional[str] = None
    pixelFormat: Optional[str] = None

    def serializeParams(self) -> Dict:
        parameters = {
            'rendererFunctionName': self.rendererFunctionName,
            'framesPerLambda': self.framesPerLambda,
            'composition': self.composition,
            'serveUrl': self.serveUrl,
            'inputProps': self.inputProps,
            'codec': self.codec,
            'imageFormat': self.imageFormat,
            'maxRetries': self.maxRetries,
            'privacy': self.privacy,
            'logLevel': self.logLevel,
            'frameRange': self.frameRange,
            'outName': self.outName,
            'timeoutInMilliseconds': self.timeoutInMilliseconds,
            'chromiumOptions': self.chromiumOptions if self.chromiumOptions is not None else {},
            'scale': self.scale,
            'everyNthFrame': self.everyNthFrame,
            'numberOfGifLoops': self.numberOfGifLoops,
            'concurrencyPerLambda': self.concurrencyPerLambda,
            'downloadBehavior': self.downloadBehavior,
            'muted': self.muted,
            'version': VERSION,
            'overwrite': self.overwrite,
            'audioBitrate': self.audioBitrate,
            'videoBitrate': self.videoBitrate,
            'webhook': self.webhook,
            'forceHeight': self.forceHeight,
            'forceWidth': self.forceWidth,
            'bucketName': self.bucketName,
            'audioCodec': self.audioCodec,
            'type': 'start'
        }

        if self.crf is not None:
            parameters['crf'] = self.crf

        if self.envVariables is not None:
            parameters['envVariables'] = self.envVariables

        if self.pixelFormat is not None:
            parameters['pixelFormat'] = self.pixelFormat

        if self.proResProfile is not None:
            parameters['proResProfile'] = self.proResProfile

        if self.quality is not None:
            parameters['quality'] = self.quality

        return parameters


class RenderResponse(object):
    def __init__(self, bucketName, renderId):
        self.bucketName = bucketName
        self.renderId = renderId


@dataclass
class RenderProgressParams:
    renderId: str
    bucketName: str
    functionName: str
    region: str

    def serializeParams(self) -> Dict:
        parameters = {
            'renderId': self.renderId,
            'bucketName': self.bucketName,
            'type': 'status',
            "version": VERSION,
            "s3OutputProvider": None
        }
        return parameters


class RenderProgress:
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
        self.mostExpensiveFrameRanges = []


class EncodingStatus:
    def __init__(self):
        self.property1 = None
        self.property2 = None
        # Add additional properties as needed


class Costs:
    def __init__(self):
        self.property1 = None
        self.property2 = None
        # Add additional properties as needed


class RenderMetadata:
    def __init__(self):
        self.property1 = None
        self.property2 = None
        # Add additional properties as needed


class FrameRange:
    def __init__(self):
        self.property1 = None
        self.property2 = None
        # Add additional properties as needed
