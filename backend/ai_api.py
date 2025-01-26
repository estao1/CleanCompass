import os
import json
import openai
from dotenv import load_dotenv

load_dotenv()

# Set the API key
api_key = os.getenv("OPENAI_API_KEY")

# Ensure the API key is set
if not api_key:
    raise ValueError("OPENAI_API_KEY not found in environment variables.")

# Configure the OpenAI API
openai.api_key = api_key
client = openai.OpenAI()

def process_openai_query(data):
    """
    Processes a query based on frontend input and interacts with the OpenAI API.
    
    Args:
        data (dict): Input data collected from the frontend.
            Expected keys: starting_location, ending_location, middle_locations, fixed_order,
            preferences, travel_dates, additional_requests.
    
    Returns:
        dict: Parsed JSON response from OpenAI.
    """
    # Extract values from the input data
    starting_location = data.get("starting_location", "No starting location provided")
    ending_location = data.get("ending_location", starting_location)  # Default to starting location if not provided
    middle_locations = data.get("middle_locations", [])
    fixed_order = data.get("fixed_order", True)  # Whether the middle locations have a fixed order
    preferences = data.get("preferences", {"carbon_emissions": 0.5, "time": 0.25, "cost": 0.25})  # Triangle graph
    travel_dates = data.get("travel_dates", {"start_date": "01/01/2025", "end_date": "01/10/2025"})
    additional_requests = data.get("additional_requests", "")

    # Construct the context with simplified background information
    context = (
        f"Your task is to create a travel itinerary based on the following details:\n"
        f"- Starting Location: {starting_location}\n"
        f"- Ending Location: {ending_location}\n"
        f"- Middle Locations: {', '.join(middle_locations) if middle_locations else 'None'}\n"
        f"- Fixed Order for Middle Locations: {'Yes' if fixed_order else 'No'}\n"
        f"- Travel Preferences: Carbon Emissions = {preferences.get('carbon_emissions', 0.5):.2f}, "
        f"Time = {preferences.get('time', 0.25):.2f}, Cost = {preferences.get('cost', 0.25):.2f}\n"
        f"- Travel Dates: {travel_dates['start_date']} to {travel_dates['end_date']}\n"
        f"- Additional Requests: {additional_requests}\n"
        f"Important Requirements:\n"
        f"1. All locations (starting, middle, ending) must appear in the route.\n"
        f"2. Only use these modes of transportation: WALKING, DRIVING, FLIGHT, BICYCLING.\n"
        f"3. Optimize the route for the specified preferences (carbon emissions, time, cost).\n"
        f"4. If fixed_order is True, maintain the input order of locations. If False, reorder the middle locations for optimal travel.\n"
        f"5. Return the result in this JSON format with NO extra information or text, no exceptions:\n\n"
        f"{{\n"
        f"  \"stops\": [\n"
        f"    {{ location: \"<Location Name>\", mode: \"<Mode of Transport>\" }},\n"
        f"    ...\n"
        f"  ],\n"
        f"  \"activities\": {{\n"
        f"    \"<Middle or End Location>\": \"<List of popular tourist destinations and activities>\",\n"
        f"    ...\n"
        f"  }}\n"
        f"}}\n\n"
        f"6. The mode of transportation for the last location must be an empty string.\n"
        f"7. If the mode of transportation is WALKING and the distance is over 1.5 miles, the mode MUST be BICYCLING.\n"
        f"8. If the mode of transportation is BICYCLING and the distance is over 3 miles, the mode MUST be DRIVING.\n"
        f"9. If the mode of transportation is DRIVING and the distance is over 800 miles, the mode MUST be FLIGHT.\n"
        f"10. If the mode of transportation is FLIGHT and the distance is under 400 miles, the mode MUST be DRIVING.\n"
    )

    # Interact with the OpenAI API
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "developer", "content": "You are a helpful assistant for planning sustainable travel routes."},
                {"role": "user", "content": context},
            ],
        )

        # Extract and clean the response
        response_text = response.choices[0].message.content.strip("```json").strip("```").strip()
        print("AI_API RESPONSE:", response_text)
        return json.loads(response_text)
    except json.JSONDecodeError as e:
        return {"error": "Failed to decode JSON", "response": response_text, "exception": str(e)}
    except Exception as e:
        return {"error": str(e)}
