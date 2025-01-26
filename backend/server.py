from flask import Flask, request, jsonify
from flask_cors import CORS

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
    print(data)
    starting_location = data.get("startingLocation")
    ending_location = data.get("endingLocation")
    middle_locations = data.get("middleLocations", []) 
    start_date = data.get("startDate")
    end_date = data.get("endDate")
    fix_order = data.get("fixOrder")
    additional_requests = data.get("additionalRequests")

    print(data.get("fixOrder"))

    return jsonify({
        "message": "Trip plan received!",
        "starting_location": starting_location,
        "middle_locations": middle_locations,
        "ending_location": ending_location,
        "start_date": start_date,
        "end_date": end_date,
        "fix_order": fix_order,
        "additional_requests": additional_requests
    })



if __name__ == "__main__":
    app.run(debug=True)