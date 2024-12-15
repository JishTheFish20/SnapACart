import json
from flask import Flask, jsonify, request, render_template, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView

app = Flask(__name__, static_folder='website/build')
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///databases.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
admin = Admin(app, name='Admin Page', template_mode='bootstrap3')

app.config['SECRET_KEY'] = '9/11'

class Login(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80),nullable=False)
    password = db.Column(db.String(80), nullable=False)
    

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

if __name__ == '__main__':
    app.run(debug=True, port=5000)

