export interface Project {
  _id: string
  title: string
  description: string
  type: string
  skills: string[]
  href: string
  icon: string
  slug: string
  isFeatured: boolean
  createdAt: string
  updatedAt: string
}

export type Filter = "all" | "featured"