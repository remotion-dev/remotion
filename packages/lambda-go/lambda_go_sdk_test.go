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
	if needsUpload(1000, "video-or-audio") {
		t.Fatal("small video payload should not need upload")
	}
	if !needsUpload(maxVideoInlinePayloadSize, "video-or-audio") {
		t.Fatal("video payload at the limit should need upload")
	}
	if needsUpload(maxVideoInlinePayloadSize, "still") {
		t.Fatal("still payload has a larger inline budget and should not need upload here")
	}
	if !needsUpload(maxStillInlinePayloadSize, "still") {
		t.Fatal("still payload at the limit should need upload")
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
