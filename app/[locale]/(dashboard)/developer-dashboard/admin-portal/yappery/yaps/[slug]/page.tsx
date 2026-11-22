import YapDetailsClient from "./yap-details-client";

export default async function SpecificYapPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <div className="mt-5">
    <YapDetailsClient slug={slug} />
  </div>;
}
