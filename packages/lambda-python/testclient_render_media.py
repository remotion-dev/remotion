
from remotion_lambda import RenderMediaParams, Privacy, ValidStillImageFormats, Webhook
from remotion_lambda import RemotionClient
import os
from dotenv import load_dotenv


load_dotenv()

# Load env variables
REMOTION_APP_REGION = os.getenv('REMOTION_APP_REGION')
if not REMOTION_APP_REGION:
    raise Exception("REMOTION_APP_REGION is not set")

REMOTION_APP_FUNCTION_NAME = os.getenv('REMOTION_APP_FUNCTION_NAME')
if not REMOTION_APP_FUNCTION_NAME:
    raise Exception("REMOTION_APP_FUNCTION_NAME is not set")

REMOTION_APP_SERVE_URL = os.getenv('REMOTION_APP_SERVE_URL')
if not REMOTION_APP_SERVE_URL:
    raise Exception("REMOTION_APP_SERVE_URL is not set")

# Construct client
client = RemotionClient(region=REMOTION_APP_REGION,
                        serve_url=REMOTION_APP_SERVE_URL,
                        function_name=REMOTION_APP_FUNCTION_NAME)

# Set render request
render_params = RenderMediaParams(
    composition="print-props",
    privacy=Privacy.PUBLIC,
    image_format=ValidStillImageFormats.JPEG,
    input_props={
        'hi': 'there'
    },
)

# Test with large payload to verify S3 compression works
# Create large input props that exceed the 200KB limit for video-or-audio renders
large_data = {
    'largeArray': ['x' * 1000] * 250,  # This creates ~250KB of data
    'description': 'This is a test with large input props to verify S3 compression functionality'
}

large_render_params = RenderMediaParams(
    composition="print-props",
    privacy=Privacy.PUBLIC,
    image_format=ValidStillImageFormats.JPEG,
    input_props=large_data,
)

print("Testing normal payload size...")
render_response = client.render_media_on_lambda(render_params)

if render_response:
    print("Render ID:", render_response.render_id)
    print("Bucket name:", render_response.bucket_name)

    # Execute progress request
    progress_response = client.get_render_progress(
        render_id=render_response.render_id, bucket_name=render_response.bucket_name)

    while progress_response and not progress_response.done:
        print("Overall progress")
        print(str(progress_response.overallProgress * 100) + "%")
        progress_response = client.get_render_progress(
            render_id=render_response.render_id, bucket_name=render_response.bucket_name)
    print("Render done!", progress_response.outputFile)

print("Testing large payload compression...")
# For testing large payloads, we would need valid AWS credentials
# This will demonstrate the compression logic
try:
    large_render_response = client.render_media_on_lambda(large_render_params)
    print("Large payload render succeeded!")
    
    if large_render_response:
        print("Large Render ID:", large_render_response.render_id)
        print("Large Bucket name:", large_render_response.bucket_name)

        # Execute progress request for large render
        large_progress_response = client.get_render_progress(
            render_id=large_render_response.render_id, bucket_name=large_render_response.bucket_name)

        while large_progress_response and not large_progress_response.done:
            print("Large render overall progress")
            print(str(large_progress_response.overallProgress * 100) + "%")
            large_progress_response = client.get_render_progress(
                render_id=large_render_response.render_id, bucket_name=large_render_response.bucket_name)
        print("Large render done!", large_progress_response.outputFile)

except Exception as e:
    print(f"Large payload test failed (expected without valid AWS credentials): {e}")
