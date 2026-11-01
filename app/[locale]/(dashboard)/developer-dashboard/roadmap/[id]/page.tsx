"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CircleAlert,
  GitFork,
  Layers,
  Link2,
  LoaderCircle,
  Maximize2,
  Plus,
  RotateCw,
  Save,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { EDGE_TYPES, EdgeType, NODE_TYPES, NodeType, Position, Roadmap, RoadmapEdge, RoadmapNode, View } from "@/lib/roadmap";

const NODE_WIDTH = 240;
const NODE_HEIGHT = 116;
const WORLD_WIDTH = 3600;
const WORLD_HEIGHT = 2400;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 1.6;
const GRID = 24;

const fieldClass =
  "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-base outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 sm:text-sm dark:border-white/10 dark:bg-[#171a19]";
const labelClass =
  "mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-300";
const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-transparent dark:text-zinc-200 dark:hover:bg-white/5";
const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50";
const btnDanger =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-500/20 dark:text-red-400 dark:hover:bg-red-500/10";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

async function readResponse<T>(response: Response): Promise<T> {
  const json = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      json?.message
        ? Array.isArray(json.message)
          ? json.message.join(", ")
          : json.message
        : `Request failed (${response.status})`
    );
  }

  // Support APIs that return either the resource directly or { data: resource }.
  return (json?.data ?? json) as T;
}

function unwrapList<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object") {
    const object = value as Record<string, unknown>;
    if (Array.isArray(object.items)) return object.items as T[];
    if (Array.isArray(object.nodes)) return object.nodes as T[];
    if (Array.isArray(object.edges)) return object.edges as T[];
  }
  return [];
}

function normalizeNode(raw: RoadmapNode): RoadmapNode {
  return {
    ...raw,
    title: raw.title ?? "",
    description: raw.description ?? "",
    type: raw.type ?? "topic",
    position: {
      x: Number(raw.position?.x ?? 100),
      y: Number(raw.position?.y ?? 100),
    },
    isOptional: Boolean(raw.isOptional),
    data:
      raw.data && typeof raw.data === "object" && !Array.isArray(raw.data)
        ? raw.data
        : {},
  };
}

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const typeMeta = (type: NodeType) =>
  NODE_TYPES.find((item) => item.value === type) ?? NODE_TYPES[0];

const edgeMeta = (type: EdgeType) =>
  EDGE_TYPES.find((item) => item.value === type) ?? EDGE_TYPES[0];

function edgeGeometry(source: RoadmapNode, target: RoadmapNode) {
  const sc = {
    x: source.position.x + NODE_WIDTH / 2,
    y: source.position.y + NODE_HEIGHT / 2,
  };
  const tc = {
    x: target.position.x + NODE_WIDTH / 2,
    y: target.position.y + NODE_HEIGHT / 2,
  };
  const dx = tc.x - sc.x;
  const dy = tc.y - sc.y;

  let a: Position, b: Position, ca: Position, cb: Position;

  if (Math.abs(dx) * NODE_HEIGHT >= Math.abs(dy) * NODE_WIDTH) {
    const dir = dx >= 0 ? 1 : -1;
    a = { x: sc.x + (dir * NODE_WIDTH) / 2, y: sc.y };
    b = { x: tc.x - (dir * NODE_WIDTH) / 2, y: tc.y };
    const offset = Math.max(40, Math.abs(b.x - a.x) / 2);
    ca = { x: a.x + dir * offset, y: a.y };
    cb = { x: b.x - dir * offset, y: b.y };
  } else {
    const dir = dy >= 0 ? 1 : -1;
    a = { x: sc.x, y: sc.y + (dir * NODE_HEIGHT) / 2 };
    b = { x: tc.x, y: tc.y - (dir * NODE_HEIGHT) / 2 };
    const offset = Math.max(40, Math.abs(b.y - a.y) / 2);
    ca = { x: a.x, y: a.y + dir * offset };
    cb = { x: b.x, y: b.y - dir * offset };
  }

  return {
    d: `M ${a.x} ${a.y} C ${ca.x} ${ca.y}, ${cb.x} ${cb.y}, ${b.x} ${b.y}`,
    mid: {
      x: (a.x + 3 * ca.x + 3 * cb.x + b.x) / 8,
      y: (a.y + 3 * ca.y + 3 * cb.y + b.y) / 8,
    },
  };
}

/* -------------------------------------------------------------------------- */
/*  Small presentational pieces                                                */
/* -------------------------------------------------------------------------- */

