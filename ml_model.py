from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from textblob import TextBlob

app = FastAPI()

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow any frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextData(BaseModel):
    text: str

@app.post("/predict")
async def predict(data: TextData):
    blob = TextBlob(data.text)
    polarity = blob.sentiment.polarity

    if polarity > 0.1:
        label = "Positive"
    elif polarity < -0.1:
        label = "Negative"
    else:
        label = "Neutral"

    return {"sentiment": label, "score": polarity}


@app.post("/predictes")
async def predictes(data: TextData):

    text_lower = data.text.lower().strip()

    custom_sentiments = {
        "love you": 0.95,
        "i love": 0.9,
        "hate you": -0.99,
        "i hate": -0.95,
        "amazing": 0.85,
        "terrible": -0.8,
    }

    # Check custom keywords
    for phrase, score in custom_sentiments.items():
        if phrase in text_lower:
            label = "Very Positive" if score > 0.5 else "Very Negative"
            return {"sentiment": label, "score": score}

    # fallback → TextBlob sentiment
    blob = TextBlob(data.text)
    polarity = blob.sentiment.polarity

    if polarity > 0.1:
        label = "Positive"
    elif polarity < -0.1:
        label = "Negative"
    else:
        label = "Neutral"

    return {"sentiment": label, "score": polarity}
