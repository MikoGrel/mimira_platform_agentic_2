from openai import OpenAI
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize the OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

response = client.responses.create(
    model="gpt-5-mini",
    input="Jakie rodzaje podpisu są wymagne?",
    tools=[{
        "type": "file_search",
        "vector_store_ids": ["vs_68d132247b088191a6002c604f3f72e7"]
    }],
    include=["file_search_call.results"]
)
import json

def format_response(response):
    """Format the OpenAI response for better readability"""
    print("="*80)
    print("OPENAI RESPONSE SUMMARY")
    print("="*80)
    
    print(f"Response ID: {response.id}")
    print(f"Model: {response.model}")
    print(f"Created: {response.created_at}")
    print(f"Status: {response.status}")
    print()
    
    print("USAGE STATISTICS:")
    print("-" * 40)
    usage = response.usage
    print(f"Input tokens: {usage.input_tokens:,}")
    print(f"  - Cached tokens: {usage.input_tokens_details.cached_tokens:,}")
    print(f"Output tokens: {usage.output_tokens:,}")
    print(f"  - Reasoning tokens: {usage.output_tokens_details.reasoning_tokens:,}")
    print(f"Total tokens: {usage.total_tokens:,}")
    print()
    
    print("OUTPUT:")
    print("-" * 40)
    
    for i, output_item in enumerate(response.output):
        print(f"\n[{i+1}] {output_item.type.upper()}")
        
        if output_item.type == "file_search_call":
            print(f"Status: {output_item.status}")
            print(f"Queries used: {', '.join(output_item.queries)}")
            print(f"Results found: {len(output_item.results)}")
            
            print("\nTop search results:")
            for j, result in enumerate(output_item.results[:3]):  # Show top 3 results
                print(f"  [{j+1}] Score: {result.score:.4f}")
                print(f"      File: {result.filename}")
                print(f"      Text preview: {result.text}...")
                print()
                
        elif output_item.type == "message":
            print(f"Role: {output_item.role}")
            print(f"Status: {output_item.status}")
            
            for content in output_item.content:
                if content.type == "output_text":
                    print(f"\nAssistant Response:")
                    print(content.text)
                    
                    if content.annotations:
                        print(f"\nFile Citations:")
                        for annotation in content.annotations:
                            if annotation.type == "file_citation":
                                print(f"  - {annotation.filename}")
    
    print("\n" + "="*80)
    print("RAW RESPONSE (for debugging):")
    print("="*80)

format_response(response)