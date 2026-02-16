# Google Sheets Integration Setup Guide

This guide explains how to set up Google Sheets integration for storing and managing scheduled social media posts.

## 🎯 **Overview**

The system now stores all scheduled posts in Google Sheets, which provides:
- **Reliable data storage** with no data loss
- **Easy visual management** of all posts
- **Zapier integration** for automated posting
- **Audit trail** and backup capabilities

## 📋 **Setup Steps**

### 1. **Create Google Sheets API Project**

1. **Go to Google Cloud Console:**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Google Sheets API:**
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

3. **Create Service Account:**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Fill in service account details
   - Click "Create and Continue"

4. **Generate Service Account Key:**
   - Click on your service account
   - Go to "Keys" tab
   - Click "Add Key" > "Create New Key"
   - Choose JSON format
   - Download the JSON file

### 2. **Create Google Sheet**

1. **Create a new Google Sheet:**
   - Go to [Google Sheets](https://sheets.google.com/)
   - Create a new spreadsheet
   - Note the spreadsheet ID from the URL

2. **Share the Sheet:**
   - Click "Share" button
   - Add your service account email (from the JSON file)
   - Give "Editor" permissions

### 3. **Configure Environment Variables**

Create a `.env` file in the root directory:

```env
# Google Sheets Configuration
GOOGLE_SHEET_ID=your-spreadsheet-id-here
GOOGLE_API_KEY=your-api-key-here

# LinkedIn OAuth (existing)
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
LINKEDIN_REDIRECT_URI=http://localhost:3001/auth/linkedin/callback

# Zapier Integration (optional)
ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/your-webhook-url
SCHEDULE_SECRET=your-secret-key

# Backend URL
VITE_BACKEND_URL=http://localhost:3001
```

### 4. **Setup Service Account Credentials**

1. **Place the JSON file:**
   - Save the downloaded service account JSON as `google-credentials.json`
   - Place it in the `server/` directory

2. **Verify file structure:**
   ```
   server/
   ├── google-credentials.json
   ├── index.js
   ├── googleSheetsService.js
   └── package.json
   ```

## 📊 **Sheet Structure**

The system automatically creates a "Posts" sheet with the following columns:

| Column | Header | Description |
|--------|--------|-------------|
| A | Post ID | Unique identifier for each post |
| B | Platform | instagram or linkedin |
| C | Content | The post content text |
| D | Image URL | URL of the post image (optional) |
| E | Publish Date | Date when post should be published |
| F | Publish Time | Time when post should be published |
| G | Status | pending, scheduled, published, failed |
| H | Created At | Timestamp when post was created |

## 🔄 **Zapier Integration**

### **Recommended Zapier Workflow:**

1. **Trigger:** Google Sheets - New Row
2. **Filter:** Status = "pending"
3. **Action:** Delay until Publish Date + Publish Time
4. **Action:** Post to Instagram/LinkedIn
5. **Action:** Update Google Sheets - Update Row (Status = "published")

### **Zapier Setup Steps:**

1. **Create New Zap:**
   - Go to [Zapier](https://zapier.com/)
   - Click "Create Zap"

2. **Set Trigger:**
   - Search for "Google Sheets"
   - Choose "New Row"
   - Connect your Google account
   - Select your spreadsheet and "Posts" sheet

3. **Add Filter:**
   - Add "Filter" step
   - Set condition: Status equals "pending"

4. **Add Delay:**
   - Add "Delay" step
   - Set to delay until specific date/time
   - Use Publish Date + Publish Time columns

5. **Add Action:**
   - Search for "Instagram" or "LinkedIn"
   - Choose appropriate posting action
   - Map fields from Google Sheets

6. **Update Status:**
   - Add another Google Sheets action
   - Choose "Update Row"
   - Update Status to "published"

## 🚀 **Testing the Integration**

### 1. **Start the Servers:**
```bash
# Backend
cd server
npm install
node index.js

# Frontend
npm run dev
```

### 2. **Test Post Creation:**
1. Go to Instagram/LinkedIn creator
2. Generate content
3. Click "Copy to Scheduler"
4. Schedule a post
5. Check Google Sheets for new row

### 3. **Verify Sheet Updates:**
- Open your Google Sheet
- Check that new posts appear in the "Posts" sheet
- Verify all columns are populated correctly

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **"Google Sheets service not initialized"**
   - Check `google-credentials.json` exists in server directory
   - Verify service account has editor permissions on the sheet

2. **"Permission denied"**
   - Ensure service account email is added to sheet sharing
   - Check API key is correct

3. **"Sheet not found"**
   - Verify `GOOGLE_SHEET_ID` is correct
   - Check spreadsheet URL for the ID

4. **Posts not appearing in sheet**
   - Check server console for error messages
   - Verify environment variables are set correctly

### **Debug Steps:**

1. **Check server logs:**
   ```bash
   cd server
   node index.js
   ```

2. **Test API manually:**
   ```bash
   curl -X POST http://localhost:3001/api/schedule \
     -H "Content-Type: application/json" \
     -d '{"platform":"instagram","content":"Test post","publishTime":"2024-01-15T10:00:00"}'
   ```

3. **Verify sheet permissions:**
   - Open Google Sheet
   - Check sharing settings
   - Ensure service account has access

## 📈 **Benefits of This Approach**

1. **Reliability:** No data loss, persistent storage
2. **Visibility:** Easy to see all scheduled posts
3. **Flexibility:** Can edit posts directly in sheets
4. **Scalability:** Can handle multiple platforms easily
5. **Audit Trail:** Complete history of all posts
6. **Backup:** Easy to export/backup data

## 🎉 **Next Steps**

Once setup is complete:
1. Test post creation and scheduling
2. Set up Zapier workflow for automated posting
3. Monitor sheet for successful post updates
4. Customize sheet formatting as needed

The system is now ready for production use with reliable Google Sheets storage! 🚀
