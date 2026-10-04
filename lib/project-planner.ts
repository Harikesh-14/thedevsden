import {
  Server,
  BrainCircuit,
  Smartphone,
  Container,
  Globe2,
  Database,
  Code2,
  Monitor,
  Terminal,
  FlaskConical,
  LayoutGrid,
} from "lucide-react"

export type SkillCategory =
  | "frontend"
  | "backend"
  | "database"
  | "mobile"
  | "desktop"
  | "cli"
  | "aiMl"
  | "devOps"
  | "testing"
  | "other"

export interface ProjectPlan {
  _id: string
  title: string
  shortDescription: string
  isActive: boolean
  content: string
  skills: Partial<Record<SkillCategory, string[]>>
  updatedAt: string
}

export const STACK = {
  frontend: {
    label: "Frontend",
    icon: Globe2,
    color: {
      dot: "bg-blue-400",
      sel: "border-blue-400/30 bg-blue-400/10 text-blue-300/85",
    },
    options: [
      "Next.js",
      "React",
      "Vue",
      "Nuxt",
      "Svelte",
      "Astro",
      "Remix",
      "Tailwind CSS",
      "shadcn/ui",
      "TypeScript",
      "JavaScript",
    ],
  },
  backend: {
    label: "Backend",
    icon: Server,
    color: {
      dot: "bg-emerald-400",
      sel: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300/85",
    },
    options: [
      "Node.js",
      "NestJS",
      "Express.js",
      "Fastify",
      "Hono",
      "Django",
      "FastAPI",
      "Spring Boot",
      "Go",
      "Rust",
      "Ruby on Rails",
    ],
  },
  database: {
    label: "Database",
    icon: Database,
    color: {
      dot: "bg-amber-400",
      sel: "border-amber-400/30 bg-amber-400/10 text-amber-300/85",
    },
    options: [
      "MongoDB",
      "PostgreSQL",
      "MySQL",
      "SQLite",
      "Redis",
      "Supabase",
      "Prisma",
      "Drizzle ORM",
      "Mongoose",
      "Firebase",
    ],
  },
  aiMl: {
    label: "AI / ML",
    icon: BrainCircuit,
    color: {
      dot: "bg-purple-400",
      sel: "border-purple-400/30 bg-purple-400/10 text-purple-300/85",
    },
    options: [
      "LLMs",
      "NLP",
      "TensorFlow",
      "PyTorch",
      "LangChain",
      "OpenAI SDK",
      "Anthropic SDK",
      "Hugging Face",
      "Ollama",
      "ONNX",
    ],
  },
  mobile: {
    label: "Mobile",
    icon: Smartphone,
    color: {
      dot: "bg-pink-400",
      sel: "border-pink-400/30 bg-pink-400/10 text-pink-300/85",
    },
    options: [
      "Swift",
      "SwiftUI",
      "React Native",
      "Expo",
      "Flutter",
      "Kotlin",
      "Jetpack Compose",
    ],
  },
  desktop: {
    label: "Desktop",
    icon: Code2,
    color: {
      dot: "bg-orange-400",
      sel: "border-orange-400/30 bg-orange-400/10 text-orange-300/85",
    },
    options: ["Electron", "Tauri", "SwiftUI (macOS)", "WPF", "Qt"],
  },
  cli: {
    label: "CLI",
    icon: Code2,
    color: {
      dot: "bg-neutral-400",
      sel: "border-neutral-400/30 bg-neutral-400/10 text-neutral-300/85",
    },
    options: [
      "Commander.js",
      "Inquirer.js",
      "Cobra (Go)",
      "Clap (Rust)",
      "Click (Python)",
      "Bash",
    ],
  },
  devOps: {
    label: "DevOps",
    icon: Container,
    color: {
      dot: "bg-cyan-400",
      sel: "border-cyan-400/30 bg-cyan-400/10 text-cyan-300/85",
    },
    options: [
      "Docker",
      "GitHub Actions",
      "Vercel",
      "Railway",
      "Nginx",
      "Kubernetes",
      "Terraform",
      "AWS",
      "GCP",
    ],
  },
  testing: {
    label: "Testing",
    icon: Code2,
    color: {
      dot: "bg-rose-400",
      sel: "border-rose-400/30 bg-rose-400/10 text-rose-300/85",
    },
    options: [
      "Jest",
      "Vitest",
      "Playwright",
      "Cypress",
      "Selenium",
      "Testing Library",
      "Supertest",
    ],
  },
  other: {
    label: "Other",
    icon: Code2,
    color: {
      dot: "bg-neutral-500",
      sel: "border-neutral-500/30 bg-neutral-500/10 text-neutral-300/85",
    },
    options: [
      "WebSockets",
      "Socket.IO",
      "GraphQL",
      "tRPC",
      "gRPC",
      "Kafka",
      "Redis Pub/Sub",
    ],
  },
} as const

export type Category = keyof typeof STACK

export const categoryMeta: Record<
  SkillCategory,
  {
    label: string
    icon: React.ElementType
    chip: string
  }
> = {
  frontend: {
    label: "Frontend",
    icon: Globe2,
    chip: "border-blue-400/20  bg-blue-400/[0.07]  text-blue-300/70",
  },
  backend: {
    label: "Backend",
    icon: Server,
    chip: "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300/70",
  },
  database: {
    label: "Database",
    icon: Database,
    chip: "border-amber-400/20 bg-amber-400/[0.07] text-amber-300/70",
  },
  mobile: {
    label: "Mobile",
    icon: Smartphone,
    chip: "border-pink-400/20  bg-pink-400/[0.07]  text-pink-300/70",
  },
  desktop: {
    label: "Desktop",
    icon: Monitor,
    chip: "border-orange-400/20 bg-orange-400/[0.07] text-orange-300/70",
  },
  cli: {
    label: "CLI",
    icon: Terminal,
    chip: "border-white/10     bg-white/5     text-white/40",
  },
  aiMl: {
    label: "AI / ML",
    icon: BrainCircuit,
    chip: "border-purple-400/20 bg-purple-400/[0.07] text-purple-300/70",
  },
  devOps: {
    label: "DevOps",
    icon: Container,
    chip: "border-cyan-400/20  bg-cyan-400/[0.07]  text-cyan-300/70",
  },
  testing: {
    label: "Testing",
    icon: FlaskConical,
    chip: "border-rose-400/20  bg-rose-400/[0.07]  text-rose-300/70",
  },
  other: {
    label: "Other",
    icon: LayoutGrid,
    chip: "border-white/10     bg-white/5     text-white/40",
  },
}

// Card accent colours per "dominant" skill category
export const accentByDominant: Record<SkillCategory, string> = {
  frontend: "from-blue-500   via-blue-600",
  backend: "from-emerald-500 via-emerald-600",
  database: "from-amber-500  via-amber-600",
  mobile: "from-pink-500   via-pink-600",
  desktop: "from-orange-500 via-orange-600",
  cli: "from-neutral-400 via-neutral-500",
  aiMl: "from-purple-500 via-purple-600",
  devOps: "from-cyan-500   via-cyan-600",
  testing: "from-rose-500   via-rose-600",
  other: "from-neutral-500 via-neutral-600",
}
