import EditProjectPlanClient from "./edit-project-plan-client";

export default async function EditProjectPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <EditProjectPlanClient id={id} />;
}
