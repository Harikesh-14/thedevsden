"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  ArrowLeft,
  BookOpen,
  Check,
  CircleDot,
  Code2,
  GitBranch,
  Layers3,
  LoaderCircle,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type NodeType =
  | "topic"
  | "project"
  | "resource"
  | "section"
  | "decision";

type EdgeType =
  | "prerequisite"
  | "related"
  | "optional";

type RoadmapNodeData = {
  title: string;
  description: string;
  nodeType: NodeType;
  isOptional: boolean;
  data: Record<string, unknown>;
};

type RoadmapNode = Node<RoadmapNodeData>;

type RoadmapEdgeData = {
  edgeType: EdgeType;
  label: string | null;
};

type RoadmapEdge = Edge<RoadmapEdgeData>;

type NodeRecord = {
  _id: string;
  title: string;
  description?: string;
  type: NodeType;
  position: { x: number; y: number };
  isOptional?: boolean;
  data?: Record<string, unknown>;
};

type EdgeRecord = {
  _id: string;
  sourceNodeId: string;
  targetNodeId: string;
  type: EdgeType;
  label?: string | null;
};

type RoadmapRecord = {
  _id: string;
  title: string;
  description?: string;
  slug: string;
};

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const NODE_OPTIONS: {
  type: NodeType;
  label: string;
  description: string;
  icon: typeof BookOpen;
}[] = [
  {
    type: "topic",
    label: "Topic",
    description: "A concept to learn",
    icon: BookOpen,
  },
  {
    type: "project",
    label: "Project",
    description: "Something to build",
    icon: Code2,
  },
  {
    type: "resource",
    label: "Resource",
    description: "Books, courses, links",
    icon: Layers3,
  },
  {
    type: "section",
    label: "Section",
    description: "Group related topics",
    icon: GitBranch,
  },
  {
    type: "decision",
    label: "Decision",
    description: "A branching point",
    icon: CircleDot,
  },
];

function endpoint(path: string) {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_BACKEND_URL is not configured.",
    );
  }

  return `${API_URL.replace(/\/+$/, "")}${path}`;
}

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(endpoint(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    const message = Array.isArray(result?.message)
      ? result.message.join(" ")
      : result?.message;

    throw new Error(
      message || "The request could not be completed.",
    );
  }

  return result as T;
}

