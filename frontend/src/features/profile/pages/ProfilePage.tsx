import { useState } from "react";

import { normalizeApiError } from "../../../api/errors";
import ErrorState from "../../../components/layout/ui/ErrorState";
import { useToast } from "../../../components/layout/ui/toast-context";
import { useAuth } from "../../../domain/auth/useAuth";
import type { UpdateProfileRequest } from "../../../domain/contracts/user.contracts";
import { isSafeImageUrl } from "../../../lib/safe-url";
import ChangePasswordForm from "../components/ChangePasswordForm";
import EditProfileForm from "../components/EditProfileForm";
import { useChangePassword, useProfile, useUpdateProfile, useUploadProfilePicture } from "../hooks/useProfile";

function ProfileSkeleton() {
  return <div className="space-y-6" aria-busy="true"><div className="h-8 w-36 animate-pulse rounded-md bg-[var(--border)]" /><div className="h-64 animate-pulse rounded-lg border border-[var(--border)] bg-[var(--surface)]" /></div>;
}

function ProfilePage() {
  const { showToast } = useToast();
  const { refreshUser } = useAuth();
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const profileQuery = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadProfilePicture = useUploadProfilePicture();
  const changePasswordMutation = useChangePassword();
  const profileData = profileQuery.data?.data ?? null;
  const user = profileData && { ...profileData, profilePicture: profileData.profilePicture && isSafeImageUrl(profileData.profilePicture) ? profileData.profilePicture : null };
  const isLoading = profileQuery.isLoading;
  const error = profileQuery.error ? normalizeApiError(profileQuery.error).message || "We couldn't load your profile." : null;
  const isSubmitting = updateProfile.isPending || uploadProfilePicture.isPending || changePasswordMutation.isPending;
  const loadProfile = () => void profileQuery.refetch();

  const saveProfile = async (payload: UpdateProfileRequest) => {
    try {
      await updateProfile.mutateAsync(payload);
      await refreshUser();
      setSuccess("Profile updated successfully.");
      showToast("Profile updated successfully.", "success");
    } catch (caughtError) {
      throw new Error(normalizeApiError(caughtError).message || "We couldn't update your profile.", { cause: caughtError });
    }
  };

  const uploadPicture = async (file: File) => {
    try {
      await uploadProfilePicture.mutateAsync(file);
      await refreshUser();
      setSuccess("Profile picture updated successfully.");
      showToast("Profile picture updated successfully.", "success");
    } catch (caughtError) {
      throw new Error(normalizeApiError(caughtError).message || "We couldn't upload your profile picture.", { cause: caughtError });
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await changePasswordMutation.mutateAsync({ currentPassword, newPassword });
      setSuccess("Password changed successfully.");
      showToast("Password changed successfully.", "success");
      setIsChangingPassword(false);
    } catch (caughtError) {
      throw new Error(normalizeApiError(caughtError).message, { cause: caughtError });
    }
  };

  const initials = user?.username.slice(0, 1).toUpperCase() ?? "?";

  if (isLoading) return <main className="p-4 md:p-6"><div className="mx-auto max-w-3xl"><ProfileSkeleton /></div></main>;
  if (error || !user) return <main className="p-4 md:p-6"><div className="mx-auto max-w-3xl"><ErrorState title="Profile unavailable" message={error ?? "We couldn't load your profile."} onRetry={loadProfile} /></div></main>;

  return (
    <main className="p-4 md:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <header><p className="text-sm font-medium uppercase tracking-wide text-[var(--text-secondary)]">Account</p><h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)]">Profile</h1></header>
        {success && <p className="rounded-md bg-[var(--primary-light)] p-3 text-sm font-medium text-[var(--primary)]" role="status">{success}</p>}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="flex min-w-0 items-center gap-4">
              {user.profilePicture ? <img src={user.profilePicture} alt="Profile" className="h-16 w-16 rounded-full border border-[var(--border)] object-cover" /> : <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary-light)] text-xl font-bold text-[var(--primary)]">{initials}</div>}
              <div className="min-w-0"><h2 className="truncate text-lg font-semibold text-[var(--text-primary)]">{user.username}</h2><p className="truncate text-sm text-[var(--text-secondary)]">{user.email}</p></div>
            </div>
            <button type="button" onClick={() => setIsEditing(true)} className="rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium">Edit profile</button>
          </div>
          <dl className="mt-6 grid gap-4 border-t border-[var(--border)] pt-5 sm:grid-cols-3"><div><dt className="text-xs font-medium uppercase text-[var(--text-secondary)]">Status</dt><dd className="mt-1 text-sm font-medium text-[var(--income)]">{user.status}</dd></div><div><dt className="text-xs font-medium uppercase text-[var(--text-secondary)]">Email</dt><dd className="mt-1 truncate text-sm text-[var(--text-primary)]">{user.email}</dd></div><div><dt className="text-xs font-medium uppercase text-[var(--text-secondary)]">Member since</dt><dd className="mt-1 text-sm text-[var(--text-primary)]">{new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(user.createdAt))}</dd></div></dl>
        </section>
        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm"><h2 className="text-lg font-semibold text-[var(--text-primary)]">Security</h2><p className="mt-1 text-sm text-[var(--text-secondary)]">Update your password while keeping your current session active.</p><button type="button" onClick={() => setIsChangingPassword(true)} className="mt-4 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white">Change password</button></section>
        {isEditing && <EditProfileForm user={user} isSubmitting={isSubmitting} onClose={() => setIsEditing(false)} onSubmit={saveProfile} onUpload={uploadPicture} />}
        {isChangingPassword && <ChangePasswordForm isSubmitting={isSubmitting} onClose={() => setIsChangingPassword(false)} onSubmit={changePassword} />}
      </div>
    </main>
  );
}

export default ProfilePage;
