import os

# Force simulator mode for ALL tests to avoid Gemini API rate limits
os.environ["GEMINI_API_KEY"] = ""
