import json
from ai_api import process_openai_query

def send_query_to_openai(data):
    """
    Simulates sending a query collected from the frontend to the Gemini API.
    """
    query_data = {
        "starting_location": data.get("startingLocation"),
        "ending_location": data.get("endingLocation"),
        "middle_locations": data.get("middleLocations", []),
        "fixed_order": data.get("fixOrder"),
        "preferences": {
            "carbon_emissions": 0.5,
            "time": 0.25,
            "cost": 0.25,
        },
        "travel_dates": {
            "start_date": data.get("startDate"),
            "end_date": data.get("endDate"),
        },
        "additional_requests": data.get("additionalRequests")
    }

    # Send the query and process the response
    try:
        response = process_openai_query(query_data)
        result = json.dumps(response, indent=2)
        # Format the response for readability
        print("Returned Response:", result)
        return result

    except Exception as e:
        print(json.dumps({"error": str(e)}, indent=2))
