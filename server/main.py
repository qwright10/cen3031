from dotenv import load_dotenv
from os import getenv

from marshmallow import Schema, fields

load_dotenv()

from body import read_as

from flask import Flask, request, make_response
import psycopg2
import json

app = Flask(__name__)

conn = psycopg2.connect(f"dbname=cen3031 user=cen3031 password={getenv("PG_PASSWORD")} host=vm1.in.salar.fish")
cur = conn.cursor()

@app.route("/")
def index():
    cur.execute("SELECT * FROM account;")
    results = cur.fetchall()
    return json.dumps(results)

class RegisterSchema(Schema):
    username = fields.String()
    email = fields.String(allow_none=True)
    password = fields.String(allow_none=True)

@app.route("/api/register", methods=["POST"])
def api_register():
    body = read_as(request.json, RegisterSchema)
    if body is None:
        return make_response(None, 400)



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)