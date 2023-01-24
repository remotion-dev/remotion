# Render Queuing with Lambda Removal using AWS SQS

## This article provides step-by-step instructions for setting up render queuing with Lambda Removal using AWS Simple Queue Service (SQS). It is intended for users with no prior knowledge of these services.

# Step 1: Set Up an AWS Account

Before you begin, you will need to have an active AWS account. If you don't already have one, you can create one for free on the AWS website.

# Step 2: Create an SQS queue

<ol>
  <li>Access the AWS Console and click on the SQS service.</li>
  <li>Click "Create New Queue" and enter a name for the queue.</li>
  <li>Select "Standard Queue" and click "Create Queue".</li>
</ol>

# Step 3: Create a Lambda Function

<ol>
  <li>Access the AWS Console and click on the Lambda service.</li>
  <li>Click on "Create function" and select "Author from scratch".</li>
  <li>Enter a name for the function and select "Python 3.8" as runtime.</li>
  <li>Select "SQS" as trigger event and select the SQS queue created in step</li>
  <li>Click on "Create function".</li>
</ol>

# Step 4: Add Code to the Lambda Function

<ol>
  <li>On the Lambda function screen, select "Function code".</li>
  <li>Add the render queuing code in the "lambda_handler" code box and save.</li>
</ol>

# Step 5: Test the Lambda Function

<ol>
  <li>On the Lambda function screen, select "Test" and create a test event.</li>
  <li>Click "Test" and check if the rendering was queued correctly.</li>
</ol>

### And that's it! Now you know how to set up render queuing with Lambda Removal using AWS SQS. Keep in mind that it's important to monitor your SQS queue and your Lambda function to ensure that renders are processing correctly.
