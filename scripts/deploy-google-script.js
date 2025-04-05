/**
 * This file contains the Google Apps Script code for the Zym Tracker backup system.
 *
 * To deploy:
 * 1. Go to https://script.google.com/
 * 2. Create a new project
 * 3. Copy and paste the code below
 * 4. Save the project
 * 5. Deploy as a web app
 *    - Execute the app as: Me (your Google account)
 *    - Who has access: Anyone (anonymous)
 * 6. Copy the web app URL and update the GOOGLE_SCRIPT_URL in lib/google-drive.ts
 */

/**
 * Google Apps Script for Zym Tracker Backup System
 * This script handles backup and restore functionality using a specific folder ID
 */

// Main function to handle POST requests
function doPost(e) {
  try {
    // Parse the request data
    const requestData = JSON.parse(e.postData.contents)
    // Get the folder using the specific ID
    const folder = DriveApp.getFolderById("14tRDbRr4zuVJxdNT_lai5jFt0WSK1I5Z")
    // Check if this is a restore request
    if (requestData.action && requestData.action === "restore") {
      return handleRestore(requestData, folder)
    }
    // Otherwise, handle as a backup request
    return handleBackup(requestData, folder)
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: error.toString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  }
}

/**
 * Handle backup request
 */
function handleBackup(requestData, folder) {
  const data = requestData.data
  if (!data) {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: "Missing data",
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  }
  // Create backup file with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const fileName = `zym_tracker_backup_${timestamp}.json`
  const file = folder.createFile(fileName, data, MimeType.JSON)
  return ContentService.createTextOutput(
    JSON.stringify({
      success: true,
      fileId: file.getId(),
      fileName: fileName,
      message: "Backup sukses!",
    }),
  ).setMimeType(ContentService.MimeType.JSON)
}

/**
 * Handle restore request
 */
function handleRestore(requestData, folder) {
  const fileId = requestData.fileId
  if (!fileId) {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: "Missing file ID",
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  }
  try {
    // Get the file
    const file = DriveApp.getFileById(fileId)
    // Read the file content
    const content = file.getBlob().getDataAsString()
    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        data: content,
        message: "Restore sukses!",
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: "File not found or cannot be accessed",
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  }
}

