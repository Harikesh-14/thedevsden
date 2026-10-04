export interface ITask {
  _id: string
  task: string
  description: string
  dueDate: Date
  priority: string
  isCompleted: boolean
  createdAt: Date
  updatedAt: Date
}
