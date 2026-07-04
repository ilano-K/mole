import SyncProgress from "./SyncProgress";


interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalFiles: number;
  indexedFiles: number;
  currentFileName: string;
}

export default function SyncModal({
  isOpen,
  onClose,
  totalFiles,
  indexedFiles,
  currentFileName,
}: SyncModalProps) {
  if (!isOpen) return null;

  return (
    <div className="sync-modal-overlay" onClick={onClose}>
      <div className="sync-modal" onClick={(e) => e.stopPropagation()}>
        <SyncProgress
          totalFiles={totalFiles}
          indexedFiles={indexedFiles}
          currentFileName={currentFileName}
        />
      </div>
    </div>
  );
}