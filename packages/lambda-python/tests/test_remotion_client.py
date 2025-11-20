import json
from tests.conftest import remotion_client, mock_s3_client, remotion_client_with_creds
from remotion_lambda.remotionclient import RemotionClient
from remotion_lambda.models import ( RenderType )
from remotion_lambda.exception import (
    RemotionException,
    RemotionInvalidArgumentException,
    RemotionRenderingOutputError
)
from botocore.exceptions import ClientError, ParamValidationError

import pytest
from tests.constants import (
    TEST_FUNCTION_NAME,
    TEST_REGION,
    TEST_SERVE_URL,
    TEST_AWS_SECRET_KEY,
    TEST_AWS_ACCESS_KEY,
)
from unittest.mock import MagicMock, patch, Mock
from botocore.config import Config


def test_bucket_name_format(remotion_client: RemotionClient):
    bucket_name = remotion_client._make_bucket_name()
    assert bucket_name.startswith("remotionlambda-useast1-")


def test_client_config(remotion_client: RemotionClient):
    assert remotion_client.function_name == TEST_FUNCTION_NAME
    assert remotion_client.region == TEST_REGION
    assert remotion_client.serve_url == TEST_SERVE_URL
    assert not remotion_client.access_key
    assert not remotion_client.secret_key
    assert not remotion_client.force_path_style


def test_client_config_with_creds(remotion_client_with_creds: RemotionClient):
    remotion_client = remotion_client_with_creds
    assert remotion_client.function_name == TEST_FUNCTION_NAME
    assert remotion_client.region == TEST_REGION
    assert remotion_client.serve_url == TEST_SERVE_URL
    assert remotion_client.access_key == TEST_AWS_ACCESS_KEY
    assert remotion_client.secret_key == TEST_AWS_SECRET_KEY
    assert not remotion_client.force_path_style


@pytest.mark.parametrize(
    "hash_value,expected",
    [
        ("a1b2c3", "input-props/a1b2c3.json"),
        (
            "very_long_hash_value_123456789",
            "input-props/very_long_hash_value_123456789.json",
        ),
    ],
)
def test_input_props_key_multiple_values(remotion_client, hash_value, expected):
    result = remotion_client._input_props_key(hash_value)
    assert result == expected


def test_generate_hash_basic_string(remotion_client: RemotionClient):
    payload = "test payload"
    result = remotion_client._generate_hash(payload)

    assert len(result) == 64
    assert all(c in '0123456789abcdef' for c in result)


@patch('boto3.client')
def test_create_s3_client_default(
    mock_boto_client, mock_s3_client, remotion_client: RemotionClient
):
    mock_boto_client.return_value = mock_s3_client
    result = remotion_client._create_s3_client()

    mock_boto_client.assert_called_once_with('s3', region_name=TEST_REGION)
    assert result == mock_s3_client


@patch('boto3.client')
def test_create_s3_client_partial_creds(mock_boto_client, mock_s3_client):
    remotion_client = RemotionClient(
        region=TEST_REGION,
        serve_url=TEST_SERVE_URL,
        function_name=TEST_FUNCTION_NAME,
        secret_key=TEST_AWS_SECRET_KEY,
    )

    mock_boto_client.return_value = mock_s3_client
    result = remotion_client._create_s3_client()

    mock_boto_client.assert_called_once_with('s3', region_name=TEST_REGION)
    assert result == mock_s3_client


@patch('boto3.client')
def test_create_s3_client_creds(
    mock_boto_client, mock_s3_client, remotion_client_with_creds
):
    mock_boto_client.return_value = mock_s3_client
    result = remotion_client_with_creds._create_s3_client()

    mock_boto_client.assert_called_once_with(
        's3',
        region_name=TEST_REGION,
        aws_access_key_id=TEST_AWS_ACCESS_KEY,
        aws_secret_access_key=TEST_AWS_SECRET_KEY,
    )
    assert result == mock_s3_client


@patch('boto3.client')
def test_create_s3_client_with_path_style(mock_boto_client, mock_s3_client):
    remotion_client = RemotionClient(
        region=TEST_REGION,
        serve_url=TEST_SERVE_URL,
        function_name=TEST_FUNCTION_NAME,
        force_path_style=True,
    )
    mock_boto_client.return_value = mock_s3_client
    result = remotion_client._create_s3_client()

    mock_boto_client.assert_called_once()

    call_args = mock_boto_client.call_args
    assert 'config' in call_args[1]
    config = call_args[1]['config']
    assert isinstance(config, Config)
    assert config.s3['addressing_style'] == 'path'
    assert result == mock_s3_client


