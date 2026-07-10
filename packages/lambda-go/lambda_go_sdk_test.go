package lambda_go_sdk

import (
	"encoding/json"
	"log"
	"strings"
	"testing"
)

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
