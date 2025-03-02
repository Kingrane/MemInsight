from flask import Flask, request, render_template, jsonify
import requests
from mistralai import Mistral
import io
import base64

app = Flask(__name__)

# Получение API ключа
MISTRAL_API_KEY = "cnYW87vD671nFClyTHkFEVOFYSz4FE3m"

#Здесь можно изменить промпт, с которым нейросеть будет работать с мемом
SYSTEM_PROMPT = """
Ты - искусственный интеллект, созданный для анализа изображений и предоставления полезной информации. 
Ты никогда не используешь оскорбительных или неуместных выражений. 
Твоя задача - предоставить точную и полезную информацию на основе анализа изображений.
"""

# Инициализация клиента Mistral
model = "pixtral-12b-2409"
client = Mistral(api_key=MISTRAL_API_KEY)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"})

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"})

    # Считываем файл и кодируем в base64
    file_content = file.read()
    base64_image = base64.b64encode(file_content).decode('utf-8')
    data_url = f"data:{file.mimetype};base64,{base64_image}"

    # Создаем мультимодальный запрос к Pixtral
    try:
        chat_response = client.chat.complete(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Опиши подробно, что ты видишь на этом изображении."},
                        {"type": "image_url", "image_url": {"url": data_url}}
                    ]
                },
            ]
        )
        analysis = chat_response.choices[0].message.content

        return jsonify({
            "message": "Image processed successfully",
            "analysis": analysis
        })
    except Exception as e:
        return jsonify({"error": str(e)})


@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    if not data or 'message' not in data:
        return jsonify({"error": "No message provided"}), 400

    user_input = data['message']
    image_data = data.get('image')

    # Подготовка содержимого сообщения
    content = []

    # Добавляем текстовое сообщение
    content.append({"type": "text", "text": user_input})

    # Если изображение предоставлено, добавляем его
    if image_data:
        content.append({"type": "image_url", "image_url": {"url": image_data}})

    # Отправляем запрос с текстом и (опционально) изображением
    try:
        chat_response = client.chat.complete(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": content
                },
            ]
        )

        response_text = chat_response.choices[0].message.content
        return jsonify({"response": response_text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
