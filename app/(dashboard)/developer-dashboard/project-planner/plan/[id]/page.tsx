import ProjectPlanDetailsClient from "./project-plan-details-client";

export default async function ProjectPlanSpecificPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ProjectPlanDetailsClient id={id} />;
}