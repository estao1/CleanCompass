import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Set the API key
api_key = os.getenv("GEMINI_API_KEY")

# Ensure the API key is set
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in environment variables.")

# Configure the Gemini API
genai.configure(api_key=api_key)

# Model configuration
generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain",
}

def process_gemini_query(data):
    """
    Processes a query based on frontend input and interacts with the Gemini API.
    
    Args:
        data (dict): Input data collected from the frontend.
            Expected keys: starting_location, ending_location, middle_locations, fixed_order,
            preferences, travel_dates, additional_requests.
    
    Returns:
        dict: Parsed JSON response from Gemini.
    """
    # Extract values from the input data
    print("PREF:", data.get("preferences", 0))

    starting_location = data.get("starting_location", "No starting location provided")
    ending_location = data.get("ending_location", starting_location)  # Default to starting location if not provided
    middle_locations = data.get("middle_locations", [])
    fixed_order = data.get("fixed_order", True)  # Whether the middle locations have a fixed order
    preferences = data.get("preferences", {"carbon_emissions": 0.5, "time": 0.25, "cost": 0.25})  # Triangle graph
    travel_dates = data.get("travel_dates", {"start_date": "01/01/2025", "end_date": "01/10/2025"})
    additional_requests = data.get("additional_requests", "No additional requests")

    # Construct the context describing the user’s request
    context = (
        f"App Name: Green For Nature. Description: A travel advisory app focusing on sustainable travel by "
        f"considering carbon emissions, travel time, and cost.\n\n"
        f"The user has entered:\n"
        f"- Starting Location: {starting_location}\n"
        f"- Ending Location: {ending_location}\n"
        f"- Middle Locations: {', '.join(middle_locations) if middle_locations else 'None'}\n"
        f"- Fixed Order for Middle Locations: {'Yes' if fixed_order else 'No'}\n"
        f"- Travel Preferences: Carbon Emissions = {preferences.get('carbon_emissions', 0):.2f}, "
        f"Time = {preferences.get('time', 0):.2f}, Cost = {preferences.get('cost', 0):.2f}\n"
        f"- Travel Dates: {travel_dates['start_date']} to {travel_dates['end_date']}\n"
        f"- Additional Requests: {additional_requests}\n\n"
        f"IMPORTANT REQUIREMENTS:\n"
        f"1. All locations (starting, middle, ending) MUST appear in each route. No exceptions.\n"
        f"2. Modes of transportation are ONLY: TRANSIT, WALKING, DRIVING, FLIGHT, BICYCLING. Must be these modes and not something related such as car or train. Also must be in all caps.\n"
        f"3. Use the most appropriate modes STRICTLY based on SAVING time, carbon emissions, and cost based on the input data weight percentages.\n"
        f"   For example, if the carbon emissions preference input value is 1, the travel plan should be as eco-friendly as possible. 0 means it is not considered at all.\n"
        f"   The higher the Cost and/or Carbon percentages are the more it should be biking or walking as long as it's not unreasonable, such as walking/biking for several hours.\n"
        f"4. Only if the chosen mode is walking and the walking distance is more than 1.5 miles, the mode MUST be cycling no exceptions.\n"
        f"5. If 'fixed_order' is True, ALL locations MUST remain in the SAME given order as the input data.\n"
        f"6. If 'fixed_order' is False, you may reorder ONLY the middle locations. Starting and Ending Location must stay at the first and last elements in the returned list.\n"
        f"7. The output MUST be in the following strict format:\n\n"
            "[\n"
            "  { location: \"<Location Name>\", mode: \"<Mode of Transport>\" },\n"
            "  ...\n"
            "];\n\n"
        f"8. The output list's order of elements MUST be the order of the ideal travel route based on the input data.\n"
        f"9. No additional keys or data are allowed (e.g., coordinates, emissions, score, notes, cost). The 'locations' array must "
        f"contain all required locations in order for that route. The 'mode' key's value MUST indicate the mode of "
        f"transportation for each leg, where the transportation mode indicates from the current location to the next one in the list."
        f"Therefore the transportation mode for the last location in the list is irrelevant and MUST be an empty string.\n"
        f"10.Return EXACTLY ONE route option that is the best travel option based on the input data.\n"
    )

    # Start a chat session
    chat_session = genai.GenerativeModel(
        model_name="gemini-1.5-pro",
        generation_config=generation_config,
    ).start_chat(
        history=[
            {
                "role": "user",
                "parts": [context],
            }
        ]
    )

    # Send a message and get a response
    response = chat_session.send_message("Generate the travel itinerary.")

    # Remove backticks and clean the raw response
    raw_response = response.text.strip().strip("```json").strip("```").strip()

    # Try to parse as JSON
    try:
        response_json = json.loads(raw_response)
    except json.JSONDecodeError as e:
        return {
            "error": "Failed to decode JSON",
            "raw_response": raw_response,
            "exception": str(e)
        }

    return response_json
