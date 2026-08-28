import Link from "next/link";

type PrivacyConsentFieldProps = {
  id: string;
  name?: string;
  required?: boolean;
  error?: string;
  className?: string;
};

export function PrivacyConsentField({
  id,
  name = "acceptPrivacy",
  required = true,
  error,
  className,
}: PrivacyConsentFieldProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-forest/70">
        <input
          id={id}
          name={name}
          type="checkbox"
          value="true"
          required={required}
          className="mt-1 h-4 w-4 shrink-0 rounded border-emerald-200 text-emerald-500 focus:ring-emerald-400"
        />
        <span>
          Ho letto e accetto l&apos;{" "}
          <Link href="/privacy" target="_blank" className="font-medium text-emerald-600 hover:underline">
            informativa privacy
          </Link>{" "}
          e i{" "}
          <Link href="/termini" target="_blank" className="font-medium text-emerald-600 hover:underline">
            termini e condizioni
          </Link>
          .
        </span>
      </label>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
