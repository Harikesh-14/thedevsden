"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import {
  Mail,
  MailOpen,
  CheckCircle2,
  Trash2,
  LoaderCircle,
  Search,
  MessageSquare,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface IContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  replied: boolean;
  createdAt: string;
}

export default function AdminPortalContactMe() {
  const [messages, setMessages] = useState<IContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "replied">("all");

  useEffect(() => {
    void fetchMessages();
  }, []);

  async function fetchMessages() {
    try {
      const response = await apiFetch("/contact-me", { method: "GET" });
      if (!response.ok) throw new Error("Failed to fetch messages.");
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(id: string, field: "isRead" | "replied", currentVal: boolean) {
    try {
      const endpoint = field === "isRead" ? `/contact-me/${id}/read` : `/contact-me/${id}/replied`;
      const bodyPayload = field === "isRead" ? { isRead: !currentVal } : { replied: !currentVal };

      const response = await apiFetch(endpoint, {
        method: "PATCH",
        body: JSON.stringify(bodyPayload),
      });

      if (!response.ok) throw new Error("Failed to update status.");

      setMessages((prev) =>
        prev.map((msg) => (msg._id === id ? { ...msg, [field]: !currentVal } : msg))
      );
      toast.success("Status updated.");
    } catch (error) {
      toast.error("Could not update status.");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      const response = await apiFetch(`/contact-me/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete message.");

      setMessages((prev) => prev.filter((msg) => msg._id !== id));
      toast.success("Message deleted.");
    } catch (error) {
      toast.error("Could not delete message.");
    }
  }

  const filteredMessages = messages.filter((msg) => {
    const matchesSearch =
      msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === "unread") return matchesSearch && !msg.isRead;
    if (filter === "replied") return matchesSearch && msg.replied;
    return matchesSearch;
  });

  return (
    <main className="min-h-screen bg-white px-3 py-5 text-neutral-900 sm:px-5 dark:bg-[#090909] dark:text-[#ededed]">
      <div className="mx-auto max-w-5xl">
        <header className="mb-5">
          <div className="mb-2 flex flex-wrap items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            <span>Admin Portal</span>
            <span className="text-neutral-400 dark:text-neutral-700">/</span>
            <span className="text-emerald-500">Contact Inquiries</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Messages
          </h1>
          <p className="mt-1 text-xs text-neutral-500">
            Manage inquiries submitted from your portfolio contact form.
          </p>
        </header>

        <section className="mb-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative min-w-0 flex-1 sm:max-w-xs">
            <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            <Input
              type="text"
              placeholder="Search sender, email, subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 border border-neutral-200 bg-neutral-50 pl-8 text-xs text-neutral-900 placeholder:text-neutral-400 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20 dark:border-white/10 dark:bg-[#111111] dark:text-neutral-100 dark:placeholder:text-neutral-600"
            />
          </div>
          <div className="flex gap-1.5 text-xs">
            {(["all", "unread", "replied"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`rounded-lg px-3 py-1.5 font-medium capitalize transition-colors ${filter === tab
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                    : "border border-neutral-200 bg-neutral-50 text-neutral-600 hover:text-neutral-900 dark:border-white/8 dark:bg-[#111111] dark:text-neutral-400 dark:hover:text-neutral-200"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </section>

        {loading ? (
          <div className="flex min-h-36 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 dark:border-white/8 dark:bg-[#111111]">
            <LoaderCircle size={20} className="animate-spin text-emerald-400" />
          </div>
        ) : filteredMessages.length > 0 ? (
          <div className="space-y-2.5">
            {filteredMessages.map((msg) => (
              <article
                key={msg._id}
                className={`rounded-xl border p-3.5 transition-colors ${!msg.isRead
                    ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/2"
                    : "border-neutral-200 bg-neutral-50 dark:border-white/8 dark:bg-[#111111]"
                  }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xs font-bold text-neutral-900 dark:text-neutral-200">{msg.name}</h2>
                      <span className="text-[11px] text-neutral-500">({msg.email})</span>
                      {!msg.isRead && (
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                          New
                        </span>
                      )}
                      {msg.replied && (
                        <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[9px] font-semibold text-blue-600 dark:text-blue-400">
                          Replied
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs font-medium text-neutral-800 dark:text-neutral-300">
                      Subject: <span className="text-neutral-600 dark:text-neutral-400">{msg.subject}</span>
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-neutral-700 bg-white p-2.5 rounded-lg border border-neutral-200 dark:text-neutral-400 dark:bg-[#161616] dark:border-white/4">
                      {msg.message}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-neutral-500">
                      {msg.createdAt ? format(parseISO(msg.createdAt), "dd MMM yyyy") : ""}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-neutral-200 pt-2.5 text-xs dark:border-white/6">
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void toggleStatus(msg._id, "isRead", msg.isRead)}
                      className="h-7 gap-1 border-neutral-200 bg-transparent px-2.5 text-[11px] text-neutral-700 hover:bg-neutral-100 dark:border-white/10 dark:text-neutral-300 dark:hover:bg-white/5"
                    >
                      {msg.isRead ? <MailOpen size={13} /> : <Mail size={13} />}
                      {msg.isRead ? "Mark Unread" : "Mark Read"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void toggleStatus(msg._id, "replied", msg.replied)}
                      className={`h-7 gap-1 px-2.5 text-[11px] ${msg.replied
                          ? "bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400"
                          : "border-neutral-200 bg-transparent text-neutral-700 hover:bg-neutral-100 dark:border-white/10 dark:text-neutral-300 dark:hover:bg-white/5"
                        }`}
                    >
                      <CheckCircle2 size={13} />
                      {msg.replied ? "Replied" : "Mark Replied"}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void handleDelete(msg._id)}
                    className="h-7 gap-1 border-red-500/20 bg-transparent px-2.5 text-[11px] text-red-500 hover:bg-red-500/10 dark:text-red-400"
                  >
                    <Trash2 size={13} />
                    Delete
                  </Button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 text-center dark:border-white/8 dark:bg-[#0d0d0d]">
            <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white dark:border-white/8 dark:bg-[#151515]">
              <MessageSquare size={16} className="text-neutral-500" />
            </div>
            <h3 className="text-xs font-semibold text-neutral-800 dark:text-neutral-300">No messages found</h3>
            <p className="mt-1 text-[11px] text-neutral-500">
              There are no contact inquiries matching your filter.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}