@patch.object(RemotionClient, '_create_s3_client')
def test_get_remotion_buckets_empty_response(
    mock_create_client, mock_s3_client, remotion_client
):
    mock_s3_client.list_buckets.return_value = {'Buckets': []}
    mock_create_client.return_value = mock_s3_client

    result = remotion_client._get_remotion_buckets()

    assert result == []
    mock_s3_client.list_buckets.assert_called_once()


@patch.object(RemotionClient, '_create_s3_client')
def test_get_remotion_buckets_no_remotion_buckets(
    mock_create_client, mock_s3_client, remotion_client
):
    mock_s3_client.list_buckets.return_value = {
        'Buckets': [
            {'Name': 'my-app-bucket'},
            {'Name': 'some-other-bucket'},
            {'Name': 'user-data-bucket'},
        ]
    }
    mock_create_client.return_value = mock_s3_client

    result = remotion_client._get_remotion_buckets()

    assert result == []
    mock_s3_client.list_buckets.assert_called_once()
    mock_s3_client.get_bucket_location.assert_not_called()


@patch.object(RemotionClient, '_create_s3_client')
def test_get_remotion_buckets_single_match_us_east_1(
    mock_create_client, mock_s3_client, remotion_client
):
    test_bucket_name = 'remotionlambda-useast1-abc123'
    mock_s3_client.list_buckets.return_value = {
        'Buckets': [
            {'Name': test_bucket_name},
            {'Name': 'other-bucket'},
        ]
    }
    mock_s3_client.get_bucket_location.return_value = {'LocationConstraint': None}
    mock_create_client.return_value = mock_s3_client

    result = remotion_client._get_remotion_buckets()

    assert result == [test_bucket_name]
    mock_s3_client.get_bucket_location.assert_called_once_with(Bucket=test_bucket_name)



@patch.object(RemotionClient, '_create_s3_client')
def test_get_or_create_bucket_client_error_on_create_bucket(
    mock_create_client, mock_s3_client, remotion_client
):
    """
    Test that ClientError from create_bucket is re-raised directly.
    """
    mock_s3_client.list_buckets.return_value = {'Buckets': []} # Ensure new bucket creation path
    mock_s3_client.create_bucket.side_effect = ClientError({"Error": {"Code": "BucketAlreadyExists"}}, "CreateBucket")
    mock_create_client.return_value = mock_s3_client

    with pytest.raises(ClientError) as excinfo:
        remotion_client._get_or_create_bucket()
    assert excinfo.type == ClientError
    assert "BucketAlreadyExists" in str(excinfo.value)
    mock_s3_client.create_bucket.assert_called_once()


@patch.object(RemotionClient, '_create_s3_client')
def test_upload_to_s3_client_error_on_put_object(
    mock_create_client, mock_s3_client, remotion_client
):
    """
    Test that ClientError from put_object is re-raised directly.
    """
    mock_s3_client.put_object.side_effect = ClientError({"Error": {"Code": "InternalError"}}, "PutObject")
    mock_create_client.return_value = mock_s3_client

    with pytest.raises(ClientError) as excinfo:
        remotion_client._upload_to_s3("test-bucket", "test-key", "payload")
    assert excinfo.type == ClientError
    assert "InternalError" in str(excinfo.value)
    mock_s3_client.put_object.assert_called_once()



@patch.object(RemotionClient, '_get_remotion_buckets')
def test_get_or_create_bucket_remotion_exception_on_multiple_buckets(
    mock_get_remotion_buckets, remotion_client
):
    """
    Test that RemotionException is raised when multiple Remotion buckets are found.
    """
    mock_get_remotion_buckets.return_value = [
        'remotionlambda-us-east-1-bucket1',
        'remotionlambda-us-east-1-bucket2',
    ]

    with pytest.raises(RemotionException) as excinfo:
        remotion_client._get_or_create_bucket()
    
    assert excinfo.type == RemotionException
    assert "You have multiple buckets" in str(excinfo.value)
    mock_get_remotion_buckets.assert_called_once()


@patch.object(RemotionClient, '_create_lambda_client')
def test_invoke_lambda_unexpected_response_format(
    mock_create_lambda_client, mock_lambda_client, remotion_client
):
    """
    Test that _invoke_lambda raises RemotionRenderingOutputError for unexpected response types.
    """
    unexpected_payload = json.dumps([
        {'type': 'log', 'level': 'info', 'message': 'Still running'},
        {'status': 'pending', 'progress': 0.5} # Not 'success' or 'error'
    ])
    mock_lambda_client.invoke.return_value = {'Payload': Mock(read=lambda: unexpected_payload.encode('utf-8'))}
    mock_create_lambda_client.return_value = mock_lambda_client

    with pytest.raises(RemotionRenderingOutputError) as excinfo:
        remotion_client._invoke_lambda("my-function", "{}")
    
    assert excinfo.type == RemotionRenderingOutputError
    assert "Unexpected Lambda response format" in str(excinfo.value)
    mock_lambda_client.invoke.assert_called_once()


