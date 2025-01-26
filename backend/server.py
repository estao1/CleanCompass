from flask import Flask, request, jsonify
from flask_cors import CORS
from query import send_query_to_gemini

app = Flask(__name__)
cors = CORS(app, origins='*')

@app.route("/testing", methods=['GET'])
def test():
    return {
        'name': "green fn",
        'age': "21",
        "goat": "LeBonBon"
    }

@app.route("/plan_trip", methods=["POST"])
def plan_trip():
    data = request.get_json()
    result = send_query_to_gemini(data)
    # starting_location = data.get("startingLocation")
    # ending_location = data.get("endingLocation")
    # middle_locations = data.get("middleLocations", []) 
    # start_date = data.get("startDate")
    # end_date = data.get("endDate")
    # fix_order = data.get("fixOrder")
    # additional_requests = data.get("additionalRequests")

    print(data.get("fixOrder"))
    print("RESULT:", result)

    return result



if __name__ == "__main__":
    app.run(debug=True)