function EdgeTypePicker({
  value,
  onChange,
  layout,
}: {
  value: EdgeType;
  onChange: (value: EdgeType) => void;
  layout: "stack" | "row";
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Connection type"
      className={layout === "stack" ? "flex flex-col gap-1" : "flex gap-1"}
    >
      {EDGE_TYPES.map((type) => {
        const active = value === type.value;
        return (
          <button
            key={type.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(type.value)}
            className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
              active
                ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300"
                : "border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5"
            }`}
          >
            <svg width="22" height="8" aria-hidden="true">
              <line
                x1="1"
                y1="4"
                x2="21"
                y2="4"
                stroke={type.color}
                strokeWidth="2"
                strokeDasharray={type.dash}
                strokeLinecap="round"
              />
            </svg>
            {type.label}
          </button>
        );
      })}
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
  disabled,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center text-zinc-600 transition hover:bg-zinc-100 disabled:opacity-40 dark:text-zinc-300 dark:hover:bg-white/5"
    >
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function EditRoadmapPage() {
  const params = useParams();
  const router = useRouter();
  const roadmapId = String(params.id);

  const canvasRef = useRef<HTMLDivElement>(null);
  const fittedRef = useRef(false);
  const justDraggedRef = useRef(false);

  const dragRef = useRef<{
    nodeId: string;
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);

  const panRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
    captured: boolean;
  } | null>(null);

  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [nodes, setNodes] = useState<RoadmapNode[]>([]);
  const [edges, setEdges] = useState<RoadmapEdge[]>([]);
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [view, setView] = useState<View>({ x: 40, y: 40, k: 1 });

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [cursor, setCursor] = useState<Position | null>(null);
  const [connectionType, setConnectionType] =
    useState<EdgeType>("prerequisite");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [jsonText, setJsonText] = useState("{}");
  const [jsonError, setJsonError] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const selectedNode =
    nodes.find((node) => node._id === selectedNodeId) ?? null;
  const selectedEdge =
    edges.find((edge) => edge._id === selectedEdgeId) ?? null;
  const inspectorOpen = Boolean(selectedNode || selectedEdge);
  const hasUnsaved = dirty.size > 0;

  const api = useCallback(async <T,>(path: string, init?: RequestInit) => {
    const response = await apiFetch(path, init);
    return readResponse<T>(response);
  }, []);

  /* ----------------------------- data loading ----------------------------- */

  const loadRoadmap = useCallback(async () => {
    setLoading(true);
    setError("");
    fittedRef.current = false;

    try {
      const [roadmapResponse, nodeResponse, edgeResponse] = await Promise.all([
        api<unknown>(`/roadmap/${roadmapId}`),
        api<unknown>(`/roadmap/${roadmapId}/nodes`),
        api<unknown>(`/roadmap/${roadmapId}/edges`),
      ]);

      const roadmapValue =
        roadmapResponse &&
        typeof roadmapResponse === "object" &&
        "roadmap" in roadmapResponse
          ? (roadmapResponse as { roadmap: Roadmap }).roadmap
          : (roadmapResponse as Roadmap);

      setRoadmap(roadmapValue);
      setNodes(unwrapList<RoadmapNode>(nodeResponse).map(normalizeNode));
      setEdges(unwrapList<RoadmapEdge>(edgeResponse));
      setDirty(new Set());
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
      setConnectingFrom(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load this roadmap."
      );
    } finally {
      setLoading(false);
    }
  }, [api, roadmapId]);

  useEffect(() => {
    void loadRoadmap();
  }, [loadRoadmap]);

  /* ------------------------------ viewport -------------------------------- */

  const fitView = useCallback((list: RoadmapNode[]) => {
    const el = canvasRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();

    if (list.length === 0) {
      setView({ x: 40, y: 40, k: 1 });
      return;
    }

    const minX = Math.min(...list.map((n) => n.position.x));
    const minY = Math.min(...list.map((n) => n.position.y));
    const maxX = Math.max(...list.map((n) => n.position.x + NODE_WIDTH));
    const maxY = Math.max(...list.map((n) => n.position.y + NODE_HEIGHT));
    const pad = 56;
    const bw = maxX - minX;
    const bh = maxY - minY;
    const k = clamp(
      Math.min((width - pad * 2) / bw, (height - pad * 2) / bh),
      MIN_ZOOM,
      1
    );

    setView({
      k,
      x: (width - bw * k) / 2 - minX * k,
      y: (height - bh * k) / 2 - minY * k,
    });
  }, []);

  // Fit once after each load.
  useEffect(() => {
    if (loading || fittedRef.current) return;
    fittedRef.current = true;
    fitView(nodes);
  }, [loading, nodes, fitView]);

  const zoomAt = useCallback((factor: number, cx: number, cy: number) => {
    setView((v) => {
      const k = clamp(v.k * factor, MIN_ZOOM, MAX_ZOOM);
      const ratio = k / v.k;
      return { k, x: cx - (cx - v.x) * ratio, y: cy - (cy - v.y) * ratio };
    });
  }, []);

  const zoomBy = (factor: number) => {
    const el = canvasRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    zoomAt(factor, rect.width / 2, rect.height / 2);
  };

  // Native wheel handling: scroll to pan, Ctrl/⌘ + scroll (or pinch) to zoom.
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (event.ctrlKey || event.metaKey) {
        const rect = el.getBoundingClientRect();
        zoomAt(
          Math.exp(-event.deltaY * 0.01),
          event.clientX - rect.left,
          event.clientY - rect.top
        );
      } else {
        setView((v) => ({ ...v, x: v.x - event.deltaX, y: v.y - event.deltaY }));
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [loading, zoomAt]);

  const toWorld = (clientX: number, clientY: number): Position => {
    const rect = canvasRef.current?.getBoundingClientRect();
    return {
      x: (clientX - (rect?.left ?? 0) - view.x) / view.k,
      y: (clientY - (rect?.top ?? 0) - view.y) / view.k,
    };
  };

  /* ------------------------------ node state ------------------------------ */

  const updateNode = useCallback(
    (nodeId: string, patch: Partial<RoadmapNode>) => {
      setNodes((current) =>
        current.map((node) =>
          node._id === nodeId ? { ...node, ...patch } : node
        )
      );
      setDirty((current) => new Set(current).add(nodeId));
    },
    []
  );

  const moveNode = (nodeId: string, position: Position) => {
    setNodes((current) =>
      current.map((node) => (node._id === nodeId ? { ...node, position } : node))
    );
  };

  // Reset per-selection state when the selection changes.
  useEffect(() => {
    const node = nodes.find((item) => item._id === selectedNodeId);
    setJsonText(JSON.stringify(node?.data ?? {}, null, 2));
    setJsonError("");
    setConfirmDelete(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNodeId]);

  // Auto-dismiss success notices.
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  // Warn before leaving with unsaved edits.
  useEffect(() => {
    if (!hasUnsaved) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsaved]);

  /* ------------------------------- actions -------------------------------- */

  const addNode = async (type: NodeType) => {
    setAdding(true);
    setError("");
    setNotice("");

    // Drop the new node at the centre of what the user is currently looking at.
    const rect = canvasRef.current?.getBoundingClientRect();
    const centerX = ((rect?.width ?? 600) / 2 - view.x) / view.k;
    const centerY = ((rect?.height ?? 400) / 2 - view.y) / view.k;
    const nudge = (nodes.length % 5) * 28;
    const position = {
      x: Math.round(clamp(centerX - NODE_WIDTH / 2 + nudge, 0, WORLD_WIDTH - NODE_WIDTH)),
      y: Math.round(clamp(centerY - NODE_HEIGHT / 2 + nudge, 0, WORLD_HEIGHT - NODE_HEIGHT)),
    };

    try {
      const created = await api<RoadmapNode>(`/roadmap/${roadmapId}/nodes`, {
        method: "POST",
        body: JSON.stringify({
          title: `New ${type}`,
          description: "",
          type,
          isOptional: false,
          data: {},
          position,
        }),
      });

      const normalized = normalizeNode(created);
      setNodes((current) => [...current, normalized]);
      setSelectedNodeId(normalized._id);
      setSelectedEdgeId(null);
      setConnectingFrom(null);
      setNotice("Node created.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create node.");
    } finally {
      setAdding(false);
    }
  };

  const saveAll = async () => {
    if (saving) return;

    if (jsonError) {
      setError("Fix the invalid JSON in Custom data before saving.");
      return;
    }

    const targets = nodes.filter((node) => dirty.has(node._id));
    if (targets.length === 0) {
      setNotice("Everything is already saved.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    const results = await Promise.allSettled(
      targets.map((node) =>
        api<RoadmapNode>(`/roadmap/${roadmapId}/nodes/${node._id}`, {
          method: "PATCH",
          body: JSON.stringify({
            title: node.title,
            description: node.description,
            type: node.type,
            isOptional: node.isOptional,
            data: node.data,
            position: node.position,
          }),
        })
      )
    );

    const savedIds: string[] = [];
    let failed = 0;
    let firstMessage = "";

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        savedIds.push(targets[index]._id);
      } else {
        failed += 1;
        if (!firstMessage && result.reason instanceof Error) {
          firstMessage = result.reason.message;
        }
      }
    });

    setDirty((current) => {
      const next = new Set(current);
      savedIds.forEach((id) => next.delete(id));
      return next;
    });

    if (failed > 0) {
      setError(
        `Saved ${savedIds.length}, ${failed} failed${
          firstMessage ? `: ${firstMessage}` : "."
        }`
      );
    } else {
      setNotice(
        `Saved ${savedIds.length} node${savedIds.length === 1 ? "" : "s"}.`
      );
    }

    setSaving(false);
  };

  const reload = () => {
    if (hasUnsaved && !window.confirm("Discard your unsaved changes?")) return;
    void loadRoadmap();
  };

  const deleteSelectedNode = async () => {
    if (!selectedNode) return;

    setDeleting(true);
    setError("");
    setNotice("");

    try {
      await api<unknown>(`/roadmap/${roadmapId}/nodes/${selectedNode._id}`, {
        method: "DELETE",
      });

      setNodes((current) =>
        current.filter((node) => node._id !== selectedNode._id)
      );
      setEdges((current) =>
        current.filter(
          (edge) =>
            edge.sourceNodeId !== selectedNode._id &&
            edge.targetNodeId !== selectedNode._id
        )
      );
      setDirty((current) => {
        const next = new Set(current);
        next.delete(selectedNode._id);
        return next;
      });
      setSelectedNodeId(null);
      setConnectingFrom(null);
      setConfirmDelete(false);
      setNotice("Node deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete node.");
    } finally {
      setDeleting(false);
    }
  };

  const deleteSelectedEdge = async () => {
    if (!selectedEdge) return;

    setDeleting(true);
    setError("");
    setNotice("");

    try {
      await api<unknown>(`/roadmap/${roadmapId}/edges/${selectedEdge._id}`, {
        method: "DELETE",
      });
      setEdges((current) =>
        current.filter((edge) => edge._id !== selectedEdge._id)
      );
      setSelectedEdgeId(null);
      setNotice("Connection deleted.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete connection."
      );
    } finally {
      setDeleting(false);
    }
  };

  const startConnect = (nodeId: string) => {
    setConnectingFrom((current) => (current === nodeId ? null : nodeId));
    setSelectedEdgeId(null);
    setCursor(null);
    setError("");
    setNotice("");
  };

  const handleNodeClick = async (nodeId: string) => {
    if (justDraggedRef.current) return;

    setSelectedEdgeId(null);

    if (!connectingFrom) {
      setSelectedNodeId(nodeId);
      return;
    }

    if (connectingFrom === nodeId) {
      setConnectingFrom(null);
      return;
    }

    const duplicate = edges.some(
      (edge) =>
        edge.sourceNodeId === connectingFrom &&
        edge.targetNodeId === nodeId &&
        edge.type === connectionType
    );

    if (duplicate) {
      setError("That connection already exists.");
      setConnectingFrom(null);
      return;
    }

    setError("");
    setNotice("");

    try {
      const created = await api<RoadmapEdge>(`/roadmap/${roadmapId}/edges`, {
        method: "POST",
        body: JSON.stringify({
          sourceNodeId: connectingFrom,
          targetNodeId: nodeId,
          type: connectionType,
          label: null,
        }),
      });

      setEdges((current) => [...current, created]);
      setSelectedEdgeId(created._id);
      setSelectedNodeId(null);
      setNotice("Connection created.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not create connection. Check for prerequisite cycles."
      );
    } finally {
      setConnectingFrom(null);
    }
  };

  /* --------------------------- node dragging ------------------------------ */

  const beginDrag = (
    event: ReactPointerEvent<HTMLDivElement>,
    node: RoadmapNode
  ) => {
    if ((event.target as HTMLElement).closest("button")) return;
    if (connectingFrom) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    dragRef.current = {
      nodeId: node._id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: node.position.x,
      originY: node.position.y,
      moved: false,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;

    if (!drag.moved && Math.hypot(dx, dy) < 3) return;
    drag.moved = true;

    moveNode(drag.nodeId, {
      x: Math.round(clamp(drag.originX + dx / view.k, 0, WORLD_WIDTH - NODE_WIDTH)),
      y: Math.round(clamp(drag.originY + dy / view.k, 0, WORLD_HEIGHT - NODE_HEIGHT)),
    });
  };

  const finishDrag = async (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    dragRef.current = null;
    if (!drag.moved) return;

    // Swallow the click that follows a drag so it doesn't change selection.
    justDraggedRef.current = true;
    window.setTimeout(() => {
      justDraggedRef.current = false;
    }, 60);

    const node = nodes.find((item) => item._id === drag.nodeId);
    if (!node) return;

    setError("");
    try {
      await api<RoadmapNode>(`/roadmap/${roadmapId}/nodes/${node._id}`, {
        method: "PATCH",
        body: JSON.stringify({ position: node.position }),
      });
    } catch (err) {
      // Keep it flagged so "Save all" retries the position.
      setDirty((current) => new Set(current).add(node._id));
      setError(
        err instanceof Error
          ? `Position could not be saved: ${err.message}`
          : "Position could not be saved. Use Save all to retry."
      );
    }
  };

  /* ---------------------------- canvas panning ---------------------------- */

  const onCanvasPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("[data-node],[data-edge]")) return;
    if (event.pointerType === "mouse" && event.button !== 0 && event.button !== 1)
      return;

    panRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: view.x,
      originY: view.y,
      moved: false,
      captured: false,
    };
  };

  const onCanvasPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (connectingFrom) setCursor(toWorld(event.clientX, event.clientY));

    const pan = panRef.current;
    if (!pan || pan.pointerId !== event.pointerId) return;

    const dx = event.clientX - pan.startX;
    const dy = event.clientY - pan.startY;
    if (!pan.moved && Math.hypot(dx, dy) < 4) return;

    if (!pan.captured) {
      event.currentTarget.setPointerCapture(event.pointerId);
      pan.captured = true;
    }
    pan.moved = true;
    setView((v) => ({ ...v, x: pan.originX + dx, y: pan.originY + dy }));
  };

  const onCanvasPointerUp = () => {
    const pan = panRef.current;
    panRef.current = null;
    if (!pan || pan.moved) return;

    // A plain click on empty space clears the selection.
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setConnectingFrom(null);
  };

  /* ------------------------------ shortcuts ------------------------------- */

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target?.closest("input,textarea,select,[contenteditable='true']");

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void saveAll();
        return;
      }

      if (typing) return;

      if (event.key === "Escape") {
        setConnectingFrom(null);
        setConfirmDelete(false);
        setSelectedNodeId(null);
        setSelectedEdgeId(null);
      } else if (event.key === "Delete" || event.key === "Backspace") {
        if (selectedNode) {
          event.preventDefault();
          setConfirmDelete(true);
        } else if (selectedEdge) {
          event.preventDefault();
          void deleteSelectedEdge();
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  /* ------------------------------- render --------------------------------- */

  const nodeById = (id: string) => nodes.find((node) => node._id === id);
  const sourceNode = connectingFrom ? nodeById(connectingFrom) : null;
  const connectedEdges = selectedNode
    ? edges.filter(
        (edge) =>
          edge.sourceNodeId === selectedNode._id ||
          edge.targetNodeId === selectedNode._id
      )
    : [];

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-white text-zinc-600 dark:bg-[#101312] dark:text-zinc-300">
        <LoaderCircle className="mr-3 h-5 w-5 animate-spin text-emerald-600" />
        Loading roadmap...
      </div>
    );
  }

  if (!roadmap && error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-6 text-zinc-900 dark:bg-[#101312] dark:text-zinc-100">
        <div className="w-full max-w-sm rounded-2xl border border-zinc-200 p-6 text-center dark:border-white/10">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-500/10">
            <CircleAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="font-semibold">Couldn&apos;t open this roadmap</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{error}</p>
          <button onClick={() => void loadRoadmap()} className={`${btnPrimary} mt-5`}>
            <RotateCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      </div>
    );
  }

  const selectedMeta = selectedNode ? typeMeta(selectedNode.type) : null;

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-white text-zinc-900 dark:bg-neutral-950 dark:text-zinc-100">
      {/* ------------------------------ Header ------------------------------ */}
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-200 px-3 py-3 dark:border-white/10 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="rounded-xl border border-zinc-200 p-2 transition hover:bg-zinc-100 dark:border-white/10 dark:hover:bg-white/5"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold tracking-tight sm:text-lg">
              {roadmap?.title ?? "Roadmap editor"}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {nodes.length} node{nodes.length === 1 ? "" : "s"} · {edges.length}{" "}
              connection{edges.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {hasUnsaved && (
            <span className="hidden items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 sm:inline-flex dark:bg-amber-500/10 dark:text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              {dirty.size} unsaved
            </span>
          )}
          <button
            onClick={reload}
            disabled={saving}
            aria-label="Reload roadmap"
            className={btnGhost}
          >
            <RotateCw className="h-4 w-4" />
            <span className="hidden sm:inline">Reload</span>
          </button>
          <button
            onClick={() => void saveAll()}
            disabled={saving || !hasUnsaved}
            title="Save all (Ctrl/⌘ + S)"
            className={btnPrimary}
          >
            {saving ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Saving..." : "Save all"}
          </button>
        </div>
      </header>

      {/* ------------------------------ Toast ------------------------------- */}
      {(error || notice) && (
        <div
          role={error ? "alert" : "status"}
          className={`fixed left-1/2 top-17 z-50 flex w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur ${
            error
              ? "border-red-200 bg-red-50/95 text-red-700 dark:border-red-500/30 dark:bg-[#2a1517]/95 dark:text-red-300"
              : "border-emerald-200 bg-emerald-50/95 text-emerald-800 dark:border-emerald-500/30 dark:bg-[#0f2a20]/95 dark:text-emerald-300"
          }`}
        >
          {error ? (
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <Check className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <p className="min-w-0 flex-1 wrap-break-word">{error || notice}</p>
          <button
            onClick={() => {
              setError("");
              setNotice("");
            }}
            aria-label="Dismiss message"
            className="opacity-70 transition hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* ----------------------------- Palette ----------------------------- */}
        <aside className="flex shrink-0 gap-2 overflow-x-auto border-b border-zinc-200 p-2.5 dark:border-white/10 lg:w-52.5 lg:flex-col lg:overflow-y-auto lg:overflow-x-visible lg:border-b-0 lg:border-r lg:p-4">
          <p className="hidden px-1 pb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500 lg:block">
            Add a node
          </p>

          {NODE_TYPES.map(({ value, label, hint, icon: Icon, text, chip }) => (
            <button
              key={value}
              onClick={() => void addNode(value)}
              disabled={adding}
              className="group inline-flex shrink-0 items-center gap-2.5 rounded-xl border border-zinc-200 px-2.5 py-2 text-left text-sm transition hover:border-emerald-500/50 hover:bg-emerald-50 disabled:opacity-50 dark:border-white/10 dark:hover:bg-emerald-500/10"
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${chip} ${text}`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block font-medium leading-4">{label}</span>
                <span className="hidden text-[11px] leading-4 text-zinc-500 lg:block dark:text-zinc-400">
                  {hint}
                </span>
              </span>
              <Plus className="ml-auto hidden h-3.5 w-3.5 text-zinc-400 transition group-hover:text-emerald-600 lg:block" />
            </button>
          ))}

          <div className="mt-3 hidden lg:block">
            <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              New connection type
            </p>
            <EdgeTypePicker
              value={connectionType}
              onChange={setConnectionType}
              layout="stack"
            />
          </div>

          <div className="mt-3 hidden rounded-xl bg-zinc-50 p-3 text-xs leading-5 text-zinc-500 lg:block dark:bg-white/3 dark:text-zinc-400">
            <GitFork className="mb-2 h-4 w-4 text-emerald-600" />
            Drag the dot on a node&apos;s edge to start a connection, then click
            the node it should lead to. Positions save as you drag; text edits
            save with <span className="font-medium">Save all</span>.
          </div>
        </aside>

        {/* ----------------------------- Canvas ------------------------------ */}
        <section className="relative min-h-0 min-w-0 flex-1">
          {/* Status chip */}
          <div className="absolute left-3 top-3 z-10 flex max-w-[calc(100%-4.5rem)] flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-zinc-200 bg-white/95 px-3 py-2 text-xs text-zinc-600 shadow-sm backdrop-blur dark:border-white/10 dark:bg-[#171a19]/95 dark:text-zinc-300">
            {connectingFrom ? (
              <>
                <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
                  <Link2 className="h-3.5 w-3.5" />
                  Pick a target for{" "}
                  <span className="max-w-40 truncate">
                    {sourceNode?.title || "this node"}
                  </span>
                </span>
                <EdgeTypePicker
                  value={connectionType}
                  onChange={setConnectionType}
                  layout="row"
                />
                <button
                  onClick={() => setConnectingFrom(null)}
                  className="font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                >
                  Cancel
                </button>
              </>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <GitFork className="h-3.5 w-3.5 text-emerald-600" />
                <span className="sm:hidden">Drag to pan · tap a node</span>
                <span className="hidden sm:inline">
                  Drag to pan · Ctrl/⌘ + scroll to zoom · Click a node to edit
                </span>
              </span>
            )}
          </div>

          {/* Zoom controls */}
          <div className="absolute right-3 top-3 z-10 flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white/95 shadow-sm backdrop-blur dark:border-white/10 dark:bg-[#171a19]/95 [&>*+*]:border-t [&>*+*]:border-zinc-200 dark:[&>*+*]:border-white/10">
            <IconButton label="Zoom in" onClick={() => zoomBy(1.2)} disabled={view.k >= MAX_ZOOM}>
              <ZoomIn className="h-4 w-4" />
            </IconButton>
            <div
              className="flex h-7 items-center justify-center text-[11px] font-medium tabular-nums text-zinc-500 dark:text-zinc-400"
              aria-live="polite"
            >
              {Math.round(view.k * 100)}%
            </div>
            <IconButton label="Zoom out" onClick={() => zoomBy(1 / 1.2)} disabled={view.k <= MIN_ZOOM}>
              <ZoomOut className="h-4 w-4" />
            </IconButton>
            <IconButton label="Fit roadmap to screen" onClick={() => fitView(nodes)}>
              <Maximize2 className="h-4 w-4" />
            </IconButton>
          </div>

          <div
            ref={canvasRef}
            onPointerDown={onCanvasPointerDown}
            onPointerMove={onCanvasPointerMove}
            onPointerUp={onCanvasPointerUp}
            onPointerCancel={() => {
              panRef.current = null;
            }}
            className={`absolute inset-0 overflow-hidden bg-zinc-50 dark:bg-[#0d100f] ${
              connectingFrom ? "cursor-crosshair" : "cursor-grab active:cursor-grabbing"
            }`}
            style={{
              touchAction: "none",
              backgroundImage:
                "radial-gradient(circle, rgba(16,185,129,0.22) 1px, transparent 1px)",
              backgroundSize: `${GRID * view.k}px ${GRID * view.k}px`,
              backgroundPosition: `${view.x}px ${view.y}px`,
            }}
          >
            <div
              className="absolute left-0 top-0 rounded-3xl border border-dashed border-emerald-500/20"
              style={{
                width: WORLD_WIDTH,
                height: WORLD_HEIGHT,
                transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})`,
                transformOrigin: "0 0",
              }}
            >
              <svg
                className="pointer-events-none absolute inset-0 overflow-visible"
                width={WORLD_WIDTH}
                height={WORLD_HEIGHT}
                aria-label="Roadmap connections"
              >
                <defs>
                  {EDGE_TYPES.map((type) => (
                    <marker
                      key={type.value}
                      id={`rm-arrow-${type.value}`}
                      viewBox="0 0 10 10"
                      refX="8"
                      refY="5"
                      markerWidth="5"
                      markerHeight="5"
                      orient="auto"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 z" fill={type.color} />
                    </marker>
                  ))}
                  <marker
                    id="rm-arrow-preview"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="5"
                    markerHeight="5"
                    orient="auto"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
                  </marker>
                </defs>

                {edges.map((edge) => {
                  const source = nodeById(edge.sourceNodeId);
                  const target = nodeById(edge.targetNodeId);
                  if (!source || !target) return null;

                  const meta = edgeMeta(edge.type);
                  const { d, mid } = edgeGeometry(source, target);
                  const selected = selectedEdgeId === edge._id;

                  return (
                    <g key={edge._id}>
                      <path
                        d={d}
                        data-edge
                        fill="none"
                        stroke="transparent"
                        strokeWidth="22"
                        className="pointer-events-auto cursor-pointer"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedNodeId(null);
                          setSelectedEdgeId(edge._id);
                        }}
                      />
                      {selected && (
                        <path
                          d={d}
                          fill="none"
                          stroke="#10b981"
                          strokeOpacity="0.2"
                          strokeWidth="10"
                          strokeLinecap="round"
                        />
                      )}
                      <path
                        d={d}
                        fill="none"
                        stroke={meta.color}
                        strokeWidth={selected ? 3 : 2}
                        strokeDasharray={meta.dash}
                        strokeLinecap="round"
                        markerEnd={`url(#rm-arrow-${edge.type})`}
                      />
                      {edge.label && (
                        <text
                          x={mid.x}
                          y={mid.y - 8}
                          textAnchor="middle"
                          fontSize="12"
                          fill="currentColor"
                          strokeWidth="4"
                          paintOrder="stroke"
                          className="stroke-zinc-50 text-zinc-600 dark:stroke-[#0d100f] dark:text-zinc-300"
                        >
                          {edge.label}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Live preview while connecting */}
                {sourceNode && cursor && (
                  <path
                    d={`M ${sourceNode.position.x + NODE_WIDTH} ${
                      sourceNode.position.y + NODE_HEIGHT / 2
                    } C ${sourceNode.position.x + NODE_WIDTH + 70} ${
                      sourceNode.position.y + NODE_HEIGHT / 2
                    }, ${cursor.x - 70} ${cursor.y}, ${cursor.x} ${cursor.y}`}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeDasharray="6 5"
                    strokeLinecap="round"
                    markerEnd="url(#rm-arrow-preview)"
                  />
                )}
              </svg>

              {nodes.map((node) => {
                const meta = typeMeta(node.type);
                const Icon = meta.icon;
                const selected = selectedNodeId === node._id;
                const isSource = connectingFrom === node._id;
                const unsaved = dirty.has(node._id);

                return (
                  <div
                    key={node._id}
                    data-node
                    role="button"
                    tabIndex={0}
                    aria-label={`${meta.label}: ${node.title || "Untitled node"}`}
                    aria-pressed={selected}
                    onPointerDown={(event) => beginDrag(event, node)}
                    onPointerMove={moveDrag}
                    onPointerUp={(event) => void finishDrag(event)}
                    onPointerCancel={(event) => void finishDrag(event)}
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleNodeClick(node._id);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        void handleNodeClick(node._id);
                      }
                    }}
                    style={{
                      position: "absolute",
                      left: node.position.x,
                      top: node.position.y,
                      width: NODE_WIDTH,
                      height: NODE_HEIGHT,
                      touchAction: "none",
                    }}
                    className={`group select-none rounded-2xl border bg-white p-3.5 shadow-sm outline-none transition-[box-shadow,border-color] focus-visible:ring-2 focus-visible:ring-emerald-500/40 dark:bg-[#171a19] ${
                      connectingFrom ? "cursor-crosshair" : "cursor-grab active:cursor-grabbing"
                    } ${node.isOptional || node.type === "section" ? "border-dashed" : ""} ${
                      selected || isSource
                        ? "border-emerald-500 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/20"
                        : "border-zinc-200 hover:border-emerald-500/50 dark:border-white/10"
                    } ${
                      connectingFrom && !isSource
                        ? "hover:ring-2 hover:ring-emerald-500/30"
                        : ""
                    }`}
                  >
                    <div className="mb-2 flex items-center gap-2.5">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.chip} ${meta.text}`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[10px] font-medium uppercase tracking-[0.13em] text-zinc-500 dark:text-zinc-400">
                          {meta.label}
                          {node.isOptional ? " · Optional" : ""}
                        </p>
                        <p className="truncate text-sm font-semibold">
                          {node.title || "Untitled node"}
                        </p>
                      </div>
                      {unsaved && (
                        <span
                          title="Unsaved changes"
                          className="h-2 w-2 shrink-0 rounded-full bg-amber-500"
                        />
                      )}
                    </div>

                    <p className="line-clamp-2 whitespace-pre-wrap wrap-break-word text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                      {node.description || "No description yet."}
                    </p>

                    {/* Connection handle */}
                    <button
                      type="button"
                      aria-label="Connect from this node"
                      title="Connect to another node"
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={(event) => {
                        event.stopPropagation();
                        startConnect(node._id);
                      }}
                      className={`absolute -right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border-2 border-emerald-500 bg-white text-emerald-600 shadow-sm transition hover:scale-110 hover:bg-emerald-500 hover:text-white dark:bg-[#171a19] ${
                        selected || isSource
                          ? "opacity-100"
                          : "opacity-0 focus-visible:opacity-100 group-hover:opacity-100"
                      }`}
                    >
                      {isSource ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Plus className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {nodes.length === 0 && (
              <div className="pointer-events-none absolute left-1/2 top-1/2 w-[min(320px,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-200 bg-white dark:border-white/10 dark:bg-[#171a19]">
                  <GitFork className="h-5 w-5 text-emerald-600" />
                </div>
                <h2 className="font-semibold">Start building your roadmap</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                  Add a topic, project, or resource from the toolbar, then
                  connect nodes to show the learning path.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ---------------------------- Inspector ---------------------------- */}
        <aside
          className={`${
            inspectorOpen ? "" : "hidden lg:block"
          } fixed inset-x-0 bottom-0 z-30 max-h-[62vh] overflow-y-auto overscroll-contain rounded-t-3xl border-t border-zinc-200 bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_-12px_rgba(0,0,0,0.25)] dark:border-white/10 dark:bg-[#101312] lg:static lg:z-auto lg:max-h-none lg:w-82.5 lg:shrink-0 lg:rounded-none lg:border-l lg:border-t-0 lg:pb-5 lg:shadow-none`}
        >
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-zinc-300 dark:bg-white/15 lg:hidden" />

          {selectedNode && selectedMeta ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${selectedMeta.chip} ${selectedMeta.text}`}
                  >
                    <selectedMeta.icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-600">
                      Node inspector
                    </p>
                    <h2 className="font-semibold leading-5">
                      {selectedMeta.label}
                    </h2>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNodeId(null)}
                  aria-label="Close inspector"
                  className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div>
                <label htmlFor="node-title" className={labelClass}>
                  Title
                </label>
                <input
                  id="node-title"
                  value={selectedNode.title}
                  onChange={(event) =>
                    updateNode(selectedNode._id, { title: event.target.value })
                  }
                  className={fieldClass}
                  placeholder="e.g. Learn TypeScript"
                />
              </div>

              <div>
                <label htmlFor="node-description" className={labelClass}>
                  Description
                </label>
                <textarea
                  id="node-description"
                  value={selectedNode.description}
                  onChange={(event) =>
                    updateNode(selectedNode._id, {
                      description: event.target.value,
                    })
                  }
                  rows={4}
                  className={`${fieldClass} resize-y leading-6`}
                  placeholder="What should someone learn or accomplish?"
                />
              </div>

              <div>
                <span className={labelClass}>Node type</span>
                <div className="grid grid-cols-5 gap-1.5">
                  {NODE_TYPES.map((type) => {
                    const active = selectedNode.type === type.value;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        aria-label={type.label}
                        aria-pressed={active}
                        title={type.label}
                        onClick={() =>
                          updateNode(selectedNode._id, { type: type.value })
                        }
                        className={`flex h-10 items-center justify-center rounded-xl border transition ${
                          active
                            ? `border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 ${type.text}`
                            : "border-zinc-200 text-zinc-500 hover:bg-zinc-100 dark:border-white/10 dark:hover:bg-white/5"
                        }`}
                      >
                        <type.icon className="h-4 w-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 p-3 dark:border-white/10">
                <span className="text-sm">
                  <span className="block font-medium">Optional node</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    This step isn&apos;t required.
                  </span>
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={selectedNode.isOptional}
                  aria-label="Optional node"
                  onClick={() =>
                    updateNode(selectedNode._id, {
                      isOptional: !selectedNode.isOptional,
                    })
                  }
                  className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                    selectedNode.isOptional
                      ? "bg-emerald-600"
                      : "bg-zinc-300 dark:bg-white/15"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                      selectedNode.isOptional ? "left-[1.4rem]" : "left-0.5"
                    }`}
                  />
                </button>
              </div>

              <button
                type="button"
                onClick={() => startConnect(selectedNode._id)}
                className={`${btnGhost} w-full border-emerald-500/40 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10`}
              >
                <Link2 className="h-4 w-4" />
                Connect to another node
              </button>

              {connectedEdges.length > 0 && (
                <div>
                  <span className={labelClass}>
                    Connections ({connectedEdges.length})
                  </span>
                  <ul className="space-y-1">
                    {connectedEdges.map((edge) => {
                      const outgoing = edge.sourceNodeId === selectedNode._id;
                      const other = nodeById(
                        outgoing ? edge.targetNodeId : edge.sourceNodeId
                      );
                      return (
                        <li key={edge._id}>
                          <button
                            onClick={() => {
                              setSelectedNodeId(null);
                              setSelectedEdgeId(edge._id);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition hover:bg-zinc-100 dark:hover:bg-white/5"
                          >
                            <span className="text-emerald-600">
                              {outgoing ? "→" : "←"}
                            </span>
                            <span className="min-w-0 flex-1 truncate">
                              {other?.title || "Untitled node"}
                            </span>
                            <span className="text-zinc-400">
                              {edgeMeta(edge.type).label}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              <details className="group rounded-xl border border-zinc-200 dark:border-white/10">
                <summary className="cursor-pointer list-none px-3 py-2.5 text-xs font-medium text-zinc-600 dark:text-zinc-300">
                  Advanced · Custom data (JSON)
                </summary>
                <div className="px-3 pb-3">
                  <textarea
                    aria-label="Custom data (JSON)"
                    value={jsonText}
                    onChange={(event) => {
                      const text = event.target.value;
                      setJsonText(text);
                      try {
                        const parsed = JSON.parse(text);
                        if (
                          parsed &&
                          typeof parsed === "object" &&
                          !Array.isArray(parsed)
                        ) {
                          updateNode(selectedNode._id, { data: parsed });
                          setJsonError("");
                        } else {
                          setJsonError("Must be a JSON object, e.g. { }");
                        }
                      } catch {
                        setJsonError("Not valid JSON yet.");
                      }
                    }}
                    rows={5}
                    spellCheck={false}
                    className={`${fieldClass} resize-y bg-zinc-50 font-mono text-xs leading-5 dark:bg-[#0d100f] ${
                      jsonError ? "border-red-400 focus:border-red-500 focus:ring-red-500/15" : ""
                    }`}
                  />
                  <p
                    className={`mt-1.5 text-[11px] leading-5 ${
                      jsonError
                        ? "text-red-600 dark:text-red-400"
                        : "text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    {jsonError || "Valid JSON — changes apply when you save."}
                  </p>
                </div>
              </details>

              <div className="space-y-2">
                <button
                  onClick={() => void saveAll()}
                  disabled={saving || !hasUnsaved}
                  className={`${btnPrimary} w-full py-2.5`}
                >
                  {saving ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {hasUnsaved ? "Save changes" : "All changes saved"}
                </button>

                {confirmDelete ? (
                  <div className="rounded-xl border border-red-200 p-3 dark:border-red-500/20">
                    <p className="text-xs leading-5 text-red-700 dark:text-red-300">
                      Delete &ldquo;{selectedNode.title || "Untitled node"}
                      &rdquo; and its connections? This can&apos;t be undone.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className={`${btnGhost} flex-1`}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => void deleteSelectedNode()}
                        disabled={deleting}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:opacity-50"
                      >
                        {deleting ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className={`${btnDanger} w-full`}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete node
                  </button>
                )}
              </div>
            </div>
          ) : selectedEdge ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-600">
                    Connection inspector
                  </p>
                  <h2 className="mt-1 font-semibold">Connection details</h2>
                </div>
                <button
                  onClick={() => setSelectedEdgeId(null)}
                  aria-label="Close inspector"
                  className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="rounded-xl border border-zinc-200 p-3 dark:border-white/10">
                <p className="text-xs text-zinc-500">From</p>
                <p className="mt-1 text-sm font-medium">
                  {nodeById(selectedEdge.sourceNodeId)?.title || "Untitled node"}
                </p>

                <div className="my-3 flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                  <svg width="28" height="8" aria-hidden="true">
                    <line
                      x1="1"
                      y1="4"
                      x2="27"
                      y2="4"
                      stroke={edgeMeta(selectedEdge.type).color}
                      strokeWidth="2"
                      strokeDasharray={edgeMeta(selectedEdge.type).dash}
                      strokeLinecap="round"
                    />
                  </svg>
                  {edgeMeta(selectedEdge.type).label}
                </div>

                <p className="text-xs text-zinc-500">To</p>
                <p className="mt-1 text-sm font-medium">
                  {nodeById(selectedEdge.targetNodeId)?.title || "Untitled node"}
                </p>
              </div>

              <p className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                To change the connection type, delete this connection and
                create it again with the type you want.
              </p>

              <button
                onClick={() => void deleteSelectedEdge()}
                disabled={deleting}
                className={`${btnDanger} w-full`}
              >
                <Trash2 className="h-4 w-4" />
                {deleting ? "Deleting..." : "Delete connection"}
              </button>
            </div>
          ) : (
            <div className="flex min-h-50 flex-col items-center justify-center text-center">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10">
                <Layers className="h-5 w-5 text-emerald-600" />
              </div>
              <h2 className="text-sm font-semibold">Nothing selected</h2>
              <p className="mt-2 max-w-60 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                Select a node to edit it, or a connection to inspect or delete
                it.
              </p>
              <dl className="mt-5 space-y-1.5 text-left text-[11px] text-zinc-500 dark:text-zinc-400">
                {[
                  ["Ctrl/⌘ + S", "Save all"],
                  ["Delete", "Remove selection"],
                  ["Esc", "Cancel / deselect"],
                ].map(([key, action]) => (
                  <div key={key} className="flex items-center gap-3">
                    <dt>
                      <kbd className="rounded-md border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-mono text-[10px] dark:border-white/10 dark:bg-white/5">
                        {key}
                      </kbd>
                    </dt>
                    <dd>{action}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}