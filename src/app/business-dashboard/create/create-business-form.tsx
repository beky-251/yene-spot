"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, LoaderCircle } from "lucide-react";
import {
  createBusiness,
  type CreateBusinessState,
} from "./actions";

type Category = {
  id: string;
  name: string;
};

const initialState: CreateBusinessState = {};

export function CreateBusinessForm({
  categories,
}: {
  categories: Category[];
}) {
  const [state, formAction, pending] = useActionState(
    createBusiness,
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
          Add your business
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Provide accurate information so customers can discover your business.
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
                Tell customers what your business is.
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
              placeholder="e.g. Jimma Coffee House"
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
              defaultValue=""
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#FF8A24] focus:ring-2 focus:ring-orange-100"
            >
              <option value="" disabled>Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {categories.length === 0 && (
              <p className="mt-2 text-sm text-amber-700">
                No active categories are currently available.
              </p>
            )}
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
              placeholder="Describe your products, services, and what makes your business special."
              className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#FF8A24] focus:ring-2 focus:ring-orange-100"
            />
          </div>
        </section>

        <section className="space-y-5">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="font-bold text-[#171717]">Contact information</h2>
            <p className="mt-1 text-xs text-gray-500">
              Help customers reach your business.
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
                placeholder="hello@example.com"
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
              Where can customers find you?
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
                defaultValue="Jimma"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#FF8A24] focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>
        </section>

        <div className="rounded-xl border border-orange-100 bg-orange-50 p-4 text-sm leading-6 text-orange-900">
          <strong>Admin approval required:</strong> Your listing will be saved
          as pending. It will become publicly visible after an administrator
          reviews and approves it.
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
            {pending ? "Submitting..." : "Submit for approval"}
          </button>
        </div>
      </form>
    </div>
  );
}