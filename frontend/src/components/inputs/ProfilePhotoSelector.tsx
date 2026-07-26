import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { LuUser, LuUpload, LuTrash } from "react-icons/lu";

interface ProfilePhotoSelectorProps {
  image: File | null;
  setImage: (file: File | null) => void;
}

const ProfilePhotoSelector = ({
  image,
  setImage,
}: ProfilePhotoSelectorProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Derive the preview from the file so cancelling the dialog cannot leave a
  // stale URL behind, and revoke it when it is replaced.
  useEffect(() => {
    if (!image) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(image);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setImage(file);
  };

  const handleRemoveImage = () => {
    setImage(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex justify-center mb-6">
      <input
        type="file"
        ref={inputRef}
        accept="image/png,image/jpeg,image/webp"
        onChange={handleImageChange}
        className="hidden"
      />
      {!image ? (
        <div className="w-20 h-20 flex items-center justify-center bg-purple-100 rounded-full relative">
          <LuUser className="text-4xl text-primary" />
          <button
            type="button"
            aria-label="Choose a profile photo"
            className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full absolute -bottom-1 -right-1"
            onClick={() => inputRef.current?.click()}
          >
            <LuUpload />
          </button>
        </div>
      ) : (
        <div className="relative">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Profile preview"
              className="w-20 h-20 rounded-full object-cover"
            />
          )}
          <button
            type="button"
            aria-label="Remove profile photo"
            className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-full absolute -bottom-1 -right-1"
            onClick={handleRemoveImage}
          >
            <LuTrash />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePhotoSelector;