function RoadmapNodeCard({
  data,
  selected,
}: NodeProps<RoadmapNode>) {
  const option = NODE_OPTIONS.find(
    (item) => item.type === data.nodeType,
  );

  const Icon = option?.icon ?? BookOpen;

  return (
    <div
      className={cn(
        "min-w-52.5 max-w-62.5 rounded-2xl border bg-white shadow-sm transition-all",
        "dark:bg-[#171a19]",
        selected
          ? "border-emerald-400 ring-2 ring-emerald-500/10"
          : "border-neutral-200 hover:border-emerald-300 dark:border-white/10",
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="size-2.5! border-2! border-white! bg-emerald-500! dark:border-[#171a19]!"
      />

      <div className="flex items-start gap-3 p-3.5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
          <Icon className="size-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            <span className="text-[9px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-white/35">
              {data.nodeType}
            </span>

            {data.isOptional && (
              <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[9px] text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                Optional
              </span>
            )}
          </div>

          <p className="wrap-break-word text-sm font-semibold text-neutral-800 dark:text-white/85">
            {data.title}
          </p>

          {data.description && (
            <p className="mt-1 line-clamp-2 whitespace-pre-wrap wrap-break-word text-[11px] leading-5 text-neutral-500 dark:text-white/40">
              {data.description}
            </p>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="size-2.5! border-2! border-white! bg-emerald-500! dark:border-[#171a19]!"
      />
    </div>
  );
}

function RoadmapEditor() {
  const params = useParams<{ id: string }>();
  const roadmapId = params.id;

  const [roadmap, setRoadmap] =
    useState<RoadmapRecord | null>(null);

  const [nodes, setNodes] = useState<RoadmapNode[]>([]);
  const [edges, setEdges] = useState<RoadmapEdge[]>([]);

  const [selectedNodeId, setSelectedNodeId] =
    useState<string | null>(null);

  const [selectedEdgeId, setSelectedEdgeId] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingNode, setAddingNode] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [edgeType, setEdgeType] =
    useState<EdgeType>("prerequisite");

  const [edgeLabel, setEdgeLabel] = useState("");

  const [pendingChanges, setPendingChanges] =
    useState(0);

  const selectedNode = nodes.find(
    (node) => node.id === selectedNodeId,
  );

  const selectedEdge = edges.find(
    (edge) => edge.id === selectedEdgeId,
  );

  const nodeTypes = useMemo(
    () => ({ roadmapNode: RoadmapNodeCard }),
    [],
  );

  const loadRoadmap = useCallback(async () => {
    setLoading(true);

    try {
      const [roadmapResult, nodeResults, edgeResults] =
        await Promise.all([
          request<RoadmapRecord>(`/roadmap/${roadmapId}`),
          request<NodeRecord[]>(
            `/roadmap/${roadmapId}/nodes`,
          ),
          request<EdgeRecord[]>(
            `/roadmap/${roadmapId}/edges`,
          ),
        ]);

      setRoadmap(roadmapResult);

      setNodes(
        nodeResults.map((item) => ({
          id: item._id,
          type: "roadmapNode",
          position: item.position,
          data: {
            title: item.title,
            description: item.description ?? "",
            nodeType: item.type,
            isOptional: item.isOptional ?? false,
            data: item.data ?? {},
          },
        })),
      );

      setEdges(
        edgeResults.map((item) => ({
          id: item._id,
          source: item.sourceNodeId,
          target: item.targetNodeId,
          type: "smoothstep",
          label: item.label || item.type,
          labelStyle: {
            fontSize: 10,
            fill: "#737373",
          },
          labelBgStyle: {
            fill: "#ffffff",
            fillOpacity: 0.95,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#a3a3a3",
          },
          data: {
            edgeType: item.type,
            label: item.label ?? null,
          },
          style: {
            stroke: "#a3a3a3",
            strokeWidth: 1.5,
          },
        })),
      );

      setPendingChanges(0);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load this roadmap.",
      );
    } finally {
      setLoading(false);
    }
  }, [roadmapId]);

  useEffect(() => {
    void loadRoadmap();
  }, [loadRoadmap]);

  const onNodesChange = useCallback(
    (changes: NodeChange<RoadmapNode>[]) => {
      setNodes((current) =>
        applyNodeChanges(changes, current),
      );
    },
    [],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<RoadmapEdge>[]) => {
      setEdges((current) =>
        applyEdgeChanges(changes, current),
      );
    },
    [],
  );

  const addNode = async (type: NodeType) => {
    if (addingNode) return;

    setAddingNode(true);

    try {
      const offset = nodes.length * 30;

      const created = await request<NodeRecord>(
        `/roadmap/${roadmapId}/nodes`,
        {
          method: "POST",
          body: JSON.stringify({
            type,
            title:
              NODE_OPTIONS.find((item) => item.type === type)
                ?.label ?? "New node",
            description: "",
            position: {
              x: 250 + offset,
              y: 100 + offset,
            },
            data: {},
            isOptional: false,
          }),
        },
      );

      const node: RoadmapNode = {
        id: created._id,
        type: "roadmapNode",
        position: created.position,
        data: {
          title: created.title,
          description: created.description ?? "",
          nodeType: created.type,
          isOptional: created.isOptional ?? false,
          data: created.data ?? {},
        },
      };

      setNodes((current) => [...current, node]);
      setSelectedNodeId(node.id);
      setSelectedEdgeId(null);
      setPendingChanges((current) => current + 1);

      toast.success("Node added to your roadmap.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to add node.",
      );
    } finally {
      setAddingNode(false);
    }
  };

  const onConnect = useCallback(
    async (connection: Connection) => {
      if (
        !connection.source ||
        !connection.target ||
        connection.source === connection.target
      ) {
        toast.error("Choose two different nodes.");
        return;
      }

      const alreadyExists = edges.some(
        (edge) =>
          edge.source === connection.source &&
          edge.target === connection.target,
      );

      if (alreadyExists) {
        toast.error("This connection already exists.");
        return;
      }

      try {
        const created = await request<EdgeRecord>(
          `/roadmap/${roadmapId}/edges`,
          {
            method: "POST",
            body: JSON.stringify({
              sourceNodeId: connection.source,
              targetNodeId: connection.target,
              type: edgeType,
              label: edgeLabel.trim() || null,
            }),
          },
        );

        const newEdge: RoadmapEdge = {
          id: created._id,
          source: created.sourceNodeId,
          target: created.targetNodeId,
          type: "smoothstep",
          label: created.label || created.type,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#a3a3a3",
          },
          data: {
            edgeType: created.type,
            label: created.label ?? null,
          },
          style: {
            stroke: "#a3a3a3",
            strokeWidth: 1.5,
          },
        };

        setEdges((current) =>
          addEdge(newEdge, current),
        );

        setPendingChanges((current) => current + 1);
        toast.success("Connection created.");
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to connect these nodes.",
        );
      }
    },
    [roadmapId, edges, edgeType, edgeLabel],
  );

  const saveNode = async () => {
    if (!selectedNode) return;

    setSaving(true);

    try {
      await request<NodeRecord>(
        `/roadmap/${roadmapId}/nodes/${selectedNode.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            title: selectedNode.data.title.trim(),
            description: selectedNode.data.description,
            type: selectedNode.data.nodeType,
            isOptional: selectedNode.data.isOptional,
            data: selectedNode.data.data,
            position: selectedNode.position,
          }),
        },
      );

      setPendingChanges((current) =>
        Math.max(0, current - 1),
      );

      toast.success("Node details saved.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save node.",
      );
    } finally {
      setSaving(false);
    }
  };

  const savePosition = async (node: RoadmapNode) => {
    try {
      await request<NodeRecord>(
        `/roadmap/${roadmapId}/nodes/${node.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            position: node.position,
          }),
        },
      );
    } catch (error) {
      setPendingChanges((current) => current + 1);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save node position.",
      );
    }
  };

  const deleteNode = async () => {
    if (!selectedNode || deleting) return;

    if (!window.confirm(
      `Delete "${selectedNode.data.title}" and its connections?`,
    )) {
      return;
    }

    setDeleting(true);

    try {
      await request(
        `/roadmap/${roadmapId}/nodes/${selectedNode.id}`,
        { method: "DELETE" },
      );

      setNodes((current) =>
        current.filter(
          (node) => node.id !== selectedNode.id,
        ),
      );

      setEdges((current) =>
        current.filter(
          (edge) =>
            edge.source !== selectedNode.id &&
            edge.target !== selectedNode.id,
        ),
      );

      setSelectedNodeId(null);
      toast.success("Node deleted.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete node.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const deleteEdge = async () => {
    if (!selectedEdge || deleting) return;

    setDeleting(true);

    try {
      await request(
        `/roadmap/${roadmapId}/edges/${selectedEdge.id}`,
        { method: "DELETE" },
      );

      setEdges((current) =>
        current.filter(
          (edge) => edge.id !== selectedEdge.id,
        ),
      );

      setSelectedEdgeId(null);
      toast.success("Connection deleted.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete connection.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const updateSelectedNode = (
    updates: Partial<RoadmapNodeData>,
  ) => {
    if (!selectedNodeId) return;

    setNodes((current) =>
      current.map((node) =>
        node.id === selectedNodeId
          ? {
              ...node,
              data: { ...node.data, ...updates },
            }
          : node,
      ),
    );

    setPendingChanges((current) => current + 1);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white dark:bg-transparent">
        <LoaderCircle className="size-6 animate-spin text-emerald-600" />
      </main>
    );
  }

  if (!roadmap) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6 dark:bg-transparent">
        <div className="text-center">
          <h1 className="text-lg font-semibold text-neutral-800 dark:text-white/85">
            Roadmap unavailable
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Check the roadmap ID and your backend connection.
          </p>
          <Link
            href="/developer-dashboard/roadmap"
            className="mt-4 inline-block text-sm text-emerald-700 dark:text-emerald-400"
          >
            Back to roadmaps
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-white dark:bg-[#101211]">
      {/* Header */}
      <header className="z-10 flex min-h-17 shrink-0 items-center justify-between gap-4 border-b border-neutral-200 px-4 sm:px-6 dark:border-white/[0.07]">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/developer-dashboard/roadmap"
            className="flex size-9 shrink-0 items-center justify-center rounded-xl text-neutral-500 transition-colors hover:bg-neutral-100 dark:text-white/50 dark:hover:bg-white/5"
            aria-label="Back to roadmaps"
          >
            <ArrowLeft className="size-4" />
          </Link>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-neutral-800 dark:text-white/85">
              {roadmap.title}
            </p>
            <div className="mt-1 flex items-center gap-1.5 text-[10px] text-neutral-400 dark:text-white/35">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {pendingChanges > 0
                ? `${pendingChanges} unsaved change(s)`
                : "Connected to your roadmap"}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => void loadRoadmap()}
            className="hidden h-9 items-center gap-2 rounded-xl border border-neutral-200 px-3 text-xs font-medium text-neutral-600 hover:bg-neutral-50 sm:flex dark:border-white/10 dark:text-white/60 dark:hover:bg-white/5"
          >
            Reload
          </button>

          <button
            onClick={() =>
              void addNode("topic")
            }
            disabled={addingNode}
            className="flex h-9 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/15"
          >
            <Plus className="size-3.5" />
            Add node
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Left toolbar */}
        <aside className="z-5 hidden w-51.25 shrink-0 overflow-y-auto border-r border-neutral-200 p-4 md:block dark:border-white/[0.07]">
          <p className="mb-3 text-[10px] font-semibold tracking-[0.16em] text-neutral-400 uppercase dark:text-white/30">
            Add to roadmap
          </p>

          <div className="space-y-2">
            {NODE_OPTIONS.map((option) => {
              const Icon = option.icon;

              return (
                <button
                  key={option.type}
                  disabled={addingNode}
                  onClick={() => void addNode(option.type)}
                  className="flex w-full items-center gap-3 rounded-xl border border-neutral-200 p-3 text-left transition-colors hover:border-emerald-300 hover:bg-emerald-50/40 disabled:opacity-50 dark:border-white/[0.07] dark:hover:border-emerald-500/30 dark:hover:bg-emerald-500/5"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold text-neutral-700 dark:text-white/75">
                      {option.label}
                    </span>
                    <span className="mt-1 block text-[10px] leading-4 text-neutral-400 dark:text-white/35">
                      {option.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-xl border border-neutral-200 p-3 dark:border-white/[0.07]">
            <p className="text-xs font-semibold text-neutral-700 dark:text-white/75">
              Quick tips
            </p>
            <ul className="mt-3 space-y-3 text-[11px] leading-5 text-neutral-500 dark:text-white/40">
              <li>Drag nodes to arrange your learning path.</li>
              <li>Drag a node handle to another node to connect them.</li>
              <li>Select a node to edit its details.</li>
              <li>Select a connection to remove it.</li>
            </ul>
          </div>
        </aside>

        {/* Graph canvas */}
        <section className="relative min-w-0 flex-1">
          {nodes.length === 0 && (
            <div className="pointer-events-none absolute inset-0 z-4 flex items-center justify-center p-6">
              <div className="max-w-sm rounded-2xl border border-neutral-200 bg-white/95 p-6 text-center shadow-sm backdrop-blur dark:border-white/10 dark:bg-[#171a19]/95">
                <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <GitBranch className="size-5" />
                </div>
                <h2 className="mt-4 text-base font-semibold text-neutral-800 dark:text-white/85">
                  Build your learning path
                </h2>
                <p className="mt-2 text-xs leading-6 text-neutral-500 dark:text-white/40">
                  Start with a topic, add projects and resources,
                  then connect everything into your own roadmap.
                </p>
                <button
                  onClick={() => void addNode("topic")}
                  className="pointer-events-auto mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  <Plus className="size-4" />
                  Add your first topic
                </button>
              </div>
            </div>
          )}

          <div className="absolute left-3 top-3 z-5 flex items-center gap-2 rounded-xl border border-neutral-200 bg-white/95 px-3 py-2 shadow-sm backdrop-blur dark:border-white/10 dark:bg-[#171a19]/95">
            <GitBranch className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[11px] font-medium text-neutral-600 dark:text-white/60">
              {nodes.length} nodes · {edges.length} connections
            </span>
          </div>

          <ReactFlow<RoadmapNode, RoadmapEdge>
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={(_, node) => {
              setSelectedNodeId(node.id);
              setSelectedEdgeId(null);
            }}
            onEdgeClick={(_, edge) => {
              setSelectedEdgeId(edge.id);
              setSelectedNodeId(null);
              setEdgeType(
                edge.data?.edgeType ?? "prerequisite",
              );
              setEdgeLabel(edge.data?.label ?? "");
            }}
            onPaneClick={() => {
              setSelectedNodeId(null);
              setSelectedEdgeId(null);
            }}
            onConnect={(connection) => void onConnect(connection)}
            onNodeDragStop={(_, node) => {
              void savePosition(node);
            }}
            fitView
            deleteKeyCode={null}
            colorMode="light"
            defaultEdgeOptions={{
              type: "smoothstep",
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: "#a3a3a3",
              },
            }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="#d4d4d4"
            />
            <Controls
              className="overflow-hidden! rounded-xl! border-neutral-200! shadow-sm! dark:border-white/10!"
            />
            <MiniMap
              pannable
              zoomable
              nodeColor={(node) =>
                node.selected ? "#10b981" : "#a7d8c1"
              }
              className="overflow-hidden! rounded-xl! border! border-neutral-200! bg-white! dark:border-white/10! dark:bg-[#171a19]!"
            />
          </ReactFlow>

          {/* Mobile node toolbar */}
          <div className="absolute bottom-3 left-3 right-3 z-5 flex gap-2 overflow-x-auto rounded-xl border border-neutral-200 bg-white/95 p-2 shadow-sm backdrop-blur md:hidden dark:border-white/10 dark:bg-[#171a19]/95">
            {NODE_OPTIONS.map((option) => {
              const Icon = option.icon;

              return (
                <button
                  key={option.type}
                  onClick={() => void addNode(option.type)}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg border border-neutral-200 px-2.5 py-2 text-[10px] font-medium text-neutral-600 dark:border-white/10 dark:text-white/60"
                >
                  <Icon className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Right inspector */}
        <aside className="z-6 flex w-72.5 shrink-0 flex-col overflow-y-auto border-l border-neutral-200 bg-white dark:border-white/[0.07] dark:bg-[#121413] max-sm:absolute max-sm:bottom-0 max-sm:right-0 max-sm:top-17 max-sm:w-[min(320px,88vw)] max-sm:shadow-xl">
          {selectedNode ? (
            <>
              <div className="flex items-center justify-between border-b border-neutral-100 p-4 dark:border-white/[0.07]">
                <div>
                  <h2 className="text-sm font-semibold text-neutral-800 dark:text-white/85">
                    Node details
                  </h2>
                  <p className="mt-1 text-[10px] text-neutral-400 dark:text-white/35">
                    Edit this roadmap item
                  </p>
                </div>
                <button
                  onClick={() => setSelectedNodeId(null)}
                  className="flex size-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5"
                  aria-label="Close inspector"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="flex-1 space-y-5 p-4">
                <div>
                  <label className="mb-2 block text-xs font-semibold text-neutral-700 dark:text-white/65">
                    Node title
                  </label>
                  <input
                    maxLength={100}
                    value={selectedNode.data.title}
                    onChange={(event) =>
                      updateSelectedNode({
                        title: event.target.value,
                      })
                    }
                    className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-xs text-neutral-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10 dark:border-white/10 dark:bg-white/3 dark:text-white/80"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-neutral-700 dark:text-white/65">
                    Node type
                  </label>
                  <select
                    value={selectedNode.data.nodeType}
                    onChange={(event) =>
                      updateSelectedNode({
                        nodeType: event.target.value as NodeType,
                      })
                    }
                    className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-xs text-neutral-700 outline-none focus:border-emerald-400 dark:border-white/10 dark:bg-[#171a19] dark:text-white/75"
                  >
                    {NODE_OPTIONS.map((option) => (
                      <option
                        key={option.type}
                        value={option.type}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-neutral-700 dark:text-white/65">
                    Description
                  </label>
                  <textarea
                    rows={5}
                    maxLength={2000}
                    value={selectedNode.data.description}
                    onChange={(event) =>
                      updateSelectedNode({
                        description: event.target.value,
                      })
                    }
                    placeholder="What should you learn here?"
                    className="w-full resize-y rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-xs leading-5 text-neutral-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10 dark:border-white/10 dark:bg-white/3 dark:text-white/75"
                  />
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 p-3 dark:border-white/10">
                  <input
                    type="checkbox"
                    checked={selectedNode.data.isOptional}
                    onChange={(event) =>
                      updateSelectedNode({
                        isOptional: event.target.checked,
                      })
                    }
                    className="mt-0.5 accent-emerald-600"
                  />
                  <span>
                    <span className="block text-xs font-semibold text-neutral-700 dark:text-white/75">
                      Optional node
                    </span>
                    <span className="mt-1 block text-[10px] leading-4 text-neutral-400 dark:text-white/35">
                      This item isn't essential to the learning path.
                    </span>
                  </span>
                </label>

                <button
                  onClick={() => void saveNode()}
                  disabled={saving || !selectedNode.data.title.trim()}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                >
                  {saving ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  Save node
                </button>

                <button
                  onClick={() => void deleteNode()}
                  disabled={deleting}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-500/20 dark:text-red-400 dark:hover:bg-red-500/5"
                >
                  <Trash2 className="size-3.5" />
                  Delete node
                </button>
              </div>
            </>
          ) : selectedEdge ? (
            <>
              <div className="flex items-center justify-between border-b border-neutral-100 p-4 dark:border-white/[0.07]">
                <div>
                  <h2 className="text-sm font-semibold text-neutral-800 dark:text-white/85">
                    Connection details
                  </h2>
                  <p className="mt-1 text-[10px] text-neutral-400 dark:text-white/35">
                    Manage the relationship
                  </p>
                </div>
                <button
                  onClick={() => setSelectedEdgeId(null)}
                  className="flex size-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5"
                  aria-label="Close inspector"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="space-y-5 p-4">
                <div>
                  <label className="mb-2 block text-xs font-semibold text-neutral-700 dark:text-white/65">
                    Relationship type
                  </label>
                  <select
                    value={edgeType}
                    onChange={(event) =>
                      setEdgeType(event.target.value as EdgeType)
                    }
                    className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-xs dark:border-white/10 dark:bg-[#171a19] dark:text-white/75"
                  >
                    <option value="prerequisite">Prerequisite</option>
                    <option value="related">Related</option>
                    <option value="optional">Optional</option>
                  </select>
                  <p className="mt-2 text-[10px] leading-5 text-neutral-400">
                    To change relationship type, delete this connection and recreate it with the desired type.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-neutral-700 dark:text-white/65">
                    Connection label
                  </label>
                  <input
                    value={edgeLabel}
                    onChange={(event) =>
                      setEdgeLabel(event.target.value)
                    }
                    placeholder="e.g. Learn this first"
                    className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-xs dark:border-white/10 dark:bg-white/3 dark:text-white/75"
                  />
                </div>

                <button
                  onClick={() => void deleteEdge()}
                  disabled={deleting}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-500/20 dark:text-red-400"
                >
                  <Trash2 className="size-3.5" />
                  Delete connection
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                <CircleDot className="size-5" />
              </div>
              <h2 className="mt-4 text-sm font-semibold text-neutral-800 dark:text-white/85">
                Your workspace
              </h2>
              <p className="mt-2 text-xs leading-5 text-neutral-500 dark:text-white/40">
                Select a node or connection to view its settings.
                Add a node to start building your learning path.
              </p>

              <div className="mt-5 w-full rounded-xl border border-neutral-200 p-3 text-left dark:border-white/[0.07]">
                <p className="text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
                  Current graph
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-neutral-500 dark:text-white/45">
                    Nodes
                  </span>
                  <span className="text-xs font-semibold text-neutral-800 dark:text-white/75">
                    {nodes.length}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-neutral-500 dark:text-white/45">
                    Connections
                  </span>
                  <span className="text-xs font-semibold text-neutral-800 dark:text-white/75">
                    {edges.length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Connection type controls */}
      <footer className="flex min-h-12 shrink-0 flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-4 py-2 dark:border-white/[0.07]">
        <div className="flex items-center gap-2">
          <GitBranch className="size-3.5 text-neutral-400" />
          <span className="text-[10px] text-neutral-500 dark:text-white/40">
            New connections:
          </span>
          <select
            value={edgeType}
            onChange={(event) =>
              setEdgeType(event.target.value as EdgeType)
            }
            className="rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-[10px] text-neutral-600 dark:border-white/10 dark:bg-[#171a19] dark:text-white/60"
          >
            <option value="prerequisite">Prerequisite</option>
            <option value="related">Related</option>
            <option value="optional">Optional</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-neutral-400 dark:text-white/35">
          <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
          Nodes and connections save through your API
        </div>
      </footer>
    </main>
  );
}

export default function RoadmapEditorPage() {
  return (
    <ReactFlowProvider>
      <RoadmapEditor />
    </ReactFlowProvider>
  );
}