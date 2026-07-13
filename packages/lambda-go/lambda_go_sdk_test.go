package lambda_go_sdk

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"io"
	"log"
	"strings"
	"testing"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	"github.com/aws/smithy-go"
)

type bucketLocationGetterMock struct {
	output *s3.GetBucketLocationOutput
	err    error
}

func (mock bucketLocationGetterMock) GetBucketLocation(
	_ context.Context,
	_ *s3.GetBucketLocationInput,
	_ ...func(*s3.Options),
) (*s3.GetBucketLocationOutput, error) {
	return mock.output, mock.err
}

type objectUploaderMock struct {
	input *s3.PutObjectInput
	err   error
}

func (mock *objectUploaderMock) PutObject(
	_ context.Context,
	input *s3.PutObjectInput,
	_ ...func(*s3.Options),
) (*s3.PutObjectOutput, error) {
	mock.input = input
	return &s3.PutObjectOutput{}, mock.err
}

func TestPrintVersion(t *testing.T) {
	payload, err := constructRenderInternals(&RemotionOptions{
		Region:       "us-east-1",
		Composition:  "react-svg",
		FunctionName: "remotion-render",
		ServeUrl:     "testbed",
		Codec:        "h264",
		Metadata: map[string]string{
			"Author": "Remotion",
		},
	})
	if err != nil {
		log.Fatalf("Error marshaling struct to JSON: %v", err)
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		log.Fatalf("Error marshaling struct to JSON: %v", err)
	}

	println(string(jsonData))
}

func TestSerializeNilInputProps(t *testing.T) {
	result, err := serializeInputProps(nil, "us-east-1", "video-or-audio", "", false)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result.Type != "payload" || result.Payload != "{}" {
		t.Fatalf("expected empty payload object, got %+v", result)
	}
}

func TestSerializeInlineInputProps(t *testing.T) {
	result, err := serializeInputProps(map[string]interface{}{"data": "hello"}, "us-east-1", "video-or-audio", "", false)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result.Type != "payload" {
		t.Fatalf("expected inline payload, got type %q", result.Type)
	}
	if result.Payload != `{"data":"hello"}` {
		t.Fatalf("unexpected payload: %q", result.Payload)
	}
}

func TestNeedsUpload(t *testing.T) {
	tests := []struct {
		name        string
		payloadSize int
		inputType   string
		want        bool
	}{
		{name: "video below limit", payloadSize: maxVideoInlinePayloadSize - 1, inputType: "video-or-audio", want: false},
		{name: "video at limit", payloadSize: maxVideoInlinePayloadSize, inputType: "video-or-audio", want: false},
		{name: "video above limit", payloadSize: maxVideoInlinePayloadSize + 1, inputType: "video-or-audio", want: true},
		{name: "still below limit", payloadSize: maxStillInlinePayloadSize - 1, inputType: "still", want: false},
		{name: "still at limit", payloadSize: maxStillInlinePayloadSize, inputType: "still", want: false},
		{name: "still above limit", payloadSize: maxStillInlinePayloadSize + 1, inputType: "still", want: true},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if got := needsUpload(test.payloadSize, test.inputType); got != test.want {
				t.Fatalf("needsUpload(%d, %q) = %v, want %v", test.payloadSize, test.inputType, got, test.want)
			}
		})
	}
}

func TestNeedsUploadWarningRounding(t *testing.T) {
	previousWriter := log.Writer()
	var output bytes.Buffer
	log.SetOutput(&output)
	t.Cleanup(func() {
		log.SetOutput(previousWriter)
	})

	if !needsUpload(maxVideoInlinePayloadSize+1, "video-or-audio") {
		t.Fatal("video payload above the limit should need upload")
	}
	if !strings.Contains(output.String(), "over 194KB") {
		t.Fatalf("expected rounded video limit in warning, got %q", output.String())
	}

	output.Reset()
	if !needsUpload(maxStillInlinePayloadSize+1, "still") {
		t.Fatal("still payload above the limit should need upload")
	}
	if !strings.Contains(output.String(), "over 4994KB") {
		t.Fatalf("expected rounded still limit in warning, got %q", output.String())
	}
}

