"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, LoaderCircle } from "lucide-react";
import {
  updateBusiness,
  type UpdateBusinessState,
} from "../actions";

type Category = {
  id: string;
  name: string;
};

type Business = {
  id: string;
  name: string;
  category_id: string | null;
  description: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  neighborhood: string | null;
  city: string;
  opening_hours: Record<string, unknown> | null;
};

const initialState: UpdateBusinessState = {};

const HOUR_GROUPS = [
  { key: "weekdays", label: "Monday – Friday" },
  { key: "weekends", label: "Saturday – Sunday" },
] as const;

function getGroupHours(
  openingHours: Record<string, unknown> | null,
  group: "weekdays" | "weekends",
) {
  const legacyKeys =
    group === "weekdays"
      ? ["monday", "tuesday", "wednesday", "thursday", "friday"]
      : ["saturday", "sunday"];

  const value =
    openingHours?.[group] ??
    legacyKeys.map((key) => openingHours?.[key]).find((entry) => entry != null);

  if (typeof value === "string") {
    const match = value.match(/(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})/);
    return match
      ? { open: match[1], close: match[2], closed: false }
      : { open: "09:00", close: "17:00", closed: value.toLowerCase() === "closed" };
  }

  if (value && typeof value === "object") {
    const entry = value as Record<string, unknown>;
    return {
      open: String(entry.open ?? entry.opening ?? entry.open_time ?? "09:00"),
      close: String(entry.close ?? entry.closing ?? entry.close_time ?? "17:00"),
      closed: entry.closed === true || entry.is_closed === true,
    };
  }

  return { open: "09:00", close: "17:00", closed: false };
}
export function EditBusinessForm({
  business,
  categories,
}: {
  business: Business;
  categories: Category[];
}) {
  const updateWithId = updateBusiness.bind(null, business.id);

  const [state, formAction, pending] = useActionState(
    updateWithId,
    initialState,
  );

  return (
    <div className="space-y-6">
      <Link
        href="/business-dashboard"
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-[#E87512]"
      >
        <ArrowLeft size={16} />
        Back to dashboard
      </Link>

      <div>
        <p className="text-sm font-semibold text-[#E87512]">
          Business workspace
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-[#171717]">
          Edit your business
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Update your business information and help customers find you.
        </p>
      </div>

      <form
        action={formAction}
        className="space-y-7 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
      >
        {state.error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {state.error}
          </div>
        )}

        <section className="space-y-5">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#E87512]">
              <Building2 size={20} />
            </span>
            <div>
              <h2 className="font-bold text-[#171717]">Basic information</h2>
              <p className="text-xs text-gray-500">
                Update your business identity and description.
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-semibold text-gray-700">
              Business name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              required
              maxLength={120}
              defaultValue={business.name}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#FF8A24] focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div>
            <label htmlFor="category_id" className="mb-2 block text-sm font-semibold text-gray-700">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category_id"
              name="category_id"
              required
              defaultValue={business.category_id ?? ""}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#FF8A24] focus:ring-2 focus:ring-orange-100"
            >
              <option value="" disabled>Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="mb-2 block text-sm font-semibold text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              maxLength={5000}
              defaultValue={business.description ?? ""}
              className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#FF8A24] focus:ring-2 focus:ring-orange-100"
            />
          </div>
        </section>

        <section className="space-y-5">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="font-bold text-[#171717]">Contact information</h2>
            <p className="mt-1 text-xs text-gray-500">
              Keep your business contact details up to date.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-gray-700">
                Phone number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                maxLength={40}
                defaultValue={business.phone ?? ""}
                placeholder="+251 ..."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#FF8A24] focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div>
              <label htmlFor="whatsapp" className="mb-2 block text-sm font-semibold text-gray-700">
                WhatsApp number
              </label>
              <input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                maxLength={40}
                defaultValue={business.whatsapp ?? ""}
                placeholder="+251 ..."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#FF8A24] focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                maxLength={254}
                defaultValue={business.email ?? ""}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#FF8A24] focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div>
              <label htmlFor="website" className="mb-2 block text-sm font-semibold text-gray-700">
                Website
              </label>
              <input
                id="website"
                name="website"
                type="url"
                maxLength={500}
                defaultValue={business.website ?? ""}
                placeholder="https://example.com"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#FF8A24] focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="font-bold text-[#171717]">Business location</h2>
            <p className="mt-1 text-xs text-gray-500">
              Help customers find your business.
            </p>
          </div>

          <div>
            <label htmlFor="address" className="mb-2 block text-sm font-semibold text-gray-700">
              Street address
            </label>
            <input
              id="address"
              name="address"
              maxLength={300}
              defaultValue={business.address ?? ""}
              placeholder="Building, street, or nearby landmark"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#FF8A24] focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="neighborhood" className="mb-2 block text-sm font-semibold text-gray-700">
                Neighborhood
              </label>
              <input
                id="neighborhood"
                name="neighborhood"
                maxLength={120}
                defaultValue={business.neighborhood ?? ""}
                placeholder="e.g. Ginjo"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#FF8A24] focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div>
              <label htmlFor="city" className="mb-2 block text-sm font-semibold text-gray-700">
                City <span className="text-red-500">*</span>
              </label>
              <input
                id="city"
                name="city"
                required
                maxLength={100}
                defaultValue={business.city}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#FF8A24] focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="font-bold text-[#171717]">Opening hours</h2>
            <p className="mt-1 text-xs text-gray-500">
              Set one schedule for weekdays and another for weekends.
            </p>
          </div>

          <div className="space-y-4">
            {HOUR_GROUPS.map((group) => {
              const hours = getGroupHours(business.opening_hours, group.key);

              return (
                <div
                  key={group.key}
                  className="grid gap-3 rounded-xl border border-gray-100 p-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end"
                >
                  <div className="sm:col-span-4">
                    <h3 className="text-sm font-bold text-gray-800">
                      {group.label}
                    </h3>
                  </div>

                  <div>
                    <label
                      htmlFor={`${group.key}-open`}
                      className="mb-1 block text-xs text-gray-500"
                    >
                      Opens
                    </label>
                    <input
                      id={`${group.key}-open`}
                      name={`hours_${group.key}_open`}
                      type="time"
                      defaultValue={hours.open}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`${group.key}-close`}
                      className="mb-1 block text-xs text-gray-500"
                    >
                      Closes
                    </label>
                    <input
                      id={`${group.key}-close`}
                      name={`hours_${group.key}_close`}
                      type="time"
                      defaultValue={hours.close}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>

                  <label className="flex items-center gap-2 pb-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      name={`hours_${group.key}_closed`}
                      value="true"
                      defaultChecked={hours.closed}
                      className="h-4 w-4 accent-[#E87512]"
                    />
                    Closed
                  </label>
                </div>
              );
            })}
          </div>
        </section>

        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
          <strong>Approval status protected:</strong> Saving changes will not
          let you modify your listing&apos;s approval or featured status. Those
          remain under administrator control.
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 pt-5">
          <Link
            href="/business-dashboard"
            className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={pending || categories.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF8A24] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#E87512] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending && <LoaderCircle size={17} className="animate-spin" />}
            {pending ? "Saving changes..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}