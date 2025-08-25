package lambda_go_sdk

type RemotionOptions struct {
	ServeUrl                       string                 `json:"serveUrl" validate:"required"`
	FunctionName                   string                 `json:"functionName" validate:"required"`
	RendererFunctionName           string                 `json:"rendererFunctionName"`
	Region                         string                 `json:"region" validate:"required"`
	InputProps                     interface{}            `json:"inputProps"`
	Composition                    string                 `json:"composition" validate:"required"`
	Codec                          string                 `json:"codec"`
	ImageFormat                    string                 `json:"imageFormat"`
	Crf                            int                    `json:"crf"`
	EnvVariables                   interface{}            `json:"envVariables"`
	Metadata                       interface{}            `json:"metadata"`
	JpegQuality                    int                    `json:"jpegQuality"`
	MaxRetries                     int                    `json:"maxRetries"`
	Privacy                        string                 `json:"privacy"`
	ColorSpace                     string                 `json:"colorSpace"`
	LogLevel                       string                 `json:"logLevel"`
	FrameRange                     interface{}            `json:"frameRange"`
	OutName                        interface{}            `json:"outName"`
	TimeoutInMilliseconds          int                    `json:"timeoutInMilliseconds"`
	ChromiumOptions                interface{}            `json:"chromiumOptions"`
	Scale                          int                    `json:"scale"`
	EveryNthFrame                  int                    `json:"everyNthFrame"`
	NumberOfGifLoops               int                    `json:"numberOfGifLoops"`
	ConcurrencyPerLambda           int                    `json:"concurrencyPerLambda"`
	Concurrency                    *int                   `json:"concurrency"`
	DownloadBehavior               map[string]interface{} `json:"downloadBehavior"`
	Muted                          bool                   `json:"muted"`
	PreferLossless                 bool                   `json:"preferLossless"`
	Overwrite                      bool                   `json:"overwrite"`
	ForcePathStyle                 bool                   `json:"forcePathStyle"`
	AudioBitrate                   interface{}            `json:"audioBitrate"`
	VideoBitrate                   interface{}            `json:"videoBitrate"`
	EncodingBufferSize             interface{}            `json:"encodingBufferSize"`
	EncodingMaxRate                interface{}            `json:"encodingMaxRate"`
	Webhook                        interface{}            `json:"webhook"`
	ForceHeight                    interface{}            `json:"forceHeight"`
	OffthreadVideoCacheSizeInBytes interface{}            `json:"offthreadVideoCacheSizeInBytes"`
	OffthreadVideoThreads          interface{}            `json:"offthreadVideoThreads"`
	ForceWidth                     interface{}            `json:"forceWidth"`
	ApiKey                         interface{}            `json:"apiKey"`
	BucketName                     interface{}            `json:"bucketName"`
	AudioCodec                     interface{}            `json:"audioCodec"`
	StorageClass                   interface{}            `json:"storageClass"`
	ForceBucketName                string                 `json:"forceBucketName"`
	Gl                             string                 `json:"gl"`
	X264Preset                     interface{}            `json:"x264Preset"`
	DeleteAfter                    *string                `json:"deleteAfter"`
}

type renderInternalOptions struct {
	RendererFunctionName           *string                `json:"rendererFunctionName"`
	FramesPerLambda                *string                `json:"framesPerLambda"`
	Composition                    string                 `json:"composition" validate:"required"`
	ServeUrl                       string                 `json:"serveUrl" validate:"required"`
	InputProps                     interface{}            `json:"inputProps"`
	Type                           string                 `json:"type,omitempty"`
	Codec                          string                 `json:"codec"`
	ProResProfile                  interface{}            `json:"proResProfile"`
	PixelFormat                    interface{}            `json:"pixelFormat"`
	ImageFormat                    string                 `json:"imageFormat"`
	Crf                            interface{}            `json:"crf"`
	EnvVariables                   interface{}            `json:"envVariables,omitempty"`
	Metadata                       interface{}            `json:"metadata,omitempty"`
	JpegQuality                    int                    `json:"jpegQuality"`
	MaxRetries                     int                    `json:"maxRetries"`
	Privacy                        string                 `json:"privacy"`
	ColorSpace                     interface{}            `json:"colorSpace"`
	LogLevel                       string                 `json:"logLevel"`
	FrameRange                     interface{}            `json:"frameRange"`
	OutName                        interface{}            `json:"outName"`
	TimeoutInMilliseconds          int                    `json:"timeoutInMilliseconds"`
	ChromiumOptions                interface{}            `json:"chromiumOptions"`
	Scale                          int                    `json:"scale"`
	EveryNthFrame                  int                    `json:"everyNthFrame"`
	NumberOfGifLoops               int                    `json:"numberOfGifLoops"`
	ConcurrencyPerLambda           int                    `json:"concurrencyPerLambda"`
	Concurrency                    *int                   `json:"concurrency"`
	DownloadBehavior               map[string]interface{} `json:"downloadBehavior"`
	Muted                          bool                   `json:"muted"`
	PreferLossless                 bool                   `json:"preferLossless"`
	ForcePathStyle                 bool                   `json:"forcePathStyle"`
	Version                        string                 `json:"version"`
	Overwrite                      bool                   `json:"overwrite"`
	AudioBitrate                   interface{}            `json:"audioBitrate"`
	VideoBitrate                   interface{}            `json:"videoBitrate"`
	EncodingBufferSize             interface{}            `json:"encodingBufferSize"`
	EncodingMaxRate                interface{}            `json:"encodingMaxRate"`
	Webhook                        interface{}            `json:"webhook"`
	OffthreadVideoCacheSizeInBytes interface{}            `json:"offthreadVideoCacheSizeInBytes"`
	OffthreadVideoThreads          interface{}            `json:"offthreadVideoThreads"`
	ForceHeight                    interface{}            `json:"forceHeight"`
	ForceWidth                     interface{}            `json:"forceWidth"`
	ApiKey                         interface{}            `json:"apiKey"`
	BucketName                     interface{}            `json:"bucketName"`
	AudioCodec                     interface{}            `json:"audioCodec"`
	StorageClass                   interface{}            `json:"storageClass"`
	ForceBucketName                string                 `json:"forceBucketName,omitempty"`
	Gl                             *string                `json:"gl,omitempty"`
	X264Preset                     interface{}            `json:"x264Preset"`
	DeleteAfter                    *string                `json:"deleteAfter"`
}

