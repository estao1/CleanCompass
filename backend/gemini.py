import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Set the API key
api_key = os.getenv("GEMINI_API_KEY")

genai.configure(api_key=api_key)

# Model configuration
generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain",
}

# Create the generative model instance
model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
)

# Start a chat session
chat_session = model.start_chat(
    history=[
        {
          "role": "user",
          "parts": ["Initialize yourself with the following context: App Name: Green For Nature. Description: A travel advisory web app that incorporates carbon emissions into travel itinerary creation. Users can create accounts that will be stored in the app’s database. Query Page Inputs: 1. Locations the user wants to travel to. 2. A triangle graph selector for balancing carbon emissions, time/distance saved, and cost. 3. Travel dates. 4. AI-generated suggestions for tourist destinations and activities. 5. A text box for user-specific requests for the AI. 6. Advanced Options: A slider that determines how many times the AI (named Gemini) generates travel routes. Core Features and Calculation Process: 1. Gemini will generate multiple travel routes based on the parameters provided on the query page. 2. The travel route with the lowest carbon emission will be automatically selected. 3. The results page will display: Suggested travel routes using the Google Maps API, and a comparison showing what percentage less emissions this route has compared to the most time-efficient route. Prepare to assist with implementing the app's features, generating itinerary suggestions, calculating carbon emissions for routes, and integrating with Google Maps API. Let me know if you need further clarification or assistance with setup details."]
        },
        {
          "role": "model",
          "parts": ["Okay, I'm ready to assist with implementing the Green For Nature app."]
        },
    ]
)

# Send a test message to the model
response = chat_session.send_message("What is an eco-friendly travel plan to the city of Paris?")
print(response.text)
