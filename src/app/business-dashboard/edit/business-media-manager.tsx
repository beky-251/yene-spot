"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ImagePlus,
  LoaderCircle,
  Trash2,
  Upload,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type GalleryImage = {
  id: string;
  image_url: string;
  display_order: number;
};

type Props = {
  businessId: string;
  businessName: string;
  logoUrl: string | null;
  coverImageUrl: string | null;
  initialImages: GalleryImage[];
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_GALLERY_IMAGES = 10;

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function storagePath(url: string, bucket: string): string | null {
  try {
    const parsed = new URL(url);
    const marker = `/storage/v1/object/public/${bucket}/`;
    const index = parsed.pathname.indexOf(marker);

    if (index === -1) return null;

    return decodeURIComponent(
      parsed.pathname.slice(index + marker.length),
    );
  } catch {
    return null;
  }
}

async function optimizeImage(file: File, bucket: string): Promise<File> {
  const bitmap = await createImageBitmap(file);

  try {
    const maxDimension = bucket === "business-logos" ? 512 : 1600;
    const scale = Math.min(
      1,
      maxDimension / Math.max(bitmap.width, bitmap.height),
    );

    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Unable to prepare this image for upload.");
    }

    context.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) resolve(result);
          else reject(new Error("Image optimization failed."));
        },
        "image/webp",
        bucket === "business-logos" ? 0.85 : 0.80,
      );
    });

    return new File(
      [blob],
      `${file.name.replace(/\.[^.]+$/, "")}.webp`,
      { type: "image/webp", lastModified: Date.now() },
    );
  } finally {
    bitmap.close();
  }
}
function UploadCard({
  title,
  description,
  imageUrl,
  kind,
  businessName,
  busy,
  replaceImage,
}: {
  title: string;
  description: string;
  imageUrl: string | null;
  kind: "logo" | "cover";
  businessName: string;
  busy: string;
  replaceImage: (
    event: React.ChangeEvent<HTMLInputElement>,
    kind: "logo" | "cover",
  ) => Promise<void>;
}) {
  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <h3 className="font-bold text-gray-900">{title}</h3>
      <p className="mt-1 text-xs text-gray-500">{description}</p>

      <div
        className={`mt-4 overflow-hidden rounded-xl bg-gray-100 ${
          kind === "logo" ? "flex h-40 items-center justify-center" : "aspect-[16/7]"
        }`}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${businessName} ${kind}`}
            width={1200}
            height={525}
            unoptimized
            className={`${
              kind === "logo"
                ? "h-36 w-36 rounded-xl object-cover"
                : "h-full w-full object-cover"
            }`}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-400">
            <ImagePlus size={30} />
            <span className="text-xs">No image uploaded</span>
          </div>
        )}
      </div>

      <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#FF8A24] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#E87512]">
        {busy === kind ? (
          <LoaderCircle size={16} className="animate-spin" />
        ) : (
          <Upload size={16} />
        )}
        {busy === kind
          ? "Uploading..."
          : imageUrl
            ? "Replace image"
            : "Upload image"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          disabled={Boolean(busy)}
          onChange={(event) => replaceImage(event, kind)}
        />
      </label>
    </div>
  );
}

export function BusinessMediaManager({
  businessId,
  businessName,
  logoUrl,
  coverImageUrl,
  initialImages,
}: Props) {
  const supabase = createClient();

  const [logo, setLogo] = useState(logoUrl);
  const [cover, setCover] = useState(coverImageUrl);
  const [images, setImages] = useState(initialImages);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function uploadFile(file: File, bucket: string) {
    if (!ALLOWED_TYPES[file.type]) {
      throw new Error("Choose a JPEG, PNG, or WebP image.");
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error("Each image must be 5 MB or smaller.");
    }

    const optimizedFile = await optimizeImage(file, bucket);
    const path = `${businessId}/${crypto.randomUUID()}.webp`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, optimizedFile, {
        contentType: "image/webp",
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);

    return data.publicUrl;
  }

  async function replaceImage(
    event: React.ChangeEvent<HTMLInputElement>,
    kind: "logo" | "cover",
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const bucket = kind === "logo" ? "business-logos" : "business-covers";
    const label = kind === "logo" ? "logo" : "cover image";
    const oldUrl = kind === "logo" ? logo : cover;

    setBusy(kind);
    setError("");
    setMessage("");

    let uploadedUrl: string | null = null;

    try {
      uploadedUrl = await uploadFile(file, bucket);

      const column =
        kind === "logo" ? "logo_url" : "cover_image_url";

      const { error: updateError } = await supabase
        .from("businesses")
        .update({ [column]: uploadedUrl })
        .eq("id", businessId);

      if (updateError) {
        await supabase.storage
          .from(bucket)
          .remove([storagePath(uploadedUrl, bucket)!]);

        throw new Error(updateError.message);
      }

      if (kind === "logo") {
        setLogo(uploadedUrl);
      } else {
        setCover(uploadedUrl);
      }

      const oldPath = oldUrl ? storagePath(oldUrl, bucket) : null;

      if (oldPath) {
        await supabase.storage.from(bucket).remove([oldPath]);
      }

      setMessage(`Your ${label} was updated successfully.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : `Unable to update ${label}.`,
      );
    } finally {
      setBusy("");
    }
  }

  async function addGalleryImage(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (images.length >= MAX_GALLERY_IMAGES) {
      setError(`You can add up to ${MAX_GALLERY_IMAGES} gallery photos.`);
      return;
    }

    setBusy("gallery");
    setError("");
    setMessage("");

    let uploadedUrl: string | null = null;

    try {
      uploadedUrl = await uploadFile(file, "business-images");

      const { data, error: insertError } = await supabase
        .from("business_images")
        .insert({
          business_id: businessId,
          image_url: uploadedUrl,
          display_order: images.length,
        })
        .select("id, image_url, display_order")
        .single();

      if (insertError) {
        await supabase.storage
          .from("business-images")
          .remove([storagePath(uploadedUrl, "business-images")!]);

        throw new Error(insertError.message);
      }

      setImages((current) => [...current, data]);
      setMessage("Gallery photo added successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to add gallery photo.",
      );
    } finally {
      setBusy("");
    }
  }

  async function deleteGalleryImage(image: GalleryImage) {
    if (!window.confirm("Delete this gallery photo?")) return;

    setBusy(image.id);
    setError("");
    setMessage("");

    try {
      const { error: deleteError } = await supabase
        .from("business_images")
        .delete()
        .eq("id", image.id)
        .eq("business_id", businessId);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      setImages((current) =>
        current.filter((item) => item.id !== image.id),
      );

      const path = storagePath(image.image_url, "business-images");

      if (path) {
        await supabase.storage
          .from("business-images")
          .remove([path]);
      }

      setMessage("Gallery photo deleted.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete photo.",
      );
    } finally {
      setBusy("");
    }
  }



  return (
    <section className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <div>
        <p className="text-sm font-semibold text-[#E87512]">
          Business appearance
        </p>
        <h2 className="mt-1 text-xl font-extrabold text-gray-900">
          Logo and photos
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Add quality photos to help customers recognize your business.
          JPEG, PNG and WebP are supported. Maximum 5 MB per image.
        </p>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div role="status" className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {message}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <UploadCard
          businessName={businessName}
          busy={busy}
          replaceImage={replaceImage}
          title="Business logo"
          description="A square logo works best."
          imageUrl={logo}
          kind="logo"
        />
        <UploadCard
          businessName={businessName}
          busy={busy}
          replaceImage={replaceImage}
          title="Cover image"
          description="A wide landscape photo works best."
          imageUrl={cover}
          kind="cover"
        />
      </div>

      <div className="border-t border-gray-100 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-gray-900">Gallery photos</h3>
            <p className="mt-1 text-xs text-gray-500">
              {images.length} of {MAX_GALLERY_IMAGES} photos uploaded.
            </p>
          </div>

          <label className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white ${
            busy || images.length >= MAX_GALLERY_IMAGES
              ? "cursor-not-allowed bg-gray-300"
              : "cursor-pointer bg-[#FF8A24] hover:bg-[#E87512]"
          }`}>
            {busy === "gallery" ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <ImagePlus size={16} />
            )}
            Add photo
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={Boolean(busy) || images.length >= MAX_GALLERY_IMAGES}
              onChange={addGalleryImage}
            />
          </label>
        </div>

        {images.length > 0 ? (
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100"
              >
                <Image
                  src={image.image_url}
                  alt={`${businessName} gallery photo`}
                  width={800}
                  height={600}
                  unoptimized
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => deleteGalleryImage(image)}
                  disabled={Boolean(busy)}
                  aria-label="Delete gallery photo"
                  className="absolute right-2 top-2 rounded-lg bg-white/95 p-2 text-red-600 shadow transition hover:bg-red-50 disabled:opacity-50"
                >
                  {busy === image.id ? (
                    <LoaderCircle size={17} className="animate-spin" />
                  ) : (
                    <Trash2 size={17} />
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-dashed border-gray-300 px-5 py-10 text-center">
            <ImagePlus size={30} className="mx-auto text-gray-400" />
            <p className="mt-3 text-sm font-semibold text-gray-700">
              No gallery photos yet
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Upload photos to showcase your business.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}