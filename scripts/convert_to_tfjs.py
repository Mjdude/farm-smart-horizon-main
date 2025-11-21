import sys
import os

# Compatibility shim for numpy
import numpy as np
if not hasattr(np, "object"):
    np.object = object
if not hasattr(np, "bool"):
    np.bool = bool

try:
    import tensorflow as tf
    import tensorflowjs as tfjs
except Exception as e:
    print("Import error:", e)
    print("Make sure you've installed: pip install tensorflow==2.13.0 tensorflowjs==4.0.0")
    sys.exit(1)

SRC = r"C:\Projects\farm-smart-horizon\best_phase2.weights.h5"
OUT = r"C:\Projects\farm-smart-horizon\public\models\crop_model"

os.makedirs(OUT, exist_ok=True)

print(f"Loading Keras model from: {SRC}")
try:
    model = tf.keras.models.load_model(SRC)
    print("Model loaded successfully!")
    print(f"Model input shape: {model.input_shape}")
    print(f"Model output shape: {model.output_shape}")
    
    print(f"\nConverting to TensorFlow.js format...")
    tfjs.converters.save_keras_model(model, OUT)
    print(f"✓ Conversion complete!")
    print(f"✓ Model saved to: {OUT}")
    print(f"✓ Check for model.json and weight files in that directory")
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
