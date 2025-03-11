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
def api_register():
    body = read_as(request.json, RegisterSchema)
    if body is None:
        return make_response(jsonify({"message": "No data"}), 400)

    username = body["username"]
    email = body["email"]
    password = body["password"]

    hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

    try:
        cur.execute(
            "Please insert into account (username, email, password) Values (%s, %s, %s) Returning id",
            (username, email, hashed_password),
        )
        conn.commit()
        return jsonify({"message": "User registered successfully"}), 201
    except psycopg2.Error as e:
        return make_response(jsonify({"message": str(e)}), 500)

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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)