@patch.object(RemotionClient, '_create_lambda_client')
def test_invoke_lambda_invalid_json_decode(
    mock_create_lambda_client, mock_lambda_client, remotion_client
):
    """
    Test that _invoke_lambda raises RemotionException if the stream has invalid JSON objects.
    (Note: This uses RemotionException, not RemotionRenderingOutputError, as it's a structural parsing error).
    """
    invalid_stream = b'{"type":"log"} {"malformed_json" ' # Incomplete JSON
    mock_lambda_client.invoke.return_value = {'Payload': Mock(read=lambda: invalid_stream)}
    mock_create_lambda_client.return_value = mock_lambda_client

    with pytest.raises(RemotionRenderingOutputError) as excinfo:
        remotion_client._invoke_lambda("my-function", "{}")
    
    assert excinfo.type == RemotionRenderingOutputError
    mock_lambda_client.invoke.assert_called_once()


@patch.object(RemotionClient, '_serialize_input_props')
def test_construct_render_request_client_error_from_serialize_input_props(
    mock_serialize_input_props, remotion_client
):
    """
    Test that construct_render_request raises RemotionInvalidArgumentException
    if _serialize_input_props encounters and re-raises a ClientError.
    """
    # Simulate _serialize_input_props raising a ClientError (e.g., from _upload_to_s3)
    mock_serialize_input_props.side_effect = ClientError({"Error": {"Code": "AccessDenied"}}, "PutObject")

    mock_render_params = Mock()
    mock_render_params.input_props = {"dummy": "data"}
    mock_render_params.serialize_params.return_value = {"serialized": "params"}
    
    with pytest.raises(RemotionInvalidArgumentException) as excinfo:
        remotion_client.construct_render_request(mock_render_params, "still")
    
    assert excinfo.type == RemotionInvalidArgumentException
    assert "Failed to serialize input properties for rendering" in str(excinfo.value)
    assert "AccessDenied" in str(excinfo.value) # Ensure the original ClientError info is present
    mock_serialize_input_props.assert_called_once_with(
        input_props=mock_render_params.input_props,
        render_type="still"
    )


@patch('boto3.client')
def test_create_s3_client_with_boto_session(mock_boto3_client_func):
    """
    Test that _create_s3_client uses the provided boto_session
    instead of boto3.client directly.
    """
    # Arrange
    mock_session = MagicMock()
    mock_s3_client_from_session = MagicMock()
    mock_session.client.return_value = mock_s3_client_from_session

    client = RemotionClient(
        region=TEST_REGION,
        serve_url=TEST_SERVE_URL,
        function_name=TEST_FUNCTION_NAME,
        boto_session=mock_session,
    )

    # Act
    s3_client = client._create_s3_client()

    # Assert
    assert s3_client == mock_s3_client_from_session
    mock_session.client.assert_called_once_with('s3', region_name=TEST_REGION)
    mock_boto3_client_func.assert_not_called() # Ensure boto3.client was not used


@patch('boto3.client')
def test_create_s3_client_with_custom_timeout_config(mock_boto3_client_func, mock_s3_client):
    """
    Test that _create_s3_client correctly applies custom timeout settings
    provided via botocore_config.
    """
    # Arrange
    custom_timeout = 10  # seconds
    custom_config = Config(connect_timeout=custom_timeout, read_timeout=custom_timeout)

    client = RemotionClient(
        region=TEST_REGION,
        serve_url=TEST_SERVE_URL,
        function_name=TEST_FUNCTION_NAME,
        botocore_config=custom_config,
    )
    mock_boto3_client_func.return_value = mock_s3_client

    # Act
    s3_client = client._create_s3_client()

    # Assert
    assert s3_client == mock_s3_client
    mock_boto3_client_func.assert_called_once()
    
    # Extract the config argument passed to boto3.client
    call_args, call_kwargs = mock_boto3_client_func.call_args
    passed_config = call_kwargs.get('config')

    assert isinstance(passed_config, Config)
    assert passed_config.connect_timeout == custom_timeout
    assert passed_config.read_timeout == custom_timeout
    assert passed_config.s3 is None # No s3 addressing_style if not forced