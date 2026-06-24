import { useState } from "react";
import { indexFile } from "../api/document";

export function useSync() {
  const [totalFiles, setTotalFiles] = useState(0);
  const [indexedFiles, setIndexedFiles] = useState(0);
  const [currentFileName, setCurrentFileName] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  const startSync = async (pendingFilesList: string[]) => {
    if (!pendingFilesList || pendingFilesList.length === 0) {
      setIsComplete(true);
      return;
    }

    setTotalFiles(pendingFilesList.length);
    setIndexedFiles(0);
    setIsComplete(false);

    for (let i = 0; i < pendingFilesList.length; i++) {
      const filePath = pendingFilesList[i];

      // for ui
      const fileName = filePath.split(/[/\\]/).pop() || "Unknown File";
      setCurrentFileName(fileName);

      try {
        await indexFile({ file_path: filePath });
      } catch (error) {
        console.error("Failed to index file ${fileName}: ", error);
        // ill track failed files here
      }
      setIndexedFiles((prev) => prev + 1);
    }
    setIsComplete(true);
  };
  return {
    totalFiles,
    indexedFiles,
    currentFileName,
    isComplete,
    startSync,
  };
}
