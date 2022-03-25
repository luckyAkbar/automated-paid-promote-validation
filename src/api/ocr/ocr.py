from PIL import Image
import pytesseract
import os

base_path = '/app/uploads/';

def read_text_from_image(image_name):
    try:
        img = Image.open(base_path + image_name)
        text = pytesseract.image_to_string(img)
        text = text.replace('\n', ' ')
        text = text.replace('  ', '')
        text = text.replace(' ', ',')

        return text
    except Exception as e:
        raise Exception('Failed to extract text from image, probably caused by img not found error.')
