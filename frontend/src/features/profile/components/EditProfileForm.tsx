import { useEffect, useRef, useState } from "react";

import type { UpdateProfileRequest } from "../../../domain/contracts/user.contracts";
import type { User } from "../../../domain/models/user";

type Props = {
  user: User;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: UpdateProfileRequest) => Promise<void>;
  onUpload: (file: File) => Promise<void>;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function EditProfileForm({ user, isSubmitting, onClose, onSubmit, onUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [username, setUsername] = useState(user.username);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(user.profilePicture);
  const [removePicture, setRemovePicture] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
  }, []);

  const selectFile = (file: File | undefined) => {
    if (!file) return;
    setError(null);
    if (!ALLOWED_TYPES.has(file.type)) {
      setError("Only JPG, PNG, and WEBP images are allowed.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("Profile picture must be 5 MB or smaller.");
      return;
    }

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreview(objectUrlRef.current);
    setRemovePicture(false);
  };

  const removeSelectedPicture = () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
    setSelectedFile(null);
    setPreview(null);
    setRemovePicture(true);
    setError(null);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedUsername = username.trim();
    if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(trimmedUsername)) {
      setError("Username must be 3-30 characters and use only letters, numbers, dots, hyphens, or underscores.");
      return;
    }

    try {
      setError(null);
      if (selectedFile) await onUpload(selectedFile);
      const usernameChanged = trimmedUsername !== user.username;
      if (usernameChanged || removePicture) {
        await onSubmit({
          username: trimmedUsername,
          ...(removePicture && !selectedFile ? { profilePicture: null } : {}),
        });
      }
      onClose();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "We couldn't update your profile.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40 sm:items-center sm:justify-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="edit-profile-title">
      <form onSubmit={submit} className="w-full rounded-t-lg bg-[var(--surface)] p-5 sm:max-w-md sm:rounded-lg">
        <div className="mb-5 flex justify-between gap-4">
          <h2 id="edit-profile-title" className="text-lg font-semibold text-[var(--text-primary)]">Edit profile</h2>
          <button type="button" onClick={onClose} disabled={isSubmitting} className="text-sm text-[var(--text-secondary)]">Close</button>
        </div>
        {error && <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-[var(--expense)]" role="alert">{error}</p>}
        <label className="block text-sm font-medium text-[var(--text-primary)]" htmlFor="profile-username">Username
          <input id="profile-username" value={username} onChange={(event) => setUsername(event.target.value)} maxLength={30} className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] p-2 font-normal text-[var(--text-primary)]" />
        </label>
        <fieldset className="mt-5" disabled={isSubmitting}>
          <legend className="text-sm font-medium text-[var(--text-primary)]">Profile picture</legend>
          <div className="mt-3 flex items-center gap-4">
            {preview ? <img src={preview} alt="Profile preview" referrerPolicy="no-referrer" className="h-20 w-20 rounded-full border border-[var(--border)] object-cover" /> : <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--primary-light)] text-xl font-bold text-[var(--primary)]">{user.username.slice(0, 1).toUpperCase()}</div>}
            <div className="space-y-2">
              <input ref={inputRef} id="profile-picture" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => selectFile(event.target.files?.[0])} />
              <button type="button" onClick={() => inputRef.current?.click()} className="rounded-md bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-white">Choose image</button>
              {preview && <button type="button" onClick={removeSelectedPicture} className="block text-sm font-medium text-[var(--expense)]">Remove picture</button>}
            </div>
          </div>
          <p className="mt-2 text-xs text-[var(--text-secondary)]">JPG, PNG, or WEBP. Maximum 5 MB.</p>
          {selectedFile && <p className="mt-1 text-xs text-[var(--primary)]">New image selected: {selectedFile.name}</p>}
        </fieldset>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="rounded-md border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-primary)]">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{isSubmitting ? "Uploading..." : "Save changes"}</button>
        </div>
      </form>
    </div>
  );
}

export default EditProfileForm;
