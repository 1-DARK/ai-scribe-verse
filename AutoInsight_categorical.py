# /// script
# requires-python = ">=3.9"
# dependencies = [
#   "pandas",
#   "seaborn",
#   "matplotlib",
#   "numpy",
#   "scipy",
#   "scikit-learn",
#   "fastapi",
#   "uvicorn",
#   "python-multipart",
#   "openpyxl",
#   "transformers",
#   "accelerate",
#   "torch",
# ]
# ///

import pandas as pd # type: ignore
import numpy as np # type: ignore
import seaborn as sns   # type: ignore
import matplotlib.pyplot as plt # type: ignore
import json # type: ignore
import base64
from io import BytesIO
from fastapi import FastAPI, UploadFile, File, HTTPException # type: ignore
from fastapi.responses import HTMLResponse # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore
from transformers import pipeline # type: ignore
import torch # type: ignore

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Function to detect categorical columns
def detect_categorical(df):
    categorical = []
    for col in df.columns:
        if df[col].dtype == 'object' or df[col].nunique() < 20:
            categorical.append(col)
    return categorical

# Function to analyze categorical data
def analyze_categorical(df, categorical):
    analysis = {}
    if categorical:
        for col in categorical:
            value_counts = df[col].value_counts()
            analysis[f'{col}_counts'] = value_counts.to_dict()
    missing_values = df[categorical].isnull().sum()
    analysis['missing_values'] = missing_values.to_dict()
    return analysis

# Function to generate visualizations for categorical
def visualize_categorical(df, categorical):
    plots = {}
    for col in categorical[:3]:
        value_counts = df[col].value_counts()
        others_count = value_counts[value_counts == 1].sum()
        value_counts = value_counts[value_counts > 1]
        if others_count > 0:
            value_counts = pd.concat([value_counts, pd.Series([others_count], index=['Others'])])
        fig, ax = plt.subplots(figsize=(10, 6))
        value_counts.plot(kind='bar', ax=ax)
        ax.set_title(f'Bar Plot of {col}')
        buf = BytesIO()
        fig.savefig(buf, format='png')
        buf.seek(0)
        plots[f'bar_{col}'] = base64.b64encode(buf.read()).decode('utf-8')
        plt.close(fig)
    return plots

# Function to generate summary using GPT-2
def generate_summary(df, analysis, categorical):

   
    counts = {
        col.replace("_counts", ""): vals
        for col, vals in analysis.items()
        if col != "missing_values"
    }


    missing = analysis["missing_values"]

    summary_parts = []


    summary_parts.append(
        f"The dataset contains {len(df)} rows and {len(categorical)} categorical columns."
    )

    
    majority_info = {}
    for col, dist in counts.items():
        if dist:
            sorted_vals = sorted(dist.items(), key=lambda x: x[1], reverse=True)
            top = sorted_vals[0] 
            majority_info[col] = top

    if majority_info:
        majority_str = ", ".join(
            [f"{col}: {val[0]} ({val[1]} rows)" for col, val in majority_info.items()]
        )
        summary_parts.append(
            f"Most columns have clear majority categories such as: {majority_str}."
        )
    else:
        summary_parts.append("The dataset does not show clear dominant categories.")


    rare_info = {}
    for col, dist in counts.items():
        rare = [k for k, v in dist.items() if v == 1]
        if rare:
            rare_info[col] = rare

    if rare_info:
        rare_str = ", ".join(
            [f"{col}: [{', '.join(vals)}]" for col, vals in rare_info.items()]
        )
        summary_parts.append(
            f"Some columns contain rare categories occurring only once, such as: {rare_str}."
        )
    else:
        summary_parts.append("No extremely rare categories were detected.")

   
    total_missing = sum(missing.values())
    if total_missing == 0:
        summary_parts.append("There are no missing values in the categorical columns.")
    else:
        summary_parts.append(
            f"The dataset contains {total_missing} missing values across categorical columns."
        )


    summary_parts.append(
        "Overall, the dataset is clean and suitable for exploratory analysis or simple classification tasks."
    )

    return " ".join(summary_parts)


@app.post("/analyze")
async def analyze_file(file: UploadFile = File(...)):
    if not file.filename.endswith(('.csv', '.xlsx')):
        raise HTTPException(status_code=400, detail="File must be CSV or XLSX")
    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file.file, encoding='ISO-8859-1')
        elif file.filename.endswith('.xlsx'):
            df = pd.read_excel(file.file)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")

    categorical = detect_categorical(df)
    if not categorical:
        raise HTTPException(status_code=400, detail="No categorical columns detected. Use numerical analyzer.")

    analysis = analyze_categorical(df, categorical)
    plots = visualize_categorical(df, categorical)
    summary = generate_summary(df, analysis, categorical)

    response = {
        "dataset_preview": df.head().to_dict(orient='records'),
        "column_types": {
            "categorical": categorical
        },
        "analysis": {
            "value_counts": {k: v for k, v in analysis.items() if k != 'missing_values'},
            "missing_values": analysis['missing_values']
        },
        "plots": plots,
        "summary": summary
    }

    return response

@app.get("/", response_class=HTMLResponse)
async def root():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>AutoInsight Categorical</title>
    </head>
    <body>
        <h1>AutoInsight Categorical Tool</h1>
        <p>Upload a CSV or XLSX file with categorical data for analysis.</p>
        <form action="/analyze" method="post" enctype="multipart/form-data">
            <input type="file" name="file" accept=".csv,.xlsx" required>
            <button type="submit">Analyze</button>
        </form>
    </body>
    </html>
    """

if __name__ == "__main__":
    import uvicorn   # pyright: ignore[reportMissingImports]
    uvicorn.run(app, host="0.0.0.0", port=8002)


##  python3 -m uvicorn AutoInsight_categorical:app --reload --port 8002