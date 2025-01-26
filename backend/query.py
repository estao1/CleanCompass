import json
from gemini import process_query_from_frontend

def send_query_to_gemini():
    """
    Simulates sending a query collected from the frontend to the Gemini API.
    """
    # Simulated frontend input
    query_data = {
        "starting_location": "Verano Place Housing, 6529 Adobe Cir S, Irvine, CA 92617",
        "ending_location": "University of California, Irvine, 401 E Peltason Dr #2000, Irvine, CA 92697",  # Defaults to starting_location if not provided
        "middle_locations": [],
        "fixed_order": False,  # Middle locations can be reordered
        "preferences": {
            "carbon_emissions": 0.5,  # 50% weight on reducing carbon emissions
            "time": 0,              # 30% weight on saving time
            "cost": 0.5               # 20% weight on saving cost
        },
        "travel_dates": {
            "start_date": "03/10/2025",
            "end_date": "03/11/2025"
        },
        "additional_requests": ""
    }

    # Send the query and process the response
    try:
        response = process_query_from_frontend(query_data)

        # Format the response for readability
        print("Returned Response:", json.dumps(response, indent=2))
    except Exception as e:
        print(json.dumps({"error": str(e)}, indent=2))

if __name__ == "__main__":
    send_query_to_gemini()
