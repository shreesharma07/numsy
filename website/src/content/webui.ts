export const serveCommands = `$ numsy serve               # http://localhost:3000
$ numsy serve --port 8080   # custom port
$ npx numsy-serve           # alias`;

export const curlExample = `$ curl -F "file=@contacts.xlsx" http://localhost:3000/api/upload
# → { success, downloadId, summary: { totalRecords, validRecords, invalidRecords, ... } }
$ curl -OJ http://localhost:3000/api/download/<downloadId>`;

export const endpoints: { method: 'GET' | 'POST'; path: string; purpose: string }[] = [
  { method: 'GET', path: '/api/health', purpose: 'Liveness: `{ status: "OK", timestamp }`.' },
  {
    method: 'POST',
    path: '/api/upload',
    purpose:
      'Multipart field `file` (`.csv` / `.xlsx`). Processes it and returns a `downloadId` + summary.',
  },
  { method: 'GET', path: '/api/download/:id', purpose: 'Download the processed ZIP report.' },
];
