const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

class GoogleSheetsService {
  constructor() {
    this.SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
    this.SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
    this.RANGE = 'Posts!A:I'; // Updated range to include title field
    this.auth = null;
    this.sheets = null;
    
    // Log for debugging
    console.log('GoogleSheetsService initialized with SPREADSHEET_ID:', this.SPREADSHEET_ID);
  }

  async initialize() {
    try {
      // For service account authentication
      const credentialsPath = path.join(__dirname, 'google-credentials.json');
      
      if (fs.existsSync(credentialsPath)) {
        const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
        this.auth = new google.auth.GoogleAuth({
          credentials,
          scopes: this.SCOPES,
        });
      } else {
        // Fallback to API key if no service account
        this.auth = new google.auth.GoogleAuth({
          key: process.env.GOOGLE_API_KEY,
          scopes: this.SCOPES,
        });
      }

      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      
      // Initialize sheet if it doesn't exist
      await this.initializeSheet();
      
      console.log('Google Sheets service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Google Sheets service:', error);
      throw error;
    }
  }

  async initializeSheet() {
    try {
      // Check if sheets exist, if not create them
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.SPREADSHEET_ID,
      });

      // Define the platforms we want to create sheets for
      const platforms = ['LinkedIn', 'Pinterest', 'Instagram', 'Facebook'];
      
      // Create each platform sheet if it doesn't exist
      for (const platform of platforms) {
        const sheetExists = response.data.sheets.some(
          sheet => sheet.properties.title === platform
        );

        if (!sheetExists) {
          // Create sheet for this platform
          await this.sheets.spreadsheets.batchUpdate({
            spreadsheetId: this.SPREADSHEET_ID,
            resource: {
              requests: [
                {
                  addSheet: {
                    properties: {
                      title: platform,
                    },
                  },
                },
              ],
            },
          });

          // Add headers
          await this.sheets.spreadsheets.values.update({
            spreadsheetId: this.SPREADSHEET_ID,
            range: `${platform}!A1:H1`,
            valueInputOption: 'RAW',
            resource: {
              values: [
                [
                  'ID',
                  'Title',
                  'Content',
                  'ImageURL',
                  'Publish Date',
                  'Publish Time',
                  'Hashtags',
                  'Platform'
                ]
              ]
            }
          });

          // Format headers
          const sheetId = await this.getSheetId(platform);
          if (sheetId !== null) {
            await this.sheets.spreadsheets.batchUpdate({
              spreadsheetId: this.SPREADSHEET_ID,
              resource: {
                requests: [
                  {
                    repeatCell: {
                      range: {
                        sheetId: sheetId,
                        startRowIndex: 0,
                        endRowIndex: 1,
                      },
                      cell: {
                        userEnteredFormat: {
                          backgroundColor: { red: 0.2, green: 0.6, blue: 0.9 },
                          textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } }
                        }
                      },
                      fields: 'userEnteredFormat(backgroundColor,textFormat)'
                    }
                  }
                ]
              }
            });
          } else {
            console.log(`Skipping formatting for ${platform} sheet as sheet ID is null`);
          }

