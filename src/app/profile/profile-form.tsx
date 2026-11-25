"use client";

import Image from "next/image";
import { useRef, useState, type FormEvent, type ChangeEvent } from "react";
import {
  Camera,
  CheckCircle2,
  LoaderCircle,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ProfileFormProps = {
  userId: string;
  initialName: string;
  email: string;
  initialAvatar: string | null;
  role: string;
};

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

export default function ProfileForm({
  userId,
  initialName,
  email,
  initialAvatar,
  role,
}: ProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [avatar, setAvatar] = useState(initialAvatar);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setError("");
    setMessage("");

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Choose a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setError("Your image must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);

    if (preview) URL.revokeObjectURL(preview);

    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    const trimmedName = name.trim();

    if (trimmedName.length < 2 || trimmedName.length > 120) {
      setError("Your name must contain between 2 and 120 characters.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    const supabase = createClient();
    let uploadedPath: string | null = null;

    try {
      let nextAvatar = avatar;

      if (selectedFile) {
        const extensionByType: Record<string, string> = {
          "image/jpeg": "jpg",
          "image/png": "png",
          "image/webp": "webp",
        };

        const extension = extensionByType[selectedFile.type];
        const filePath = `${userId}/avatar-${Date.now()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("user-avatars")
          .upload(filePath, selectedFile, {
            contentType: selectedFile.type,
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        uploadedPath = filePath;

        const { data: publicUrlData } = supabase.storage
          .from("user-avatars")
          .getPublicUrl(filePath);

        nextAvatar = publicUrlData.publicUrl;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: trimmedName,
          avatar_url: nextAvatar,
        })
        .eq("id", userId);

      if (updateError) throw updateError;

      setName(trimmedName);
      setAvatar(nextAvatar);
      setSelectedFile(null);

      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);

      if (fileInput.current) {
        fileInput.current.value = "";
      }

      setMessage("Your profile has been updated successfully.");
    } catch (submitError) {
      console.error("Profile update failed:", submitError);

      if (uploadedPath) {
        const { error: cleanupError } = await supabase.storage
          .from("user-avatars")
          .remove([uploadedPath]);

        if (cleanupError) {
          console.error("Avatar cleanup failed:", cleanupError);
        }
      }

      setError("We couldn't update your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const avatarSource = preview || avatar;
  const roleLabels: Record<string, string> = {
    customer: "Customer",
    business_owner: "Business owner",
    admin: "Administrator",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-50 ring-4 ring-orange-50">
          {avatarSource ? (
            <Image
              src={avatarSource}
              alt="Your profile photo"
              fill
              unoptimized
              sizes="96px"
              className="object-cover"
            />
          ) : (
            <UserRound className="h-11 w-11 text-brand" />
          )}
        </div>

        <div>
          <h3 className="font-bold text-text-primary">Profile photo</h3>
          <p className="mt-1 text-sm text-text-secondary">
            JPG, PNG, or WebP. Maximum file size: 5 MB.
          </p>
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarChange}
            className="sr-only"
            id="profile-avatar"
            disabled={saving}
          />
          <label
            htmlFor="profile-avatar"
            className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-text-primary transition hover:border-brand hover:text-brand"
          >
            <Camera size={16} />
            Choose photo
          </label>
          {selectedFile && (
            <p className="mt-2 text-xs text-text-secondary">
              Selected: {selectedFile.name}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-text-primary">
            Full name
          </span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            minLength={2}
            maxLength={120}
            autoComplete="name"
            disabled={saving}
            className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10 disabled:bg-surface-muted"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-text-primary">
            Email address
          </span>
          <input
            type="email"
            value={email}
            readOnly
            className="h-12 w-full cursor-not-allowed rounded-xl border border-border bg-surface-muted px-4 text-sm text-text-secondary outline-none"
          />
          <span className="mt-2 block text-xs text-text-secondary">
            Your registered email address cannot be edited here.
          </span>
        </label>

        <div className="sm:col-span-2">
          <span className="mb-2 block text-sm font-bold text-text-primary">
            Account type
          </span>
          <div className="flex h-12 items-center gap-2 rounded-xl border border-border bg-surface-muted px-4 text-sm text-text-secondary">
            <ShieldCheck size={17} className="text-brand" />
            {roleLabels[role] ?? "Member"}
          </div>
          <span className="mt-2 block text-xs text-text-secondary">
            Account permissions are managed separately and cannot be changed here.
          </span>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {message && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
        >
          <CheckCircle2 size={19} className="shrink-0" />
          {message}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 border-t border-border pt-6">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-bold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <>
              <LoaderCircle size={17} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={17} />
              Save changes
            </>
          )}
        </button>
        <span className="text-xs text-text-secondary">
          Your profile is visible according to your account permissions.
        </span>
      </div>
    </form>
  );
}