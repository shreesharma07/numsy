# File Upload and Processing Guide

## Recent Updates (March 2026)

### 1. Default Port Changed

- **Old Port**: 68679
- **New Port**: 3000 (safer, more commonly used)
- This change makes the application more accessible and avoids conflicts with other services

### 2. File Size Limit Increased

- **Old Limit**: 10MB
- **New Limit**: 50MB
- Process larger CSV and Excel files with ease

## Starting the Server

### Using NPM/PNPM (Recommended)

```bash
# Start server with default settings
npx @numsy/numsy-serve

# Or with pnpm in development
pnpm run serve

# Start on custom port
npx @numsy/numsy-serve --port 8080

# Serve HTML utility page (recommended for file uploads)
npx @numsy/numsy-serve --page
```

### Server Output

When the server starts successfully, you'll see:

```text
╔═══════════════════════════════════════════════════════════════╗
║               Numsy Server Started Successfully               ║
╚═══════════════════════════════════════════════════════════════╝

🚀 Server running on:       http://localhost:3000
📡 API endpoint:            http://localhost:3000/api
💚 Health check:            http://localhost:3000/api/health
🌐 Utility page:            http://localhost:3000

📝 Environment:            development
⚡ Process ID:             12345
```

## Using the Web Interface

### Step 1: Access the Utility Page

1. Start the server with `npx @numsy/numsy-serve --page`
2. Open your browser and navigate to: `http://localhost:3000`
3. You'll see the Numsy phone number processing interface

### Step 2: Upload Your File

1. Click the upload area or drag and drop your file
2. Supported formats: `.csv`, `.xlsx`, `.xls`
3. Maximum file size: **50MB**
4. The system automatically detects phone number columns

### Step 3: Processing

Once uploaded, the system will:

- Parse your CSV/Excel file
- Automatically detect phone number columns
- Validate and sanitize phone numbers
- Generate a comprehensive report

### Step 4: Download Results

After processing, you'll receive a ZIP file containing:

1. **`*_valid_*.csv`** - All records with valid phone numbers
   - Original data intact
   - Validated phone numbers
   - Sanitized format

2. **`*_invalid_*.csv`** - Records with invalid or no phone numbers
   - Includes validation reason
   - Helps identify data quality issues

3. **`*_analytics_*.txt`** - Comprehensive analytics report
   - Total records processed
   - Valid/invalid count
   - Duplicate detection
   - Extraction statistics
   - Phone number patterns

## API Usage (Programmatic)

### Upload File via API

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@/path/to/your/contacts.csv"
```

### Response Format

```json
{
  "success": true,
  "message": "File processed successfully",
  "downloadId": "upload-1234567890",
  "summary": {
    "totalRecords": 1000,
    "validRecords": 950,
    "invalidRecords": 50,
    "phoneColumnDetected": "Phone",
    "analytics": {
      "totalNumbersExtracted": 1050,
      "totalValidNumbers": 980,
      "totalInvalidNumbers": 70,
      "uniqueValidNumbers": 950,
      "duplicateNumbers": 30
    }
  }
}
```

### Download Processed Files

```bash
curl -X GET http://localhost:3000/api/download/{downloadId} \
  --output results.zip
```

## Troubleshooting

### File Upload Fails

**Issue**: File upload fails with "File too large" error

**Solution**:

- Ensure your file is under 50MB
- Check that you're using the latest version
- Verify the server is running with updated configuration

**Issue**: "Upload failed due to direct serve using CLI"

**Solution**:

- Make sure to start the server using the CLI command
- Use the `--page` flag to enable the web interface
- Ensure you're accessing the correct URL (<http://localhost:3000>)

### Port Already in Use

**Issue**: Port 3000 is already in use

**Solution**:

```bash
# Use a different port
npx @numsy/numsy-serve --port 8080

# Or set PORT environment variable
PORT=8080 npx @numsy/numsy-serve
```

The server will also automatically find an available port if the default is in use.

### File Not Processing

**Issue**: File uploads but doesn't process correctly

**Checklist**:

1. ✅ File is in CSV, XLSX, or XLS format
2. ✅ File contains phone number data
3. ✅ Phone numbers are in a recognizable column
4. ✅ File size is under 50MB
5. ✅ Server has write permissions to `temp/` and `uploads/` directories

## Environment Variables

Create a `.env` file in the project root:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# File Upload Configuration
MAX_FILE_SIZE_MB=50
UPLOAD_DIR=uploads
TEMP_DIR=temp

# Cleanup Configuration (in hours)
FILE_CLEANUP_AGE_HOURS=1
```

## Column Detection

The system automatically detects phone number columns using these patterns:

- **Column Names**: `phone`, `mobile`, `contact`, `number`, `cell`, `telephone`
- **Variations**: Case-insensitive, with/without spaces
- **Multiple Numbers**: Extracts all phone numbers from text fields

### Supported Phone Number Formats

- Plain: `9876543210`
- With Country Code: `+919876543210`, `919876543210`
- Formatted: `+91-987-654-3210`, `+91 987 654 3210`
- With Spaces: `98765 43210`
- Mixed: All valid Indian mobile formats (starting with 6-9)

## Output File Details

### Valid Numbers CSV

Contains all records where at least one valid phone number was found:

```csv
Name,Phone,Email,validationStatus,sanitizedPhone
John Doe,9876543210,john@example.com,Valid,9876543210
Jane Smith,+91-9876543210,jane@example.com,Valid,9876543210
```

### Invalid Numbers CSV

Contains records with no valid phone numbers:

```csv
Name,Phone,Email,validationReason
Bob Wilson,1234567890,bob@example.com,Invalid format - must start with 6-9
Alice Brown,invalid,alice@example.com,No valid phone number found
```

### Analytics Report

Comprehensive statistics about your data:

```text
╔══════════════════════════════════════════════════════════╗
║           PHONE NUMBER VALIDATION REPORT                 ║
╚══════════════════════════════════════════════════════════╝

File Statistics:
├─ Total Records: 1,000
├─ Valid Records: 950
├─ Invalid Records: 50
└─ Success Rate: 95.00%

Phone Number Statistics:
├─ Total Numbers Extracted: 1,050
├─ Valid Numbers: 980
├─ Invalid Numbers: 70
├─ Unique Valid Numbers: 950
└─ Duplicate Numbers: 30

Additional Insights:
├─ Records with Multiple Numbers: 45
└─ Average Numbers per Record: 1.05
```

## Best Practices

1. **File Preparation**
   - Ensure phone numbers are in a dedicated column
   - Use consistent formatting
   - Remove extra characters if possible (but not required)

2. **Large Files**
   - Files up to 50MB are supported
   - For very large files, consider splitting into batches
   - Monitor server memory usage

3. **Data Security**
   - Files are automatically deleted after processing
   - Set appropriate cleanup intervals
   - Use environment variables for sensitive configuration

4. **Performance**
   - Processing speed depends on file size
   - CSV files process faster than Excel files
   - Expect ~1-5 seconds per 10,000 records

## More Information

- **Main Documentation**: [README.md](../README.md)
- **API Documentation**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Setup Guide**: [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **Usage Examples**: [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md)

## Support

For issues or questions:

- GitHub Issues: <https://github.com/shreesharma07/numsy/issues>
- Documentation: <https://github.com/shreesharma07/numsy>

---

**Last Updated**: March 9, 2026
