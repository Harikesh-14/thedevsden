import EditYapClient from "./edit-yap-client";

export default async function EditYapPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="mt-5">
      <EditYapClient slug={slug} />
    </div>
  );
}
