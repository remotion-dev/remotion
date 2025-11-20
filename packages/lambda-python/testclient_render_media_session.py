
from remotion_lambda import RenderMediaParams, Privacy, ValidStillImageFormats, Webhook
from remotion_lambda import RemotionClient
import os
from dotenv import load_dotenv
import boto3
from botocore.config import Config

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


    # --- NEW: Create a custom botocore Config for timeouts ---
# This configuration will apply to both S3 and Lambda clients created by RemotionClient
# if passed via the botocore_config parameter.
custom_botocore_config = Config(
    connect_timeout=10,  # Max 10 seconds to establish a connection
    read_timeout=60,     # Max 60 seconds to receive data after connection
    retries={'max_attempts': 3, 'mode': 'adaptive'}, # Retry up to 3 times on certain errors
    # You can add more settings here, e.g., proxies
    # proxies={
    #     'http': 'http://proxy.example.com:8080',
    #     'https': 'https://proxy.example.com:8080'
# }
)
print(f"Created custom botocore config: {custom_botocore_config.retries}")


# --- NEW: Create a custom boto3 session ---
# This session can be configured independently, for example,
# if you need to specify a different profile or assumed role.
# If you don't need a custom session, you can omit this and
# RemotionClient will use boto3's default session.
custom_boto_session = boto3.Session(
    region_name=REMOTION_APP_REGION,
    # profile_name='your_aws_profile', # Uncomment if you use AWS profiles
    # If you provide aws_access_key_id, aws_secret_access_key here,
    # it will override the ones passed to RemotionClient directly.
    # aws_access_key_id='YOUR_ACCESS_KEY',
    # aws_secret_access_key='YOUR_SECRET_KEY',
)
print(f"Created custom boto3 session with region: {custom_boto_session.region_name}")


# Construct client
client = RemotionClient(region=REMOTION_APP_REGION,
                        serve_url=REMOTION_APP_SERVE_URL,
                        function_name=REMOTION_APP_FUNCTION_NAME,
                        botocore_config=custom_botocore_config,
                        boto_session=custom_boto_session)

# Set render request
render_params = RenderMediaParams(
    composition="spring-with-duration",
    privacy=Privacy.PUBLIC,
    image_format=ValidStillImageFormats.JPEG,
    input_props={
        'hi': 'there'
    },
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
