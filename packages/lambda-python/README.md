# @remotion/lambda-python

## Usage

This package provides Python clients for interacting with Remotion Lambda functions.

### Synchronous Client

```python
from remotion_lambda import RemotionClient, RenderStillParams

client = RemotionClient(
    region="us-east-1",
    serve_url="https://your-app.com",
    function_name="remotion-render-lambda"
)

# Render a still image (blocks until complete)
render_params = RenderStillParams(
    composition="MyComposition",
    input_props={"title": "Hello World"}
)
response = client.render_still_on_lambda(render_params)
```

### Asynchronous Client

```python
import asyncio
from remotion_lambda import AsyncRemotionClient, RenderStillParams

async def main():
    client = AsyncRemotionClient(
        region="us-east-1",
        serve_url="https://your-app.com", 
        function_name="remotion-render-lambda"
    )
    
    # Render a still image (fire-and-forget, returns immediately)
    render_params = RenderStillParams(
        composition="MyComposition",
        input_props={"title": "Hello Async World"}
    )
    await client.render_still_on_lambda_async(render_params)
    print("Render triggered successfully!")

asyncio.run(main())
```

The async client is useful for:
- Non-blocking operations in async frameworks
- Triggering multiple renders concurrently
- Fire-and-forget rendering workflows
