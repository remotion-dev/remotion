
from renderparams import RenderParams
from remotionclient import RemotionClient
import os
from dotenv import load_dotenv


load_dotenv()

# environment variables defined inside a .env file
REMOTION_APP_REGION = "ap-southeast-2"
REMOTION_APP_BUCKET = "remotionlambda-apsoutheast2-qv16gcf02l"
REMOTION_APP_FUNCTION_NAME = "remotion-render-3-3-101-mem2048mb-disk2048mb-240sec"
REMOTION_APP_SERVE_URL = "https://remotionlambda-apsoutheast2-qv16gcf02l.s3.ap-southeast-2.amazonaws.com/sites/remotion-render-app-3.3.101/index.html"


REMOTION_APP_REGION = os.getenv('REMOTION_APP_REGION')
REMOTION_APP_BUCKET = os.getenv('REMOTION_APP_BUCKET')
REMOTION_APP_FUNCTION_NAME = os.getenv('REMOTION_APP_FUNCTION_NAME')
REMOTION_APP_SERVE_URL = os.getenv('REMOTION_APP_SERVE_URL')


client = RemotionClient(region=REMOTION_APP_REGION,
                        serve_url=REMOTION_APP_SERVE_URL,
                        function_name=REMOTION_APP_FUNCTION_NAME)

render_params = RenderParams(
    composition="main",
    data={
        'hi': 'there'
    },
)  # Instantiate a RenderParams object
# Pass the object to renderMediaOnLambda
print(client.contruct_render_request(render_params))
print("\n")
client.render_media_on_lambda(render_params)
