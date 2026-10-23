# <img src="../../assets/icons/rest.svg" width="28" alt="" /> Web UI & REST API

[Docs](../README.md) › Using Numsy › Web UI & REST API

```bash
numsy serve --port 3000     # or: numsy-serve -p 3000
```

If the port is busy, the next free one is used. Open `http://localhost:3000` for the web UI.

> [!WARNING]
> `numsy serve` is a local tool: CORS is open and it listens on all interfaces. Don't expose it publicly; see [SECURITY.md](../../SECURITY.md).

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/` | Web UI |
| `GET` | `/api` | API info page |
| `GET` | `/api/health` | `{ "status": "OK", "timestamp": "…" }` |
| `GET` | `/api/health-page` | Health page |
| `POST` | `/api/upload` | Process a file (multipart field `file`) |
| `GET` | `/api/download/:id` | Download the ZIP report for a processed file |
| `POST` | `/api/cleanup` | Delete expired files now |

## Upload

```bash
curl -F "file=@contacts.xlsx" http://localhost:3000/api/upload
```

```jsonc
{
  "success": true,
  "message": "File processed successfully",
  "downloadId": "contacts_1761206400000",
  "summary": {
    "totalRecords": 120,
    "validRecords": 112,
    "invalidRecords": 8,
    "phoneColumnDetected": "phone",
    "analytics": { /* totals, duplicates, distribution… */ }
  }
}
```

Then fetch the report:

```bash
curl -OJ http://localhost:3000/api/download/contacts_1761206400000
```

The ZIP holds `<name>_valid_<timestamp>.csv`, `<name>_invalid_<timestamp>.csv` and `<name>_analytics_<timestamp>.txt`.

## Limits & file lifecycle

| Rule | Value |
| --- | --- |
| Accepted types | `.csv`, `.xlsx` (`.xls` passes the filter, but legacy binary files can't be parsed) |
| Max upload size | 50 MB |
| Storage | `uploads/` and `Temp/` under the working directory |
| Retention | Files older than **5 minutes** are deleted; sweep runs every minute |
| On startup | Both directories are emptied |
