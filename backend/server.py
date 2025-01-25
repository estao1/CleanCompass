from flask import Flask
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

if __name__ == "__main__":
    app.run(debug=True)