from unittest import TestCase

from remotion_lambda.models import RenderStillParams
from remotion_lambda.remotionclient import RemotionClient


class TestRemotionClient(TestCase):
    def test_remotion_construct_request(self):
        client = RemotionClient(region="us-east-1",
                                serve_url="testbed",
                                function_name="remotion-render")
        render_still_params = RenderStillParams(
            composition="still-helloworld",
            input_props={
                'message': 'Hello from props!'
            },
        )

        self.assertEqual(client.region, "us-east-1")
        self.assertIsNotNone(render_still_params)
        self.assertIsNotNone(render_still_params.input_props)
        print(client.construct_render_request(
            render_params=render_still_params, render_type='still'))
