---
image: /generated/articles-docs-lambda-python.png
title: Triggering renders from Python
slug: /lambda/python
sidebar_label: Rendering from Python
crumb: "@remotion/lambda"
---

_available from v4.0.15_

<ExperimentalBadge>
This feature is new. Please report any issues you encounter.
</ExperimentalBadge>

To trigger a Lambda render using Python, install the `remotion-lambda` package using `pip`, by executing `pip install remotion-lambda` from your python project. Use the same version as the `remotion` version you are using from NPM, e.g. `pip install remotion-lambda==4.0.15` (see [newest version](https://remotion.dev/changelog)).

Below is a snippet showing how to initiate a render request and get its status. Note the following before continuing:

- You first need to [complete the Lambda setup](/docs/lambda/setup).
- Sending large input props (>200KB) is not supported with Python at the moment.

```python title="testclient.py"
from remotion_lambda import RenderParams, RenderProgressParams
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
render_params = RenderParams(
    composition="react-svg",
    # Note: In Python, you pass input props using `data`, not `input_props`
    data={
        'hi': 'there'
    },
)

render_response = client.render_media_on_lambda(render_params)
if render_response:
    # Execute render request

    print("Render ID:", render_response.renderId)
    print("Bucket name:", render_response.bucketName)


    # Execute progress request
    progress_response = client.get_render_progress(
        render_id=render_response.renderId, bucket_name=render_response.bucketName)

    while progress_response and not progress_response.done:
        print("Overall progress")
        print(str(progress_response.overallProgress * 100) + "%")
        progress_response = client.get_render_progress(
            render_id=render_response.renderId, bucket_name=render_response.bucketName)
    print("Render done!", progress_response.outputFile)
```

## See also

- [Using Lambda without IAM user](/docs/lambda/without-iam)
- [Permissions](/docs/lambda/permissions)
