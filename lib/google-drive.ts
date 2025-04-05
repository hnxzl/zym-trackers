// Google Drive integration for backup and restore functionality

// Replace this with your deployed Google Apps Script URL
const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL!;

export interface BackupData {
  userId: string;
  profile: any;
  workouts: any[];
  schedules: any;
}

export async function createBackup(data: BackupData): Promise<{
  success: boolean;
  fileId?: string;
  fileName?: string;
  message?: string;
  error?: string;
}> {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: JSON.stringify(data),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error creating backup:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function restoreBackup(fileId: string): Promise<{
  success: boolean;
  data?: BackupData;
  message?: string;
  error?: string;
}> {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "restore",
        fileId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success && result.data) {
      // Parse the JSON string back to an object
      result.data = JSON.parse(result.data);
    }

    return result;
  } catch (error) {
    console.error("Error restoring backup:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
