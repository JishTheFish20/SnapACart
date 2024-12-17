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
from flask import send_from_directory


app = Flask(__name__, static_folder='website/build')
CORS(app)

# Load a model
model = YOLO("yolo11n-cls.pt")  # Load a pretrained model (recommended for training)
names = model.names

# Global variables to store the last detected class and confidence
last_detected_class = "No Item"
last_detection_confidence = 0
last_detection_time = datetime.now()
currentUser = ""

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
    global currentUser
    data = request.json
    username = data.get('username')
    password = data.get('password')

    # Verify credentials
    user = Login.query.filter_by(username=username).first()
    
    if user and bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
        currentUser = username
        return jsonify({"message": "Login successful"}), 200
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/catalog', methods=['GET'])
def get_catalog():
    items = Catalog.query.all()
    items_list = [
        {
            "id": item.id,
            "name": item.itemName,
            "price": item.itemPrice,
            "img": item.itemURL
        }
        for item in items
    ]
    print("Catalog Data Sent:", items_list)
    return jsonify(items_list), 200

@app.route('/getItem', methods=['GET'])
def get_item():
    name = request.args.get('name')  # Get the 'name' parameter from the query string

    # Filter items by the given name
    item = Catalog.query.filter_by(itemName=name).first()

    if not item:
    # Create a list of dictionaries for the JSON response
        item = {
                "id": 999,
                "name": name,
                "price": 8.99,
                "img": "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/230ac8d3-54fe-47f6-8c5a-8e7e383080df/dfs0z7t-3aac49bd-c9e3-4ec7-b68b-d3eb03276cd6.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzIzMGFjOGQzLTU0ZmUtNDdmNi04YzVhLThlN2UzODMwODBkZlwvZGZzMHo3dC0zYWFjNDliZC1jOWUzLTRlYzctYjY4Yi1kM2ViMDMyNzZjZDYucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.t4TM9ftTTxg_ywYMczWBNbX2Ww9xtQ8lnXrEc1I-ysA"
                }
    else:
        item = {
            "id": item.id,
            "name": item.itemName,
            "price": item.itemPrice,
            "img": item.itemURL
        }
       
    print(item)
    return jsonify(item), 200

@app.route('/checkout', methods=['POST'])
def checkout():
    try:
        current_user = currentUser
        data = request.json

        if not data or 'cart' not in data:
            return jsonify({'success': False, 'message': 'Invalid data'}), 400

        cart = data['cart']

        max_list_id = db.session.query(db.func.max(List.listID)).filter_by(username=current_user).scalar() or 0
        new_list_id = max_list_id + 1

        for item in cart:
            new_item = List(
                username=current_user,  # Assuming current_user is the username
                listID=new_list_id,  # Assign a listID (can be generated or predefined)
                itemid=item['id']  # Use the item's ID from the cart
            )
            db.session.add(new_item)

        db.session.commit()
        return jsonify({'success': True, 'message': 'Checkout successful'}), 200

    except Exception as e:
        db.session.rollback()
        print("Error during checkout:", str(e))
        return jsonify({'success': False, 'message': 'Checkout failed'}), 500

@app.route('/transactions', methods=['GET'])
def get_transactions():
    try:
        # Use the globally tracked `currentUser` to identify the user
        current_user = currentUser
        
        if not current_user:
            return jsonify({'error': 'No user logged in'}), 403
        
        # Fetch all lists associated with the user
        transactions = List.query.filter_by(username=current_user).all()
        
        # Group items by listID
        grouped_transactions = {}
        for transaction in transactions:
            item = Catalog.query.filter_by(itemid=transaction.itemid).first()
            if item:
                if transaction.listID not in grouped_transactions:
                    grouped_transactions[transaction.listID] = {
                        "id": transaction.listID,
                        "date": transaction.id,  # Assuming `id` is a proxy for date; replace with a timestamp field if available
                        "items": [],
                        "total": 0.0
                    }
                grouped_transactions[transaction.listID]["items"].append(item.itemName)
                grouped_transactions[transaction.listID]["total"] += item.itemPrice
        
        # Convert grouped data to a list for JSON response
        grouped_transactions_list = list(grouped_transactions.values())

        return jsonify(grouped_transactions_list), 200

    except Exception as e:
        print("Error retrieving transactions:", str(e))
        return jsonify({'error': 'Failed to fetch transactions'}), 500


    except Exception as e:
        print("Error retrieving transactions:", str(e))
        return jsonify({'error': 'Failed to fetch transactions'}), 500




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
        return jsonify({'item': "No Item"})
    else:
        last_detected_class = itemName
        return jsonify({'item': itemName})

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
