# 🚀 Quick Start Guide

## Step 1: Install Dependencies

```bash
cd "d:\Razorpod Applications\Number-Processor"
pnpm install
```

This will install all required packages including:

- NestJS framework
- TypeScript
- CSV/Excel parsers
- File handling utilities

## Step 2: Start the Development Server

```bash
pnpm run start:dev
```

The server will start on `http://localhost:3000` with hot-reload enabled.

## Step 3: Access the Application

Open your browser and navigate to:

```text
http://localhost:3000
```

You should see the Number Processor interface with a drag-and-drop file upload area.

## Step 4: Test with Sample Data

1. Use the included `sample-data.csv` file for testing
2. Drag and drop it into the upload area, or click to browse
3. Click "Process File"
4. Wait for processing to complete
5. Download the ZIP file containing:
   - `valid_numbers.csv` - All valid phone numbers
   - `invalid_numbers.csv` - All invalid numbers with reasons

## 🎯 What Happens During Processing?

1. **Upload**: File is securely uploaded to the server
2. **Parse**: CSV/Excel file is parsed
3. **Detect**: Phone column is automatically detected
4. **Validate**: Each phone number is validated against Indian mobile format
5. **Sanitize**: Valid numbers are cleaned (spaces, hyphens removed)
6. **Generate**: Two CSV files are created (valid/invalid)
7. **Package**: Files are compressed into a ZIP
8. **Download**: ZIP file is ready for download
9. **Cleanup**: All temporary files are automatically deleted

## 📱 Phone Number Validation Rules

### ✅ Valid Formats

- `9876543210` - Standard 10-digit
- `98765-43210` - With hyphens
- `98765 43210` - With spaces
- `+91 9876543210` - With country code
- `919876543210` - Country code without +

### ❌ Invalid Formats

- Numbers not starting with 6, 7, 8, or 9
- Less than or more than 10 digits
- All same digits (e.g., 9999999999)
- Non-Indian formats

## 📊 Sample Input Format

Your CSV/Excel file should have these columns (case-insensitive):

```csv
name,phone,address
John Doe,9876543210,Mumbai
Jane Smith,98765-43210,Delhi
```

The system will automatically detect variations like:

- Phone, Mobile, Contact, Number, Telephone
- Name, Full Name, Customer Name
- Address, Location, City, Area

## 🛠️ Production Build

To create a production build:

```bash
pnpm run build
pnpm run start:prod
```

## 🧪 Running Tests

Run unit tests:

```bash
pnpm test
```

Run tests with coverage:

```bash
pnpm run test:cov
```

Run E2E tests:

```bash
pnpm run test:e2e
```

## 🔧 Troubleshooting

### Port Already in Use

If port 3000 is in use, modify the port in `src/main.ts` or set environment variable:

```bash
PORT=3001 pnpm run start:dev
```

### File Upload Issues

- Max file size: 10MB
- Supported formats: .csv, .xlsx, .xls
- Check file permissions on upload/temp directories

### Parsing Errors

- Ensure CSV has headers
- Check for proper encoding (UTF-8 recommended)
- Verify Excel files are not password protected

## 📝 API Usage (Optional)

You can also use the API directly:

### Upload File

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@sample-data.csv"
```

### Download Result

```bash
curl -O http://localhost:3000/api/download/{downloadId}
```

### Health Check

```bash
curl http://localhost:3000/api/health
```

## 🎨 Customization

### Change Port

Edit `src/main.ts`:

```typescript
const port = process.env.PORT || 3001;
```

### Modify Validation Rules

Edit `src/services/phone-validator.service.ts`

### Change File Size Limit

Edit `src/controllers/app.controller.ts`:

```typescript
limits: {
  fileSize: 20 * 1024 * 1024, // 20MB
}
```

## 📦 Building as NPM Package

To publish as an npm package:

1. Update `package.json`:
   - Set `private: false`
   - Add keywords
   - Update author and repository

2. Build the package:

   ```bash
   pnpm run build
   ```

3. Publish:

   ```bash
   pnpm publish --access public
   ```

**See [NPM_PUBLISHING_GUIDE.md](NPM_PUBLISHING_GUIDE.md) for complete publishing instructions.**

## 🎯 Next Steps

- [ ] Test with your own data files
- [ ] Customize validation rules if needed
- [ ] Add authentication if required
- [ ] Deploy to production server
- [ ] Set up automated cleanup cron job

## 💡 Tips

- Keep files under 10MB for best performance
- Ensure proper column naming for auto-detection
- Review invalid numbers CSV to understand rejection reasons
- Use cleanup endpoint to manually remove old files

---

Need help? Check README.md or open an issue!
