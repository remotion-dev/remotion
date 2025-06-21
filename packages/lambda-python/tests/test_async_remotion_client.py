import asyncio
import unittest
from unittest.mock import MagicMock, patch

from remotion_lambda.models import RenderStillParams, RenderMediaParams
from remotion_lambda.remotionclient import AsyncRemotionClient


class TestAsyncRemotionClient(unittest.TestCase):
    def setUp(self):
        self.client = AsyncRemotionClient(
            region="us-east-1",
            serve_url="testbed",
            function_name="remotion-render"
        )

    def test_async_client_inherits_from_remotion_client(self):
        """Test that AsyncRemotionClient properly inherits from RemotionClient."""
        self.assertEqual(self.client.region, "us-east-1")
        self.assertEqual(self.client.serve_url, "testbed")
        self.assertEqual(self.client.function_name, "remotion-render")

    @patch('remotion_lambda.remotionclient.boto3.client')
    def test_invoke_lambda_async_with_event_invocation_type(self, mock_boto_client):
        """Test that async invoke uses InvocationType='Event'."""
        # Setup mock
        mock_lambda_client = MagicMock()
        mock_boto_client.return_value = mock_lambda_client
        mock_lambda_client.invoke.return_value = {}

        # Run the async method
        async def run_test():
            await self.client._invoke_lambda_async("test-function", '{"test": "payload"}')

        asyncio.run(run_test())

        # Verify the invoke was called with InvocationType='Event'
        mock_lambda_client.invoke.assert_called_once_with(
            FunctionName="test-function",
            Payload='{"test": "payload"}',
            InvocationType='Event'
        )

    @patch('remotion_lambda.remotionclient.boto3.client')
    def test_render_still_on_lambda_async(self, mock_boto_client):
        """Test async still rendering."""
        # Setup mock
        mock_lambda_client = MagicMock()
        mock_boto_client.return_value = mock_lambda_client
        mock_lambda_client.invoke.return_value = {}

        render_still_params = RenderStillParams(
            composition="still-helloworld",
            input_props={
                'message': 'Hello from async!'
            },
        )

        async def run_test():
            result = await self.client.render_still_on_lambda_async(render_still_params)
            return result

        result = asyncio.run(run_test())

        # Verify the method returns None (fire-and-forget)
        self.assertIsNone(result)
        
        # Verify the lambda was invoked
        mock_lambda_client.invoke.assert_called_once()
        call_args = mock_lambda_client.invoke.call_args
        self.assertEqual(call_args.kwargs['InvocationType'], 'Event')

    @patch('remotion_lambda.remotionclient.boto3.client')
    def test_render_media_on_lambda_async(self, mock_boto_client):
        """Test async media rendering."""
        # Setup mock
        mock_lambda_client = MagicMock()
        mock_boto_client.return_value = mock_lambda_client
        mock_lambda_client.invoke.return_value = {}

        render_media_params = RenderMediaParams(
            composition="react-svg",
            input_props={
                'hi': 'there'
            },
        )

        async def run_test():
            result = await self.client.render_media_on_lambda_async(render_media_params)
            return result

        result = asyncio.run(run_test())

        # Verify the method returns None (fire-and-forget)
        self.assertIsNone(result)
        
        # Verify the lambda was invoked
        mock_lambda_client.invoke.assert_called_once()
        call_args = mock_lambda_client.invoke.call_args
        self.assertEqual(call_args.kwargs['InvocationType'], 'Event')

    @patch('remotion_lambda.remotionclient.boto3.client')
    def test_async_invoke_handles_function_error(self, mock_boto_client):
        """Test that async invoke properly handles FunctionError in response."""
        # Setup mock to return FunctionError
        mock_lambda_client = MagicMock()
        mock_boto_client.return_value = mock_lambda_client
        mock_lambda_client.invoke.return_value = {'FunctionError': 'Unhandled'}

        async def run_test():
            try:
                await self.client._invoke_lambda_async("test-function", '{"test": "payload"}')
                return "No error raised"
            except ValueError as e:
                return str(e)

        error_message = asyncio.run(run_test())
        self.assertIn("Lambda invocation failed", error_message)

    @patch('remotion_lambda.remotionclient.boto3.client')
    def test_async_invoke_handles_resource_not_found(self, mock_boto_client):
        """Test that async invoke properly handles ResourceNotFoundException."""
        # Setup mock to raise ResourceNotFoundException
        mock_lambda_client = MagicMock()
        mock_boto_client.return_value = mock_lambda_client
        
        # Create a proper exception class for mocking
        class ResourceNotFoundException(Exception):
            pass
        
        mock_lambda_client.exceptions.ResourceNotFoundException = ResourceNotFoundException
        mock_lambda_client.invoke.side_effect = ResourceNotFoundException("Function does not exist")

        async def run_test():
            try:
                await self.client._invoke_lambda_async("nonexistent-function", '{"test": "payload"}')
                return "No error raised"
            except ValueError as e:
                return str(e)

        error_message = asyncio.run(run_test())
        # The error should either contain "does not exist" or be an unexpected error
        self.assertTrue("does not exist" in error_message or "unexpected error" in error_message)


if __name__ == '__main__':
    unittest.main()