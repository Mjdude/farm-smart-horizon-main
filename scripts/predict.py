#!/usr/bin/env python3
import sys
import json
import os

try:
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
    import tensorflow as tf
    import numpy as np
    from PIL import Image
    
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
        sys.exit(1)
    
    image_path = sys.argv[1]
    # Try multiple possible model paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    
    possible_paths = [
        os.path.join(project_root, 'public/models/best_phase2.weights.h5'),
        os.path.join(project_root, 'best_phase2.weights.h5'),
        'public/models/best_phase2.weights.h5',
        'best_phase2.weights.h5'
    ]
    
    model_path = None
    for path in possible_paths:
        if os.path.exists(path):
            model_path = path
            break
    
    if not model_path:
        raise FileNotFoundError(f"Model not found. Tried: {possible_paths}")
    
    # Load model
    model = tf.keras.models.load_model(model_path)
    
    # Load and preprocess image
    img = Image.open(image_path).convert('RGB')
    img = img.resize((224, 224))
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    
    # Make prediction
    predictions = model.predict(img_array, verbose=0)
    scores = predictions[0].tolist()
    
    max_score = max(scores)
    max_index = scores.index(max_score) if isinstance(scores, list) else int(np.argmax(scores))
    
    crop_classes = ['Healthy', 'Diseased', 'Pest Infected', 'Nutrient Deficiency']
    predicted_class = crop_classes[max_index] if max_index < len(crop_classes) else f'Class {max_index}'
    
    result = {
        "prediction": predicted_class,
        "confidence": f"{max_score * 100:.2f}",
        "scores": scores
    }
    
    print(json.dumps(result))
    
except Exception as e:
    error_result = {
        "error": str(e)
    }
    print(json.dumps(error_result))
    sys.exit(1)
