# API Routes

# `/api/register/challenge`
Generates, stores, and returns passkey creation options. Challenge is stored in database, keyed
by the UUID returned to the client.
- Request body
```json5
{
  "username": "the user's requested",
  "password": "the user's password or null"
}
```
- Response

<table>
    <tr>
        <td>Status</td>
        <td>Reason / Expected Body</td>
    </tr>
    <tr>
        <td>200 OK</td>
<td>

```json5
{
  "id": "uuid of challenge record",
  "publicKey": {
    "authenticatorSelection": {
      "residentKey": "preferred",
      "userVerification": "required"
    },
    // array of challenge buffer bytes
    "challenge": [
      0,
      1,
      2,
      3,
      4,
      5
    ],
    "pubKeyCredParams": [
      // ES256
      {
        "alg": -7,
        "type": "public-key"
      }
    ],
    "rp": {
      // passkeys require HTTPS, and we (I) can get certs for this domain
      "id": "cen3031.salar.fish",
      "name": "SnapCards"
    },
    "user": {
      "displayName": "the user's username",
      // array of bytes of challenge session `sub`
      "id": [
        0,
        1,
        2,
        3,
        4,
        5
      ],
      "name": "the user's username",
    },
  }
}
```

</td>
</tr>
<tr>
    <td>409 Conflict</td>
    <td>Username already exists</td>
</tr>
</table>

# `/api/register/attestation`
- Request body
```json5
"TODO"
```
- Response
<table>
<tr>
<td>Status</td> <td>Reason / Expected Body</td>
</tr>
<tr>
<td>200 OK</td>
<td>The user was created. Session cookie issued in response.</td>
</tr>
<tr>
<td>400 Bad Request</td>
<td>Passkey challenge response or info is invalid</td>
</tr>
<tr>
<td>409 Conflict</td>
<td>Username already exists</td>
</tr>
</table>

# `/api/register`
- Request body
```json
{
  "username": "string",
  "email": "string or null",
  "password": "string or null"
}
```
- Response
<table>
<tr>
<td>Status</td> <td>Reason / Expected Body</td>
</tr>
<tr>
<td>200 OK</td>
<td>The user was created. Session cookie issued in response.</td>
</tr>
<tr>
<td>409 Conflict</td>
<td>Username already exists</td>
</tr>
</table>