type RawInvokeResponse struct {
	Body string `json:"body"`
	Type string `json:"type"`
}

type RemotionRenderResponse struct {
	BucketName string `json:"bucketName"`
	RenderId   string `json:"renderId"`
}

type RenderConfig struct {
	RenderId         string      `json:"renderId" validate:"required"`
	BucketName       string      `json:"bucketName" validate:"required"`
	LogLevel         string      `json:"logLevel"`
	FunctionName     string      `json:"functionName" validate:"required"`
	Region           string      `json:"region" validate:"required"`
	DeleteAfter      *string     `json:"deleteAfter"`
	S3OutputProvider interface{} `json:"s3OutputProvider"`
	ForcePathStyle   bool        `json:"forcePathStyle"`
}

type renderProgressInternalConfig struct {
	RenderId   string `json:"renderId" validate:"required"`
	BucketName string `json:"bucketName" validate:"required"`
	Type       string `json:"type" validate:"required"`
	Version    string `json:"version" validate:"required"`
	LogLevel   string `json:"logLevel" validate:"required"`
}

type FileNameAndSize struct {
	Name string `json:"name"`
	Size int    `json:"size"`
}

type TmpDir struct {
	Files []FileNameAndSize `json:"files"`
	Total int               `json:"total"`
}

type FunctionErrorInfo struct {
	Type          string  `json:"type"`
	Message       string  `json:"message"`
	Name          string  `json:"name"`
	Stack         string  `json:"stack"`
	Frame         *int    `json:"frame,omitempty"`
	Chunk         *int    `json:"chunk,omitempty"`
	IsFatal       bool    `json:"isFatal"`
	Attempt       int     `json:"attempt"`
	WillRetry     bool    `json:"willRetry"`
	TotalAttempts int     `json:"totalAttempts"`
	TmpDir        *TmpDir `json:"tmpDir,omitempty"`
}

type RenderProgress struct {
	OverallProgress          float64             `json:"overallProgress"`
	Chunks                   int                 `json:"chunks"`
	Done                     bool                `json:"done"`
	EncodingStatus           *EncodingStatus     `json:"encodingStatus,omitempty"`
	Costs                    *Costs              `json:"costs,omitempty"`
	RenderId                 string              `json:"renderId"`
	RenderMetadata           *RenderMetadata     `json:"renderMetadata,omitempty"`
	OutputFile               *string             `json:"outputFile,omitempty"`
	OutKey                   *string             `json:"outKey,omitempty"`
	TimeToFinish             *int                `json:"timeToFinish,omitempty"`
	Errors                   []FunctionErrorInfo `json:"errors,omitempty"`
	FatalErrorEncountered    bool                `json:"fatalErrorEncountered"`
	CurrentTime              int64               `json:"currentTime"`
	RenderSize               int64               `json:"renderSize"`
	OutputSizeInBytes        *int64              `json:"outputSizeInBytes,omitempty"`
	LambdasInvoked           int                 `json:"lambdasInvoked"`
	FramesRendered           *int                `json:"framesRendered,omitempty"`
	MostExpensiveFrameRanges []FrameRange        `json:"mostExpensiveFrameRanges,omitempty"`
}

type EncodingStatus struct {
	FramesEncoded int `json:"framesEncoded"`
}

type Costs struct {
	AccruedSoFar float64 `json:"accruedSoFar"`
	Currency     string  `json:"currency"`
	DisplayCost  string  `json:"displayCost"`
	Disclaimer   string  `json:"disclaimer"`
}

type RenderMetadata struct {
	TotalFrames                      int    `json:"totalFrames"`
	StartedDate                      int64  `json:"startedDate"`
	TotalChunks                      int    `json:"totalChunks"`
	EstimatedTotalLambdaInvokations  int    `json:"estimatedTotalLambdaInvokations"`
	EstimatedRenderLambdaInvokations int    `json:"estimatedRenderLambdaInvokations"`
	CompositionId                    string `json:"compositionId"`
	Codec                            string `json:"codec"`
	Bucket                           string `json:"bucket"`
}

type FrameRange struct {
	Chunk              int    `json:"chunk"`
	TimeInMilliseconds int    `json:"timeInMilliseconds"`
	FrameRange         [2]int `json:"frameRange"`
}

type PayloadData struct {
	Type    string `json:"type"`
	Payload string `json:"payload"`
}
