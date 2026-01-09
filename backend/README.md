# Digital Approval Backend (Node.js)

This is a Node.js-based REST API for generating secure digital approvals with verifiable QR codes.

## Prerequisites
*   Node.js installed.

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Start the Server**:
    ```bash
    npm start
    ```
    The server will run at `http://localhost:3000`.

## API Endpoints

### 1. Generate Keys (`GET /generate-keys`)
Generates a fresh pair of RSA Public/Private keys in the `keys/` directory.
*   **Usage**: Call this once to set up your authority keys.
*   **Response**: `{"message": "Keys generated successfully."}`

### 2. Sign Document (`POST /sign`)
Signs a JSON payload and generates a PDF with a verification QR code.
*   **Body**: JSON object with the document details.
    ```json
    {
      "applicant": "John Doe",
      "status": "APPROVED",
      "date": "2026-01-01"
    }
    ```
*   **Response**: Returns the `signature` and path to the generated PDF.

### 3. Verify Document (`POST /verify`)
Verifies if a document and signature are authentic.
*   **Body**:
    ```json
    {
      "data": { ...original data... },
      "sig": "...signature string..."
    }
    ```
*   **Response**: `{"status": "VALID", "message": "..."}` or `{"status": "INVALID"}`

## Testing
Run the automated end-to-end test script:
```bash
node test_flow.js
```
