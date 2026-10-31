import { TaskUpdateForm } from "./update-task-form"

export default async function UpdateTaskIDPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <TaskUpdateForm id={id} />
}
