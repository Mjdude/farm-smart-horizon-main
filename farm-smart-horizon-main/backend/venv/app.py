from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from tensorflow.keras.models import load_model
from PIL import Image
import io
import os

app = Flask(__name__)
CORS(app)

# Global variables
model = None
CLASS_LABELS = []

def load_disease_model():
    global model, CLASS_LABELS
    try:
        model = load_model("plant_disease_model.h5")
        
        # These should match your training data classes
        CLASS_LABELS = [
            'Pepper__bell___Bacterial_spot', 'Pepper__bell___healthy',
            'Potato___Early_blight', 'Potato___Late_blight', 'Potato___healthy',
            'Tomato_Bacterial_spot', 'Tomato_Early_blight', 'Tomato_Late_blight',
            'Tomato_Leaf_Mold', 'Tomato_Septoria_leaf_spot',
            'Tomato_Spider_mites_Two_spotted_spider_mite', 'Tomato__Target_Spot',
            'Tomato__Tomato_YellowLeaf__Curl_Virus', 'Tomato__Tomato_mosaic_virus',
            'Tomato_healthy'
        ]
        print("Model loaded successfully")
        return True
    except Exception as e:
        print(f"Error loading model: {e}")
        return False

def preprocess_image(image_file):
    try:
        # Read and process the uploaded image
        image = Image.open(image_file)
        
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize to match training dimensions (128x128)
        image = image.resize((128, 128))
        
        # Convert to numpy array and normalize
        img_array = np.array(image)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = img_array / 255.0
        
        return img_array
    except Exception as e:
        print(f"Image preprocessing error: {e}")
        return None

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'API is running', 'model_loaded': model is not None})

@app.route('/api/predict', methods=['POST'])
def predict_disease():
    try:
        # Check if image is in request
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        image_file = request.files['image']
        
        if image_file.filename == '':
            return jsonify({'error': 'No image selected'}), 400
        
        # Load model if not loaded
        if model is None:
            if not load_disease_model():
                return jsonify({'error': 'Model failed to load'}), 500
        
        # Preprocess the image
        processed_image = preprocess_image(image_file)
        if processed_image is None:
            return jsonify({'error': 'Failed to process image'}), 400
        
        # Make prediction
        predictions = model.predict(processed_image)
        predicted_class_index = np.argmax(predictions, axis=1)[0]
        confidence = float(np.max(predictions))
        
        # Get disease name
        predicted_disease = CLASS_LABELS[predicted_class_index]
        
        # Get treatment recommendation
        treatment = get_treatment(predicted_disease)
        
        return jsonify({
            'success': True,
            'disease': predicted_disease,
            'confidence': round(confidence * 100, 2),
            'treatment': treatment,
            'recommendations': get_recommendations(predicted_disease)
        })
        
    except Exception as e:
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

def get_treatment(disease_name):
    treatments = {
        'Pepper__bell___Bacterial_spot': 'Apply copper-based bactericide spray every 7-10 days',
        'Pepper__bell___healthy': 'Plant is healthy - continue regular care',
        'Potato___Early_blight': 'Use fungicide with chlorothalonil, remove affected leaves',
        'Potato___Late_blight': 'Apply copper fungicide immediately, improve drainage',
        'Potato___healthy': 'Potato plant is healthy - maintain current care',
        'Tomato_Bacterial_spot': 'Use copper spray, avoid overhead watering',
        'Tomato_Early_blight': 'Apply preventive fungicide spray',
        'Tomato_Late_blight': 'Emergency treatment - copper fungicide needed',
        'Tomato_Leaf_Mold': 'Improve air circulation, reduce humidity',
        'Tomato_healthy': 'Tomato plant is healthy - continue regular care'
    }
    return treatments.get(disease_name, 'Consult local agricultural expert')

def get_recommendations(disease_name):
    if 'healthy' in disease_name.lower():
        return ['Continue current care routine', 'Monitor regularly', 'Maintain proper watering']
    else:
        return ['Remove affected leaves', 'Improve air circulation', 'Apply recommended treatment', 'Monitor closely']

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'message': 'FarmLive Disease Detection API',
        'endpoints': {
            'health': '/src/ai',
            'predict': '/src/farm (POST with image)'
        }
    })

if __name__ == '__main__':
    # Load model on startup
    load_disease_model()
    app.run(debug=True, host='0.0.0.0', port=5000)