from PIL import Image
import pytesseract
import os

base_image = '/home/lucky/Pictures/ig3.png';

def read_text_from_image(image_path):
    try:
        img = Image.open(image_path)
        text = pytesseract.image_to_string(img)
        text = text.replace('\n', ' ')
        text = text.replace('  ', '')
        text = text.replace(' ', ',')

        print(text);
    except Exception as e:
        raise Exception('Failed to extract text from image, probably caused by img not found error.')

read_text_from_image(base_image)