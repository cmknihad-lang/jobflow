import json
import ollama
from django.conf import settings

def extract_lead_info(conversation_text: str) -> dict:
    """
    Extract structured lead information from a conversation using Ollama.

    Args:
        conversation_text: Raw conversation text

    Returns:
        dict with keys: customer_name, phone, service, location, preferred_date, requirement
    """

    prompt = f"""Extract structured information from this customer conversation.

CONVERSATION:
{conversation_text}

Extract and return ONLY a JSON object (no markdown, no code blocks) with these fields:
- customer_name: The customer's name (string or null)
- phone: The customer's phone number (string or null)
- service: Type of service requested (string)
- location: Service location (string or null)
- preferred_date: When they want the service (string or null)
- requirement: Summary of what they need (string)

Return ONLY valid JSON."""

    try:
        response = ollama.generate(
            model="mistral",  # or "neural-chat", "llama2" depending on what's installed
            prompt=prompt,
            stream=False,
        )

        # Parse the response
        response_text = response['response'].strip()

        # Try to extract JSON from the response
        try:
            result = json.loads(response_text)
        except json.JSONDecodeError:
            # If JSON parsing fails, try to find JSON in the response
            import re
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
            else:
                # Fallback to basic extraction
                result = {
                    'customer_name': None,
                    'phone': None,
                    'service': '',
                    'location': None,
                    'preferred_date': None,
                    'requirement': conversation_text,
                }

        return result

    except Exception as e:
        print(f"Error calling Ollama: {str(e)}")
        return {
            'customer_name': None,
            'phone': None,
            'service': '',
            'location': None,
            'preferred_date': None,
            'requirement': conversation_text,
        }
