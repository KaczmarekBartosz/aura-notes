import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { normalizeImportFileName } from "../utils/note-data";

type PickedMarkdownAsset = {
  name: string;
  uri: string;
  lastModified?: number;
};

const VAULT_DIRECTORY_NAME = "vault";

function getVaultDirectoryUri() {
  if (!FileSystem.documentDirectory) {
    throw new Error("Lokalny katalog aplikacji nie jest dostępny na tym urządzeniu.");
  }
  return `${FileSystem.documentDirectory}${VAULT_DIRECTORY_NAME}`;
}

function getVaultFileUri(fileName: string) {
  const normalizedName = normalizeImportFileName(fileName);
  return `${getVaultDirectoryUri()}/${normalizedName}`;
}

export async function ensureVaultDirectory() {
  const vaultDirectory = getVaultDirectoryUri();
  const info = await FileSystem.getInfoAsync(vaultDirectory);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(vaultDirectory, { intermediates: true });
  }
  return vaultDirectory;
}

export async function pickMarkdownDocuments(): Promise<PickedMarkdownAsset[] | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: "*/*",
    copyToCacheDirectory: true,
    multiple: true,
    base64: false
  });

  if (result.canceled || !result.assets?.length) {
    return null;
  }

  return result.assets.map((asset) => ({
    name: asset.name,
    uri: asset.uri,
    lastModified: asset.lastModified
  }));
}

export async function readMarkdownAsset(uri: string) {
  return FileSystem.readAsStringAsync(uri);
}

export async function writeMarkdownToVault(fileName: string, content: string) {
  await ensureVaultDirectory();
  const destinationUri = getVaultFileUri(fileName);
  await FileSystem.writeAsStringAsync(destinationUri, content);
  return destinationUri;
}

export async function deleteMarkdownFromVault(localUri: string | null | undefined) {
  if (!localUri) return;
  const info = await FileSystem.getInfoAsync(localUri);
  if (info.exists) {
    await FileSystem.deleteAsync(localUri, { idempotent: true });
  }
}

export async function resetVaultDirectory() {
  const vaultDirectory = getVaultDirectoryUri();
  const info = await FileSystem.getInfoAsync(vaultDirectory);
  if (info.exists) {
    await FileSystem.deleteAsync(vaultDirectory, { idempotent: true });
  }
  await FileSystem.makeDirectoryAsync(vaultDirectory, { intermediates: true });
}
