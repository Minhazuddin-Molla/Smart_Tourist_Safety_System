from google import generativeai
import os
generativeai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = generativeai.GenerativeModel("gemini-2.5-pro")
response = model.generate_content("Why is the sky blue?")
print(response.text)