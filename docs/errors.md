# Errors

Errors return a non-2xx status and a JSON body with an `error` object:

```json
{ "error": { "message": "email is required" } }
```

## Status codes

| Code | Meaning |
| --- | --- |
| `400 Bad Request` | The request body or query is invalid (e.g. missing `email`). |
| `401 Unauthorized` | Missing or invalid API key. |
| `403 Forbidden` | The key is not allowed to perform this action (e.g. a publishable key on a non-create endpoint). |
| `404 Not Found` | No contact with that id. |
