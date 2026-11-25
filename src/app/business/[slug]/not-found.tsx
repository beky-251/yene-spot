import Link from "next/link";
import { ArrowLeft, Store } from "lucide-react";

export default function BusinessNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-muted px-5">
      <div className="w-full max-w-md rounded-3xl border border-border bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-light text-brand">
          <Store size={30} />
        </div>

        <h1 className="mt-6 text-2xl font-extrabold text-text-primary">
          Business not found
        </h1>

        <p className="mt-3 text-sm leading-7 text-text-secondary">
          This business may not exist or may not be publicly available.
        </p>

        <Link
          href="/explore"
          className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-dark"
        >
          <ArrowLeft size={17} />
          Back to Explore
        </Link>
      </div>
    </main>
  );
}