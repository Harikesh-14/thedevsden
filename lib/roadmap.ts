import { CircleHelp, Code2, Database, GitBranch, Layers } from "lucide-react"

export interface IRoadmap {
  _id: string
  title: string
  description: string
  category: string
  createdAt: Date
  updatedAt: Date
}

export type NodeType = "topic" | "project" | "resource" | "section" | "decision";
export type EdgeType = "prerequisite" | "related" | "optional";

export type Position = { x: number; y: number };

export type RoadmapNode = {
  _id: string;
  roadmapId: string;
  title: string;
  description: string;
  type: NodeType;
  position: Position;
  isOptional: boolean;
  data: Record<string, unknown>;
};

export type RoadmapEdge = {
  _id: string;
  roadmapId: string;
  sourceNodeId: string;
  targetNodeId: string;
  type: EdgeType;
  label: string | null;
};

export type Roadmap = {
  _id: string;
  title: string;
  description: string;
  slug: string;
  visibility?: string;
};

export type View = { x: number; y: number; k: number };

export const NODE_TYPES: {
  value: NodeType;
  label: string;
  hint: string;
  icon: typeof Code2;
  text: string;
  chip: string;
}[] = [
  {
    value: "topic",
    label: "Topic",
    hint: "A concept to learn",
    icon: CircleHelp,
    text: "text-emerald-600 dark:text-emerald-400",
    chip: "bg-emerald-500/10",
  },
  {
    value: "project",
    label: "Project",
    hint: "Something to build",
    icon: Code2,
    text: "text-blue-600 dark:text-blue-400",
    chip: "bg-blue-500/10",
  },
  {
    value: "resource",
    label: "Resource",
    hint: "A link or reference",
    icon: Database,
    text: "text-violet-600 dark:text-violet-400",
    chip: "bg-violet-500/10",
  },
  {
    value: "section",
    label: "Section",
    hint: "Group related steps",
    icon: Layers,
    text: "text-amber-600 dark:text-amber-400",
    chip: "bg-amber-500/10",
  },
  {
    value: "decision",
    label: "Decision",
    hint: "A fork in the path",
    icon: GitBranch,
    text: "text-rose-600 dark:text-rose-400",
    chip: "bg-rose-500/10",
  },
];

export const EDGE_TYPES: {
  value: EdgeType;
  label: string;
  color: string;
  dash?: string;
}[] = [
  { value: "prerequisite", label: "Prerequisite", color: "#059669" },
  { value: "related", label: "Related", color: "#0d9488", dash: "1 6" },
  { value: "optional", label: "Optional path", color: "#a1a1aa", dash: "8 6" },
];