          console.log(`${platform} sheet created and initialized`);
        }
      }
      
      // For backward compatibility, check if the general Posts sheet exists
      const postsSheetExists = response.data.sheets.some(
        sheet => sheet.properties.title === 'Posts'
      );
      
      if (!postsSheetExists) {
        // Create Posts sheet
        await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId: this.SPREADSHEET_ID,
          resource: {
            requests: [
              {
                addSheet: {
                  properties: {
                    title: 'Posts',
                  },
                },
              },
            ],
          },
        });

        // Add headers
        await this.sheets.spreadsheets.values.update({
          spreadsheetId: this.SPREADSHEET_ID,
          range: 'Posts!A1:I1',
          valueInputOption: 'RAW',
          resource: {
            values: [
              [
                'ID',
                'Platform',
                'Title',
                'Content',
                'Image',
                'Date',
                'Time',
                'Status',
                'Created'
              ]
            ]
          }
        });

        // Format headers
        const postsSheetId = await this.getSheetId('Posts');
        if (postsSheetId !== null) {
          await this.sheets.spreadsheets.batchUpdate({
            spreadsheetId: this.SPREADSHEET_ID,
            resource: {
              requests: [
                {
                  repeatCell: {
                    range: {
                      sheetId: postsSheetId,
                      startRowIndex: 0,
                      endRowIndex: 1,
                    },
                    cell: {
                      userEnteredFormat: {
                        backgroundColor: { red: 0.2, green: 0.6, blue: 0.9 },
                        textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } }
                      }
                    },
                    fields: 'userEnteredFormat(backgroundColor,textFormat)'
                  }
                }
              ]
            }
          });
        } else {
          console.log('Skipping formatting for Posts sheet as sheet ID is null');
        }

        console.log('Posts sheet created and initialized');
      }
    } catch (error) {
      console.error('Error initializing sheet:', error);
      throw error;
    }
  }

  async getSheetId(sheetName) {
    try {
      // Get all sheets in the spreadsheet
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.SPREADSHEET_ID,
      });
      
      // Find the sheet with the matching name
      const sheet = response.data.sheets.find(
        sheet => sheet.properties.title === sheetName
      );
      
      if (sheet) {
        return sheet.properties.sheetId;
      } else {
        console.error(`Sheet ${sheetName} not found`);
        return null; // Return null instead of 0 to avoid invalid sheet ID
      }
    } catch (error) {
      console.error('Error getting sheet ID:', error);
      return null; // Return null instead of 0 to avoid invalid sheet ID
    }
  }

  async addPost(postData) {
    try {
      if (!this.sheets) {
        await this.initialize();
      }

      const publishDate = new Date(postData.publishTime);
      const platform = postData.platform.charAt(0).toUpperCase() + postData.platform.slice(1);
      const postId = postData.id || `post_${Date.now()}`;
      
      console.log('===== ADDING NEW POST TO GOOGLE SHEETS =====');
      console.log(`Post ID: ${postId}`);
      console.log(`Platform: ${platform}`);
      console.log(`Title: ${postData.title || 'Not provided'}`);
      console.log(`Content length: ${postData.content ? postData.content.length : 0} characters`);
      console.log(`Image URL: ${postData.imageUrl || 'Not provided'}`);
      console.log(`Publish Date: ${publishDate.toISOString()}`);
      
      // For backward compatibility, add to Posts sheet
      const postsRowData = [
        postId,
        postData.platform,
        postData.title || '',
        postData.content,
        postData.imageUrl || '',
        publishDate.toISOString().split('T')[0], // Date only
        publishDate.toTimeString().split(' ')[0], // Time only
        'pending',
        new Date().toISOString()
      ];
      
      console.log('===== UPDATING POSTS SHEET COLUMNS =====');
      console.log('Column A (ID): ' + postId);
      console.log('Column B (Platform): ' + postData.platform);
      console.log('Column C (Title): ' + (postData.title || ''));
      console.log('Column D (Content): Content text (length: ' + (postData.content ? postData.content.length : 0) + ')');
      console.log('Column E (Image URL): ' + (postData.imageUrl || ''));
      console.log('Column F (Publish Date): ' + publishDate.toISOString().split('T')[0]);
      console.log('Column G (Publish Time): ' + publishDate.toTimeString().split(' ')[0]);
      console.log('Column H (Status): pending');
      console.log('Column I (Created At): ' + new Date().toISOString());
      
      // Add to Posts sheet
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.SPREADSHEET_ID,
        range: 'Posts!A:I',
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values: [postsRowData]
        }
      });
      console.log('Successfully added data to Posts sheet');
      
      // If platform is LinkedIn, also add to LinkedIn sheet with the specific format
      if (platform === 'Linkedin') {
        console.log('===== UPDATING LINKEDIN SHEET COLUMNS =====');
        
        const linkedinRowData = [
          postId, // ID
          postData.title || '', // Title
          postData.content, // Content
          postData.imageUrl || '', // Image URL
          publishDate.toISOString().split('T')[0], // Publish date
          publishDate.toTimeString().split(' ')[0], // Publish time
          platform, // Platform
          '', // Post ID (will be updated after publishing)
          postData.hashtags || '' // Hashtags
        ];
        
        console.log('Column A (ID): ' + postId);
        console.log('Column B (Title): ' + (postData.title || ''));
        console.log('Column C (Content): Content text (length: ' + (postData.content ? postData.content.length : 0) + ')');
        console.log('Column D (Image URL): ' + (postData.imageUrl || ''));
        console.log('Column E (Publish Date): ' + publishDate.toISOString().split('T')[0]);
        console.log('Column F (Publish Time): ' + publishDate.toTimeString().split(' ')[0]);
        console.log('Column G (Platform): ' + platform);
        console.log('Column H (Post ID): ' + '');
        console.log('Column I (Hashtags): ' + (postData.hashtags || ''));
        
        await this.sheets.spreadsheets.values.append({
          spreadsheetId: this.SPREADSHEET_ID,
          range: 'LinkedIn!A:I',
          valueInputOption: 'RAW',
          insertDataOption: 'INSERT_ROWS',
          resource: {
            values: [linkedinRowData]
          }
        });
        
        console.log('Successfully added data to LinkedIn sheet');
        console.log('Post added to both Posts and LinkedIn sheets');
      } else if (platform === 'Pinterest') {
        console.log('===== UPDATING PINTEREST SHEET COLUMNS =====');
        
        // Format data for Pinterest sheet
        const pinterestRowData = [
          postId,
          postData.title || '',
          postData.content,
          postData.imageUrl || '',
          publishDate.toISOString().split('T')[0],
          publishDate.toTimeString().split(' ')[0],
          '', // Board name (will be filled later)
          platform, // Platform
          postData.hashtags || ''
        ];
        
        console.log('Column A (ID): ' + postId);
        console.log('Column B (Title): ' + (postData.title || ''));
        console.log('Column C (Content): Content text (length: ' + (postData.content ? postData.content.length : 0) + ')');
        console.log('Column D (Image URL): ' + (postData.imageUrl || ''));
        console.log('Column E (Publish Date): ' + publishDate.toISOString().split('T')[0]);
        console.log('Column F (Publish Time): ' + publishDate.toTimeString().split(' ')[0]);
        console.log('Column G (Board Name): ' + '');
        console.log('Column H (Platform): ' + platform);
        console.log('Column I (Hashtags): ' + (postData.hashtags || ''));
        
        await this.sheets.spreadsheets.values.append({
          spreadsheetId: this.SPREADSHEET_ID,
          range: 'Pinterest!A:J',
          valueInputOption: 'RAW',
          insertDataOption: 'INSERT_ROWS',
          resource: {
            values: [pinterestRowData]
          }
        });
        
        console.log('Successfully added data to Pinterest sheet');
        console.log('Post added to both Posts and Pinterest sheets');
      } else {
        console.log('Post added to Posts sheet');
      }
      
      console.log(`===== POST ADDITION COMPLETED =====`);
      console.log(`Post ID: ${postId}`);
      console.log(`Platform: ${platform}`);
      
      return { success: true, postId };
    } catch (error) {
      console.error('===== ERROR ADDING POST TO GOOGLE SHEETS =====');
      console.error(`Error details: ${error.message}`);
      console.error(error);
      throw error;
    }
  }

  async updatePostStatus(postId, status, platformPostId = '') {
    try {
      if (!this.sheets) {
        await this.initialize();
      }

      console.log(`===== UPDATING POST STATUS =====`);
      console.log(`Post ID: ${postId}`);
      console.log(`New Status: ${status}`);
      console.log(`Platform Post ID: ${platformPostId || 'Not provided'}`);

      // Get list of all sheets
      const sheetsResponse = await this.sheets.spreadsheets.get({
        spreadsheetId: this.SPREADSHEET_ID,
      });
      
      const allSheets = sheetsResponse.data.sheets.map(sheet => sheet.properties.title);
      const platformSheets = ['LinkedIn', 'Pinterest', 'Instagram', 'Facebook'];
      const sheetsToQuery = platformSheets.filter(sheet => allSheets.includes(sheet));
      
      // Also include the legacy Posts sheet if it exists
      if (allSheets.includes('Posts')) {
        sheetsToQuery.push('Posts');
      }
      
      let postFound = false;
      
      // Search each sheet for the post ID
      for (const sheetName of sheetsToQuery) {
        console.log(`Searching for post ID ${postId} in ${sheetName} sheet`);
        
        const response = await this.sheets.spreadsheets.values.get({
          spreadsheetId: this.SPREADSHEET_ID,
          range: `${sheetName}!A:I`,
        });

        const rows = response.data.values || [];
        const rowIndex = rows.findIndex(row => row[0] === postId);

        if (rowIndex !== -1) {
          // Found the post in this sheet
          console.log(`Found post in ${sheetName} sheet at row ${rowIndex + 1}`);
          
          if (sheetName === 'Posts') {
            // Update status column in Posts sheet (column G, index 6)
            console.log(`Updating ${sheetName} sheet Column G (Status) to: ${status}`);
            await this.sheets.spreadsheets.values.update({
              spreadsheetId: this.SPREADSHEET_ID,
              range: `Posts!G${rowIndex + 1}`,
              valueInputOption: 'RAW',
              resource: {
                values: [[status]]
              }
            });
            console.log(`Successfully updated status in ${sheetName} sheet`);
          } else {
            // For platform-specific sheets, update the Post ID column if platformPostId is provided
            if (platformPostId) {
              // LinkedIn and Pinterest have Post ID in column H (index 7)
              console.log(`Updating ${sheetName} sheet Column H (Post ID) to: ${platformPostId}`);
              
              await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.SPREADSHEET_ID,
                range: `${sheetName}!H${rowIndex + 1}`,
                valueInputOption: 'RAW',
                resource: {
                  values: [[platformPostId]]
                }
              });
              console.log(`Successfully updated platform post ID in ${sheetName} sheet`);
            } else {
              console.log(`No platform post ID provided for ${sheetName} sheet update`);
            }
          }
          
          postFound = true;
          console.log(`Post ${postId} status updated to ${status} in ${sheetName} sheet`);
          break;
        } else {
          console.log(`Post ID ${postId} not found in ${sheetName} sheet`);
        }
      }

      if (!postFound) {
        console.log(`Post ID ${postId} not found in any sheet`);
        throw new Error('Post not found in any sheet');
      }
      
      console.log(`===== POST STATUS UPDATE COMPLETED =====`);
      console.log(`Post ID: ${postId}`);
      console.log(`Status: ${status}`);
      
      return { success: true };
    } catch (error) {
      console.error('===== ERROR UPDATING POST STATUS =====');
      console.error(`Post ID: ${postId}`);
      console.error(`Error details: ${error.message}`);
      console.error(error);
      throw error;
    }
  }

  async getAllPosts() {
    try {
      if (!this.sheets) {
        await this.initialize();
      }

      // Get list of all sheets
      const sheetsResponse = await this.sheets.spreadsheets.get({
        spreadsheetId: this.SPREADSHEET_ID,
      });
      
      const allSheets = sheetsResponse.data.sheets.map(sheet => sheet.properties.title);
      const platformSheets = ['LinkedIn', 'Pinterest', 'Instagram', 'Facebook'];
      const sheetsToQuery = platformSheets.filter(sheet => allSheets.includes(sheet));
      
      // Also include the legacy Posts sheet if it exists
      if (allSheets.includes('Posts')) {
        sheetsToQuery.push('Posts');
      }
      
      let allPosts = [];
      
      // Query each sheet and combine results
      for (const sheetName of sheetsToQuery) {
        const response = await this.sheets.spreadsheets.values.get({
          spreadsheetId: this.SPREADSHEET_ID,
          range: `${sheetName}!A:I`, // Expanded range to include all columns
        });

        const rows = response.data.values || [];
        
        if (rows.length <= 1) {
          // Skip if only header row or empty
          continue;
        }
        
        // Skip header row and convert to objects
        const sheetPosts = rows.slice(1).map(row => {
          if (sheetName === 'Posts') {
            // Legacy format
            return {
              id: row[0],
              platform: row[1],
              content: row[2],
              imageUrl: row[3],
              publishDate: row[4],
              publishTime: row[5],
              status: row[6],
              createdAt: row[7]
            };
          } else {
            // New platform-specific format
            return {
              id: row[0],
              title: row[1],
              content: row[2],
              imageUrl: row[3],
              publishDate: row[4],
              publishTime: row[5],
              platform: row[6],
              postId: row[7],
              hashtags: row[8] || '',
              status: 'pending' // Default status
            };
          }
        });
        
        allPosts = [...allPosts, ...sheetPosts];
      }

      return allPosts;
    } catch (error) {
      console.error('Error getting posts from Google Sheets:', error);
      throw error;
    }
  }

  async deletePost(postId) {
    try {
      if (!this.sheets) {
        await this.initialize();
      }

      // Get list of all sheets
      const sheetsResponse = await this.sheets.spreadsheets.get({
        spreadsheetId: this.SPREADSHEET_ID,
      });
      
      const allSheets = sheetsResponse.data.sheets.map(sheet => sheet.properties.title);
      const platformSheets = ['LinkedIn', 'Pinterest', 'Instagram', 'Facebook'];
      const sheetsToQuery = platformSheets.filter(sheet => allSheets.includes(sheet));
      
      // Also include the legacy Posts sheet if it exists
      if (allSheets.includes('Posts')) {
        sheetsToQuery.push('Posts');
      }
      
      let postFound = false;
      
      // Search each sheet for the post ID
      for (const sheetName of sheetsToQuery) {
        const response = await this.sheets.spreadsheets.values.get({
          spreadsheetId: this.SPREADSHEET_ID,
          range: `${sheetName}!A:I`,
        });

        const rows = response.data.values || [];
        const rowIndex = rows.findIndex(row => row[0] === postId);

        if (rowIndex !== -1) {
          // Found the post in this sheet, get the sheet ID
          const sheetId = this.getSheetId(sheetName);
          
          // Delete the row
          await this.sheets.spreadsheets.batchUpdate({
            spreadsheetId: this.SPREADSHEET_ID,
            resource: {
              requests: [
                {
                  deleteDimension: {
                    range: {
                      sheetId: sheetId,
                      dimension: 'ROWS',
                      startIndex: rowIndex,
                      endIndex: rowIndex + 1
                    }
                  }
                }
              ]
            }
          });
          
          postFound = true;
          console.log(`Post ${postId} deleted from ${sheetName} sheet`);
          break;
        }
      }

      if (!postFound) {
        throw new Error('Post not found in any sheet');
      }
    } catch (error) {
      console.error('Error deleting post from Google Sheets:', error);
      throw error;
    }
  }
}

module.exports = new GoogleSheetsService();
