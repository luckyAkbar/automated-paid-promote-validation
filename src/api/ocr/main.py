from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

from ocr import read_text_from_image

app = FastAPI()

class Images(BaseModel):
  image_names: List[str]

@app.post("/")
def root(images: Images):
  ocr_results = []

  try:
    for image_name in images.image_names:
      ocr_reading = read_text_from_image(image_name)
      ocr_results.append(ocr_reading)
  except Exception as e:
    print(e)
    return {"result": []}

  return {"result": ocr_results}
  