package lambda_go_sdk

type RemotionOptions struct {
	ServeUrl              string                 `json:"serveUrl" validate:"required"`
	FunctionName          string                 `json:"functionName" validate:"required"`
	RendererFunctionName  string                 `json:"rendererFunctionName"`
	Region                string                 `json:"region" validate:"required"`
	InputProps            interface{}            `json:"inputProps"`
	Composition           string                 `json:"composition" validate:"required"`
	Codec                 string                 `json:"codec"`
	ImageFormat           string                 `json:"imageFormat"`
	Crf                   int                    `json:"crf"`
	EnvVariables          interface{}            `json:"envVariables"`
	Quality               int                    `json:"quality"`
	MaxRetries            int                    `json:"maxRetries"`
	Privacy               string                 `json:"privacy"`
	LogLevel              string                 `json:"logLevel"`
	FrameRange            interface{}            `json:"frameRange"`
	OutName               interface{}            `json:"outName"`
	TimeoutInMilliseconds int                    `json:"timeoutInMilliseconds"`
	ChromiumOptions       interface{}            `json:"chromiumOptions"`
	Scale                 int                    `json:"scale"`
	EveryNthFrame         int                    `json:"everyNthFrame"`
	NumberOfGifLoops      int                    `json:"numberOfGifLoops"`
	ConcurrencyPerLambda  int                    `json:"concurrencyPerLambda"`
	DownloadBehavior      map[string]interface{} `json:"downloadBehavior"`
	Muted                 bool                   `json:"muted"`
	Overwrite             bool                   `json:"overwrite"`
	AudioBitrate          interface{}            `json:"audioBitrate"`
	VideoBitrate          interface{}            `json:"videoBitrate"`
	Webhook               interface{}            `json:"webhook"`
	ForceHeight           interface{}            `json:"forceHeight"`
	ForceWidth            interface{}            `json:"forceWidth"`
	BucketName            interface{}            `json:"bucketName"`
	AudioCodec            interface{}            `json:"audioCodec"`
	DumpBrowserLogs       bool                   `json:"dumpBrowserLogs"`
	ForceBucketName       string                 `json:"forceBucketName"`
	Gl                    string                 `json:"gl"`
}

type renderInternalOptions struct {
	RendererFunctionName  *string                `json:"rendererFunctionName"`
	FramesPerLambda       *string                `json:"framesPerLambda"`
	Composition           string                 `json:"composition" validate:"required"`
	ServeUrl              string                 `json:"serveUrl" validate:"required"`
	InputProps            interface{}            `json:"inputProps"`
	Type                  string                 `json:"type,omitempty"`
	Codec                 string                 `json:"codec"`
	ImageFormat           string                 `json:"imageFormat"`
	Crf                   int                    `json:"crf,omitempty"`
	EnvVariables          interface{}            `json:"envVariables,omitempty"`
	Quality               int                    `json:"quality,omitempty"`
	MaxRetries            int                    `json:"maxRetries"`
	Privacy               string                 `json:"privacy"`
	LogLevel              string                 `json:"logLevel"`
	FrameRange            interface{}            `json:"frameRange"`
	OutName               interface{}            `json:"outName"`
	TimeoutInMilliseconds int                    `json:"timeoutInMilliseconds"`
	ChromiumOptions       interface{}            `json:"chromiumOptions"`
	Scale                 int                    `json:"scale"`
	EveryNthFrame         int                    `json:"everyNthFrame"`
	NumberOfGifLoops      int                    `json:"numberOfGifLoops"`
	ConcurrencyPerLambda  int                    `json:"concurrencyPerLambda"`
	DownloadBehavior      map[string]interface{} `json:"downloadBehavior"`
	Muted                 bool                   `json:"muted"`
	Version               string                 `json:"version"`
	Overwrite             bool                   `json:"overwrite"`
	AudioBitrate          interface{}            `json:"audioBitrate"`
	VideoBitrate          interface{}            `json:"videoBitrate"`
	Webhook               interface{}            `json:"webhook"`
	ForceHeight           interface{}            `json:"forceHeight"`
	ForceWidth            interface{}            `json:"forceWidth"`
	BucketName            interface{}            `json:"bucketName"`
	AudioCodec            interface{}            `json:"audioCodec"`
	DumpBrowserLogs       bool                   `json:"dumpBrowserLogs"`

	ForceBucketName string  `json:"forceBucketName,omitempty"`
	Gl              *string `json:"gl,omitempty"`
}

type RemotionRenderResponse struct {
	RenderId          string `json:"renderId"`
	BucketName        string `json:"bucketName"`
	CloudWatchLogs    string `json:"cloudWatchLogs"`
	FolderInS3Console string `json:"folderInS3Console"`
}

type RenderConfig struct {
	RenderId     string `json:"renderId" validate:"required"`
	BucketName   string `json:"bucketName" validate:"required"`
	FunctionName string `json:"functionName" validate:"required"`
	Region       string `json:"region" validate:"required"`
}

type renderProgressInternalConfig struct {
	RenderId   string `json:"renderId" validate:"required"`
	BucketName string `json:"bucketName" validate:"required"`
	Type       string `json:"type" validate:"required"`
}

type RenderProgressResponse struct {
	OverallProgress          float64         `json:"overallProgress"`
	Chunks                   int             `json:"chunks"`
	Done                     bool            `json:"done"`
	EncodingStatus           *EncodingStatus `json:"encodingStatus,omitempty"`
	Costs                    *Costs          `json:"costs,omitempty"`
	RenderId                 string          `json:"renderId"`
	RenderMetadata           *RenderMetadata `json:"renderMetadata,omitempty"`
	OutputFile               *string         `json:"outputFile,omitempty"`
	OutKey                   *string         `json:"outKey,omitempty"`
	TimeToFinish             *int            `json:"timeToFinish,omitempty"`
	Errors                   []string        `json:"errors,omitempty"`
	FatalErrorEncountered    bool            `json:"fatalErrorEncountered"`
	CurrentTime              int64           `json:"currentTime"`
	RenderSize               int64           `json:"renderSize"`
	OutputSizeInBytes        *int64          `json:"outputSizeInBytes,omitempty"`
	LambdasInvoked           int             `json:"lambdasInvoked"`
	FramesRendered           *int            `json:"framesRendered,omitempty"`
	MostExpensiveFrameRanges []FrameRange    `json:"mostExpensiveFrameRanges,omitempty"`
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
