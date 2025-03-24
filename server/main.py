from dotenv import load_dotenv
from os import getenv

from marshmallow import Schema, fields

from flask import Flask, request, jsonify, make_response
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS

from body import read_as

import psycopg2
import json
import bcrypt

load_dotenv()
app = Flask(__name__)
CORS(app)

conn = psycopg2.connect(f"dbname=cen3031 user=cen3031 password={getenv("PG_PASSWORD")} host=vm1.in.salar.fish")
cur = conn.cursor()

app.config["JWT_SECRET_KEY"] = "Key_Placeholder"
jwt = JWTManager(app)

class RegisterSchema(Schema):
    username = fields.String(required=True)
    email = fields.String(required=True)
    password = fields.String(required=True)

@app.route("/api/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({"error": "Missing required fields"}), 400

    cur.execute("SELECT id FROM account WHERE username = %s;", (username,))
    if cur.fetchone():
        return jsonify({"error": "Username already taken"}), 400

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    cur.execute(
        "INSERT INTO account (username, email, password) VALUES (%s, %s, %s) RETURNING id;",
        (username, email, hashed_password)
    )
    conn.commit()

    return jsonify({"message": "User registered successfully"}), 201

@app.route("/api/login", methods=["POST"])
def api_login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    cur.execute("Select id, password FROM account WHERE username = %s", (username,))
    user = cur.fetchone()

    if user and bcrypt.checkpw(password.encode("utf-8"), user[1].encode("utf-8")):
        access_token = create_access_token(identity=user[0]) # JWT Token With user ID
        return jsonify({"access_token": access_token}), 200
    return jsonify({"message": "Invalid username or password"}), 401

@app.route("/api/protected", methods=["GET"])
@jwt_required
def protected():
    user_id = get_jwt_identity()
    return jsonify({"message": f"Welcome user {user_id}!"}), 200
@app.route("/")
def index():
    cur.execute("SELECT * FROM account;")
    results = cur.fetchall()
    return json.dumps(results)

@app.route("/api/profile", methods=["GET"])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()

    # Fetch user details from database
    cur.execute("SELECT username, email FROM account WHERE id = %s;", (user_id,))
    user = cur.fetchone()

    if user:
        return jsonify({"username": user[0], "email": user[1]}), 200
    return jsonify({"message": "User not found"}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)