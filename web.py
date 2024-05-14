import os


'''
https://www.codewithfaraz.com/article/121/20-javascript-games-with-source-code-for-beginners#game-9-2048-game
'''

def get_unique_filename(path):
    """
    Generates a unique filename by appending an incrementing number
    if the file already exists.
    """
    base, ext = os.path.splitext(path)
    counter = 1
    new_path = path
    
    while os.path.exists(new_path):
        new_path = f"{base}-{counter}{ext}"
        counter += 1
    
    return new_path

def create_web_files(folder_path):
    # Create the folder if it doesn't exist
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)
    
    # Define the initial paths for the files
    index_path = os.path.join(folder_path, 'index.html')
    style_path = os.path.join(folder_path, 'style.css')
    script_path = os.path.join(folder_path, 'script.js')
    
    # Get unique paths if files already exist
    index_path = get_unique_filename(index_path)
    style_path = get_unique_filename(style_path)
    script_path = get_unique_filename(script_path)
    
    # Create index.html with basic structure
    index_content = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <script src="script.js"></script>
</body>
</html>'''
    
    with open(index_path, 'w') as file:
        file.write(index_content)
    
    # Create empty style.css
    with open(style_path, 'w') as file:
        file.write('')

    # Create empty script.js
    with open(script_path, 'w') as file:
        file.write('')

# Alias the function for easier use
web = create_web_files







import pytesseract
from PIL import Image

def extract_text_from_image(image_path):
    # Open the image file
    img = Image.open(image_path)
    gray_img = img.convert('L')
    # Specify the path to the Tesseract executable
    pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
    # Use pytesseract to extract text
    text = pytesseract.image_to_string(gray_img)
    return text

ocr = extract_text_from_image

def main(folder_path):
    import os
    import pyperclip as p
    all_text = ""
    g2 = lambda input_path: [os.path.join(input_path, folder) for folder in os.listdir(input_path)] # dirs and files path names
    def remove_empty_lines(text):
        lines = text.split('\n')
        non_empty_lines = filter(lambda line: line.strip(), lines)
        return '\n'.join(non_empty_lines)
    file_path_lt = g2(folder_path)
    for file_path in file_path_lt:
        all_text += (ocr(file_path) + '\n')
        print(f"{file_path} extracted.")
    result = remove_empty_lines(all_text)
    p.copy(result)
    print(result)