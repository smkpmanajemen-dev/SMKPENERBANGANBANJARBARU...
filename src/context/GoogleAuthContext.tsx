import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { initAuth, googleSignIn, logoutGoogle, getAccessToken } from '../services/googleAuth';
import { 
  getOrCreateStokFlowFolder, 
  uploadFileToDrive, 
  listStokFlowFiles, 
  downloadFileContent, 
  deleteDriveFile,
  DriveFile 
} from '../services/googleDrive';

interface GoogleAuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  driveFiles: DriveFile[];
  isSyncing: boolean;
  syncStatus: { type: 'success' | 'error'; message: string } | null;
  setSyncStatus: (status: { type: 'success' | 'error'; message: string } | null) => void;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshDriveFiles: () => Promise<void>;
  backupInventoryToDrive: (data: { items: any[]; inbound: any[]; outbound: any[] }) => Promise<DriveFile>;
  uploadCsvToDrive: (fileName: string, csvContent: string) => Promise<DriveFile>;
  restoreInventoryFromDrive: (fileId: string) => Promise<any>;
  deleteFileFromDrive: (fileId: string) => Promise<void>;
}

const GoogleAuthContext = createContext<GoogleAuthContextType | undefined>(undefined);

export const GoogleAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Initialize Firebase Auth listener on app load
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
        setIsLoading(false);
      },
      () => {
        setUser(null);
        setAccessToken(null);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Fetch Drive files when user signs in or accessToken is set
  useEffect(() => {
    if (accessToken && user) {
      refreshDriveFiles();
    } else {
      setDriveFiles([]);
    }
  }, [accessToken, user]);

  const refreshDriveFiles = async () => {
    if (!accessToken) return;
    try {
      setIsSyncing(true);
      const folderId = await getOrCreateStokFlowFolder(accessToken);
      const files = await listStokFlowFiles(accessToken, folderId);
      setDriveFiles(files);
    } catch (err: any) {
      console.error('Error fetching Drive files:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const signIn = async () => {
    try {
      setIsLoading(true);
      setSyncStatus(null);
      const result = await googleSignIn();
      setUser(result.user);
      setAccessToken(result.accessToken);
      setSyncStatus({
        type: 'success',
        message: `Terhubung dengan Google Drive (${result.user.email})!`,
      });
    } catch (err: any) {
      console.error('Login error:', err);
      setSyncStatus({
        type: 'error',
        message: err.message || 'Gagal masuk dengan Google.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await logoutGoogle();
      setUser(null);
      setAccessToken(null);
      setDriveFiles([]);
      setSyncStatus({
        type: 'success',
        message: 'Berhasil keluar dari akun Google.',
      });
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  const backupInventoryToDrive = async (data: { items: any[]; inbound: any[]; outbound: any[] }): Promise<DriveFile> => {
    const token = accessToken || (await getAccessToken());
    if (!token) {
      throw new Error('Silakan masuk dengan akun Google terlebih dahulu.');
    }

    try {
      setIsSyncing(true);
      const folderId = await getOrCreateStokFlowFolder(token);
      const today = new Date().toISOString().slice(0, 10);
      const fileName = `stokflow_backup_${today}.json`;
      
      const payload = {
        app: 'StokFlow Inventaris',
        version: '1.0',
        exportedAt: new Date().toISOString(),
        items: data.items,
        inbound: data.inbound,
        outbound: data.outbound,
      };

      const file = await uploadFileToDrive(
        token,
        fileName,
        JSON.stringify(payload, null, 2),
        'application/json',
        folderId
      );

      await refreshDriveFiles();
      setSyncStatus({
        type: 'success',
        message: `Cadangan inventaris berhasil disimpan ke Google Drive (${fileName})!`,
      });
      return file;
    } catch (err: any) {
      console.error('Drive backup error:', err);
      setSyncStatus({
        type: 'error',
        message: err.message || 'Gagal menyimpan cadangan ke Google Drive.',
      });
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  const uploadCsvToDrive = async (fileName: string, csvContent: string): Promise<DriveFile> => {
    const token = accessToken || (await getAccessToken());
    if (!token) {
      throw new Error('Silakan masuk dengan akun Google terlebih dahulu.');
    }

    try {
      setIsSyncing(true);
      const folderId = await getOrCreateStokFlowFolder(token);
      const file = await uploadFileToDrive(
        token,
        fileName,
        csvContent,
        'text/csv',
        folderId
      );

      await refreshDriveFiles();
      setSyncStatus({
        type: 'success',
        message: `Laporan CSV berhasil diunggah ke Google Drive (${fileName})!`,
      });
      return file;
    } catch (err: any) {
      console.error('Drive CSV upload error:', err);
      setSyncStatus({
        type: 'error',
        message: err.message || 'Gagal mengunggah CSV ke Google Drive.',
      });
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  const restoreInventoryFromDrive = async (fileId: string): Promise<any> => {
    const token = accessToken || (await getAccessToken());
    if (!token) {
      throw new Error('Silakan masuk dengan akun Google terlebih dahulu.');
    }

    try {
      setIsSyncing(true);
      const content = await downloadFileContent(token, fileId);
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed.items) && Array.isArray(parsed.inbound) && Array.isArray(parsed.outbound)) {
        setSyncStatus({
          type: 'success',
          message: 'Data inventaris berhasil dipulihkan dari berkas Google Drive!',
        });
        return parsed;
      } else {
        throw new Error('Format berkas cadangan JSON di Google Drive tidak sesuai.');
      }
    } catch (err: any) {
      console.error('Drive restore error:', err);
      setSyncStatus({
        type: 'error',
        message: err.message || 'Gagal memulihkan data dari Google Drive.',
      });
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteFileFromDrive = async (fileId: string): Promise<void> => {
    const token = accessToken || (await getAccessToken());
    if (!token) {
      throw new Error('Silakan masuk dengan akun Google terlebih dahulu.');
    }

    try {
      setIsSyncing(true);
      await deleteDriveFile(token, fileId);
      await refreshDriveFiles();
      setSyncStatus({
        type: 'success',
        message: 'Berkas berhasil dihapus dari Google Drive.',
      });
    } catch (err: any) {
      console.error('Delete Drive file error:', err);
      setSyncStatus({
        type: 'error',
        message: err.message || 'Gagal menghapus berkas dari Google Drive.',
      });
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <GoogleAuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        driveFiles,
        isSyncing,
        syncStatus,
        setSyncStatus,
        signIn,
        signOut,
        refreshDriveFiles,
        backupInventoryToDrive,
        uploadCsvToDrive,
        restoreInventoryFromDrive,
        deleteFileFromDrive,
      }}
    >
      {children}
    </GoogleAuthContext.Provider>
  );
};

export const useGoogleAuth = () => {
  const context = useContext(GoogleAuthContext);
  if (!context) {
    throw new Error('useGoogleAuth must be used within a GoogleAuthProvider');
  }
  return context;
};
