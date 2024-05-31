
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
    composition="react-svg",
    privacy=Privacy.PUBLIC,
    image_format=ValidStillImageFormats.JPEG,
    input_props={
        'hi': 'there'
    },
)

render_response = client.render_media_on_lambda(render_params)
if render_response:
    # Execute render request

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
