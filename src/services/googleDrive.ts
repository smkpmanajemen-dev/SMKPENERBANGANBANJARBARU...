export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size?: string;
  webViewLink?: string;
  iconLink?: string;
}

const FOLDER_NAME = 'StokFlow - Inventaris';

/**
 * Finds or creates a designated folder for StokFlow in the user's Google Drive.
 */
export async function getOrCreateStokFlowFolder(accessToken: string): Promise<string> {
  // Check if folder exists
  const query = encodeURIComponent(`name = '${FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!searchRes.ok) {
    const errorText = await searchRes.text();
    throw new Error(`Gagal mencari folder di Google Drive: ${errorText}`);
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Create folder if not found
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    throw new Error(`Gagal membuat folder di Google Drive: ${errorText}`);
  }

  const folderData = await createRes.json();
  return folderData.id;
}

/**
 * Uploads a text or JSON file to Google Drive using multipart upload.
 */
export async function uploadFileToDrive(
  accessToken: string,
  fileName: string,
  content: string,
  mimeType: string = 'application/json',
  folderId?: string
): Promise<DriveFile> {
  const metadata: any = {
    name: fileName,
    mimeType,
  };

  if (folderId) {
    metadata.parents = [folderId];
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}; charset=UTF-8\r\n\r\n` +
    content +
    closeDelimiter;

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,modifiedTime,size,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gagal mengunggah berkas ke Google Drive: ${errorText}`);
  }

  return await res.json();
}

/**
 * Lists files in the StokFlow folder or specific query.
 */
export async function listStokFlowFiles(
  accessToken: string,
  folderId?: string
): Promise<DriveFile[]> {
  let query = 'trashed = false';
  if (folderId) {
    query += ` and '${folderId}' in parents`;
  } else {
    query += ` and (name contains 'stokflow' or name contains 'Inventaris' or name contains 'Laporan')`;
  }

  const encodedQuery = encodeURIComponent(query);
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodedQuery}&orderBy=modifiedTime desc&pageSize=30&fields=files(id,name,mimeType,modifiedTime,size,webViewLink,iconLink)`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gagal mengambil daftar berkas Google Drive: ${errorText}`);
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Downloads a file's content as text (e.g. JSON or CSV).
 */
export async function downloadFileContent(
  accessToken: string,
  fileId: string
): Promise<string> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gagal mengunduh berkas dari Google Drive: ${errorText}`);
  }

  return await res.text();
}

/**
 * Deletes a file in Google Drive.
 * (MANDATORY: MUST be preceded by user confirmation dialog in the UI).
 */
export async function deleteDriveFile(
  accessToken: string,
  fileId: string
): Promise<void> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok && res.status !== 204) {
    const errorText = await res.text();
    throw new Error(`Gagal menghapus berkas dari Google Drive: ${errorText}`);
  }
}
