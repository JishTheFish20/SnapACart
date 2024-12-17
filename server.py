import json
from flask import Flask, jsonify, request, render_template, send_from_directory, Response
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from ultralytics import YOLO
import cv2
from datetime import datetime
import numpy as np
import base64
from PIL import Image
import io
import bcrypt


app = Flask(__name__, static_folder='website/build')
CORS(app)

# Load a model
model = YOLO("yolo11n-cls.pt")  # Load a pretrained model (recommended for training)
names = model.names

# Global variables to store the last detected class and confidence
last_detected_class = "No Item"
last_detection_confidence = 0
last_detection_time = datetime.now()

class_threshold = 0.5  # Threshold for detection confidence
reset_time_limit = 5  # Time in seconds to wait before considering the object gone

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///databases.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
admin = Admin(app, name='Admin Page', template_mode='bootstrap3')

app.config['SECRET_KEY'] = '9/11'

class Login(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80),nullable=False, unique = True)
    password = db.Column(db.String(200), nullable=False)
    

class Catalog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    itemid = db.Column(db.Integer, nullable=False)
    itemName = db.Column(db.String(80), nullable=False)
    itemPrice = db.Column(db.Float, nullable=False)
    itemURL = db.Column(db.String(80), nullable=False)

class List(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.Integer, nullable=False)
    listID = db.Column(db.Integer, nullable=False)
    itemid = db.Column(db.Integer, nullable=False)

with app.app_context():
    db.create_all()

admin.add_view(ModelView(Login, db.session))
admin.add_view(ModelView(Catalog, db.session))
admin.add_view(ModelView(List, db.session))

@app.route('/')
def serve_react_app():
    return send_from_directory(app.static_folder, 'index.html')

# Serve other static files (JS, CSS, etc.)
@app.route('/<path:path>')
def static_proxy(path):
    return send_from_directory(app.static_folder, path)

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Invalid username or password"}), 400

    if Login.query.filter_by(username=username).first():
        return jsonify({"error": "User already exists"}), 400
    
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    new_user = Login(username=username, password=hashed_password.decode('utf-8'))
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User registered successfully"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    # Verify credentials
    user = Login.query.filter_by(username=username).first()
    
    if user and bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
        return jsonify({"message": "Login successful"}), 200
    return jsonify({"error": "Invalid credentials"}), 401


@app.route('/consent', methods=['POST'])
def set_consent():
    global user_consent
    data = request.json
    user_consent = data.get('consent', False)  # Update consent status
    return jsonify({"message": "Consent updated", "consent": user_consent}), 200

@app.route('/predict', methods=['POST'])
def predict():
    global last_detected_class
    # Get the image data from the request
    data = request.get_json()
    image_data = data['image']
    
    # Convert the base64 image to a PIL image
    image_data = image_data.split(',')[1]  # Remove base64 header
    image_bytes = io.BytesIO(base64.b64decode(image_data))
    img = Image.open(image_bytes)
    
    # Convert PIL image to OpenCV format (BGR)
    img = np.array(img)
    img = img[..., ::-1]  # Convert RGB to BGR
    
    # Run inference on the image using YOLO model
    results = model(img)  # This will automatically detect objects
    
    probs = results[0].probs
    itemName = names[probs.top1]
    itemConfidence = probs.top1conf
    print(names[probs.top1])
    print(probs.top1conf)

    if(itemConfidence < 0.5 or last_detected_class == itemName):
        last_detected_class = "No Item"
        return jsonify({'predictions': "No Item"})
    else:
        last_detected_class = itemName
        return jsonify({'predictions': itemName})

@app.route('/current_class')
def current_class():
    results = model(source=0)
    last_detected_class = results.top1
    last_detection_confidence = results.top1conf

    # Expose the current detected class and confidence
    if last_detected_class and last_detection_confidence >= class_threshold:
        return jsonify({"class": last_detected_class, "confidence": last_detection_confidence})
    else:
        return jsonify({"class": None, "confidence": 0}), 200


if __name__ == '__main__':
    app.run(debug=True)
