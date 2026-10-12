"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  LoaderCircle,
  Pencil,
  ShieldCheck,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface IUser {
  _id: string;
  firstName: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  createdAt: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await apiFetch("/auth/me", { method: "GET" });
        if (!response.ok) {
          throw new Error("Failed to fetch profile information.");
        }
        const data: IUser = await response.json();
        setUser(data);
      } catch (error) {
        toast.error("Oops", {
          description: error instanceof Error ? error.message : "Something went wrong.",
          closeButton: true
        });
      } finally {
        setLoading(false);
      }
    }

    void fetchProfile();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#090909] text-[#ededed]">
        <LoaderCircle size={24} className="animate-spin text-emerald-400" />
      </main>
    );
  }

  const fullName = user
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : "User";

  const initials = user
    ? `${user.firstName[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : "U";

  return (
    <main className="min-h-screen bg-[#090909] px-3 py-5 text-[#ededed] sm:px-5">
      <div className="mx-auto max-w-5xl">
        <header className="mb-5">
          <div className="mb-2 flex flex-wrap items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            <span>Admin Portal</span>
            <span className="text-neutral-700">/</span>
            <span className="text-emerald-500">Profile</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Account Profile
          </h1>
          <p className="mt-1 text-xs text-neutral-500">
            View your personal information and account credentials.
          </p>
        </header>

        {user ? (
          <div className="space-y-4">
            {/* Profile Hero Card */}
            <section className="relative overflow-hidden rounded-xl border border-white/8 bg-[#111111] p-4 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/8 text-lg font-bold tracking-wider text-emerald-400">
                    {initials}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-neutral-100 sm:text-base">
                      {fullName}
                    </h2>
                    <p className="text-xs text-neutral-400">{user.email}</p>
                    <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-medium text-emerald-500">
                      <ShieldCheck size={13} />
                      <span>Verified Account</span>
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  disabled
                  title="Coming soon with PATCH/PUT route"
                  className="h-9 gap-1.5 border border-white/1 bg-transparent px-3 text-xs font-semibold text-neutral-400 opacity-50 cursor-not-allowed"
                >
                  <Pencil size={13} />
                  Edit Profile
                </Button>
              </div>
            </section>

            {/* Details Grid */}
            <section className="rounded-xl border border-white/8 bg-[#111111] p-4 sm:p-5">
              <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                Personal Information
              </h3>
              <div className="divide-y divide-white/6 text-xs">
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <UserIcon size={15} className="text-neutral-500" />
                    <span>Full Name</span>
                  </div>
                  <span className="font-medium text-neutral-200">{fullName}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <Mail size={15} className="text-neutral-500" />
                    <span>Email Address</span>
                  </div>
                  <span className="font-medium text-neutral-200">{user.email}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <Phone size={15} className="text-neutral-500" />
                    <span>Phone Number</span>
                  </div>
                  <span className="font-medium text-neutral-200">
                    {user.phoneNumber || "Not provided"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <Calendar size={15} className="text-neutral-500" />
                    <span>Member Since</span>
                  </div>
                  <span className="font-medium text-neutral-200">
                    {new Date(user.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-white/8 bg-[#0d0d0d] px-4 text-center">
            <h3 className="text-xs font-semibold text-neutral-300">
              Profile not found
            </h3>
            <p className="mt-1 text-[11px] text-neutral-500">
              Unable to load your account information.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}