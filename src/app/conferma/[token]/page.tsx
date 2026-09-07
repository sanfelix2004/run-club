import { ConfirmationForm } from "@/components/ConfirmationForm";
import { getConfirmationByToken } from "@/app/actions/participation";
import { SITE } from "@/lib/constants";
import Link from "next/link";

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function ConfermaPage({ params }: PageProps) {
  const { token } = await params;
  const result = await getConfirmationByToken(token);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFFBF7] px-4 py-12">
      {!result.success ? (
        <div className="w-full max-w-md rounded-3xl border border-red-100 bg-white p-8 text-center shadow-xl">
          <h1 className="text-xl font-bold text-forest">Link non valido</h1>
          <p className="mt-3 text-sm text-forest/60">{result.error}</p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-white"
          >
            Torna a {SITE.name}
          </Link>
        </div>
      ) : (
        <ConfirmationForm
          token={token}
          firstName={result.firstName}
          lastName={result.lastName}
          eventTitle={result.eventTitle}
          eventDateLabel={result.eventDateLabel}
          initialStatus={result.participationStatus}
        />
      )}
    </div>
  );
}