func TestIsBucketInRegion(t *testing.T) {
	accessDenied := &smithy.GenericAPIError{Code: "AccessDenied", Message: "denied"}
	tests := []struct {
		name       string
		output     *s3.GetBucketLocationOutput
		err        error
		region     string
		want       bool
		wantErr    bool
		wrappedErr error
	}{
		{
			name:   "matching region",
			output: &s3.GetBucketLocationOutput{LocationConstraint: types.BucketLocationConstraint("eu-west-1")},
			region: "eu-west-1",
			want:   true,
		},
		{
			name:   "different region",
			output: &s3.GetBucketLocationOutput{LocationConstraint: types.BucketLocationConstraint("eu-west-1")},
			region: "us-west-1",
			want:   false,
		},
		{
			name:   "empty location is us-east-1",
			output: &s3.GetBucketLocationOutput{},
			region: regionUsEast1,
			want:   true,
		},
		{
			name:   "missing bucket",
			err:    &smithy.GenericAPIError{Code: "NoSuchBucket", Message: "missing"},
			region: regionUsEast1,
			want:   false,
		},
		{
			name:       "access error",
			err:        accessDenied,
			region:     regionUsEast1,
			wantErr:    true,
			wrappedErr: accessDenied,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			got, err := isBucketInRegion(bucketLocationGetterMock{
				output: test.output,
				err:    test.err,
			}, "remotionlambda-test", test.region)
			if got != test.want {
				t.Fatalf("isBucketInRegion() = %v, want %v", got, test.want)
			}
			if (err != nil) != test.wantErr {
				t.Fatalf("isBucketInRegion() error = %v, wantErr %v", err, test.wantErr)
			}
			if test.wrappedErr != nil && !errors.Is(err, test.wrappedErr) {
				t.Fatalf("expected error to wrap %v, got %v", test.wrappedErr, err)
			}
		})
	}
}

func TestUploadInputPropsOmitsACL(t *testing.T) {
	uploader := &objectUploaderMock{}
	if err := uploadInputPropsToS3(uploader, "bucket", "input-props/hash.json", `{"hello":"world"}`); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if uploader.input == nil {
		t.Fatal("PutObject was not called")
	}
	if uploader.input.ACL != "" {
		t.Fatalf("expected no object ACL, got %q", uploader.input.ACL)
	}
	if got := aws.ToString(uploader.input.ContentType); got != "application/json" {
		t.Fatalf("unexpected content type: %q", got)
	}
	payload, err := io.ReadAll(uploader.input.Body)
	if err != nil {
		t.Fatalf("could not read uploaded payload: %v", err)
	}
	if got := string(payload); got != `{"hello":"world"}` {
		t.Fatalf("unexpected uploaded payload: %q", got)
	}
}

func TestUploadInputPropsWrapsErrors(t *testing.T) {
	uploadError := errors.New("upload failed")
	err := uploadInputPropsToS3(&objectUploaderMock{err: uploadError}, "bucket", "key", "payload")
	if !errors.Is(err, uploadError) {
		t.Fatalf("expected wrapped upload error, got %v", err)
	}
}

func TestPayloadDataAlias(t *testing.T) {
	serialized := &SerializedInputProps{Type: "payload", Payload: "{}"}
	var legacy *PayloadData = serialized
	if legacy != serialized {
		t.Fatal("PayloadData alias changed the pointer")
	}
}

func TestRandomHashFormat(t *testing.T) {
	const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789"
	for i := 0; i < 100; i++ {
		hash, err := randomHash()
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(hash) != 10 {
			t.Fatalf("expected 10 character hash, got %q", hash)
		}
		for _, char := range hash {
			if !strings.ContainsRune(alphabet, char) {
				t.Fatalf("unexpected character %q in hash %q", char, hash)
			}
		}
	}
}

func TestNewS3ClientConfiguration(t *testing.T) {
	t.Setenv("AWS_EC2_METADATA_DISABLED", "true")
	client, err := newS3Client("eu-west-1", true)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	options := client.Options()
	if options.Region != "eu-west-1" {
		t.Fatalf("unexpected S3 region: %q", options.Region)
	}
	if !options.UsePathStyle {
		t.Fatal("expected path-style S3 addressing")
	}
}

func TestBucketNamingAndKeys(t *testing.T) {
	name, err := makeBucketName("us-east-1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !strings.HasPrefix(name, "remotionlambda-useast1-") {
		t.Fatalf("unexpected bucket name: %q", name)
	}
	if len(name) != len("remotionlambda-useast1-")+10 {
		t.Fatalf("expected 10 char random suffix, got %q", name)
	}

	if key := inputPropsKey("abc123"); key != "input-props/abc123.json" {
		t.Fatalf("unexpected key: %q", key)
	}

	// Same payload must hash to the same object name.
	if hashPayload("x") != hashPayload("x") {
		t.Fatal("hashPayload is not deterministic")
	}
	if hashPayload("x") == hashPayload("y") {
		t.Fatal("hashPayload collided for different inputs")
	}
}
