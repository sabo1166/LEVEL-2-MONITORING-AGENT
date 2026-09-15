import boto3

client = boto3.client(
    "bedrock-runtime",
    region_name="us-east-1"
)

model_id = "anthropic.claude-3-haiku-20240307-v1:0"

response = client.converse(
    modelId=model_id,
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "text": "You are an AWS monitoring assistant. Explain in one sentence what CloudWatch does."
                }
            ]
        }
    ],
    inferenceConfig={
        "maxTokens": 200,
        "temperature": 0.2
    }
)

text = response["output"]["message"]["content"][0]["text"]

print("\n=== BEDROCK RESPONSE ===\n")
print(text)

print("\n=== USAGE ===\n")
print(response.get("usage"))
