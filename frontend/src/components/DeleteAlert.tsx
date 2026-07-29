import { useEffect, useRef } from "react";

interface DeleteAlertProps {
  content: string;
  onDelete: () => void;
  onCancel: () => void;
}

const DeleteAlert = ({ content, onDelete, onCancel }: DeleteAlertProps) => {
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Destructive dialogs should not open with the destructive action armed.
  useEffect(() => cancelRef.current?.focus(), []);

  return (
    <div>
      <p className="text-sm text-gray-700 dark:text-gray-300">{content}</p>
      <div className="flex justify-end gap-2 mt-6">
        <button
          ref={cancelRef}
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer
                     text-gray-700 dark:text-gray-200
                     bg-gray-100 hover:bg-gray-200
                     dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors cursor-pointer
                     bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default DeleteAlert;
