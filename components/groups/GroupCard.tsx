"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requestJoinGroup } from "@/app/actions/groups";

interface Group {
  id: string;
  name: string;
  image: string | null;
  description: string | null;
  leader: { name: string | null; image: string | null };
  _count: { members: number };
}

interface Member {
  id: string;
  user: { id: string; name: string | null; image: string | null };
}

type MemberStatus = "ACTIVE" | "PENDING" | "REJECTED" | undefined;

interface Props {
  group: Group;
  memberStatus: MemberStatus;
  userId: string | null;
}

export default function GroupCard({ group, memberStatus, userId }: Props) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [photoExpanded, setPhotoExpanded] = useState(false);
  const [members, setMembers] = useState<Member[] | null>(null);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(memberStatus === "PENDING");

  const isMember = memberStatus === "ACTIVE";

  async function openModal() {
    setModalOpen(true);
    if (members === null) {
      setLoadingMembers(true);
      const res = await fetch(`/api/groups/${group.id}`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members ?? []);
      }
      setLoadingMembers(false);
    }
  }

  function handleCardClick() {
    if (isMember) {
      router.push(`/grupos/${group.id}`);
    } else {
      openModal();
    }
  }

  async function handleJoin() {
    if (!userId) {
      router.push("/login");
      return;
    }
    setJoining(true);
    await requestJoinGroup(group.id);
    setJoining(false);
    setJoined(true);
  }

  return (
    <>
      {/* Card */}
      <div
        onClick={handleCardClick}
        className={`bg-card rounded-xl border shadow-sm transition-all duration-200 cursor-pointer select-none hover:shadow-md hover:-translate-y-0.5
          ${isMember ? "border-gold-warm/40" : "border-gray-med/40"}`}
      >
        <div className="p-5 flex items-center gap-3">
          {group.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={group.image}
              alt={group.name}
              className="w-12 h-12 rounded-full object-cover border border-gray-med flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gold-warm/20 flex items-center justify-center text-gold-warm text-xl font-bold flex-shrink-0">
              {group.name.charAt(0)}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-navy truncate">{group.name}</h2>
            <p className="text-xs text-gray-text">
              {group.leader.name} · {group._count.members} membro(s)
            </p>
            {group.description && (
              <p className="text-xs text-gray-text mt-0.5 line-clamp-1">
                {group.description}
              </p>
            )}
          </div>

          <div className="flex-shrink-0">
            {isMember ? (
              <span className="text-xs text-green-600 font-medium bg-green-50 dark:bg-green-950/30 dark:text-green-400 px-2 py-1 rounded-full">
                Membro
              </span>
            ) : joined ? (
              <span className="text-xs text-gold-warm font-medium bg-gold-light px-2 py-1 rounded-full">
                Solicitado
              </span>
            ) : (
              <Users className="w-4 h-4 text-gray-text" />
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setModalOpen(false)}
            />

            {/* Panel */}
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div
                className="bg-card rounded-2xl shadow-2xl border border-gray-med/40 w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal header */}
                <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-med/40">
                  <h2 className="font-display font-bold text-navy text-lg">
                    {group.name}
                  </h2>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="p-1.5 rounded-full hover:bg-gray-light dark:hover:bg-navy/40 text-gray-text transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Scrollable body */}
                <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-5">
                  {/* Image */}
                  {group.image && (
                    <div className="flex justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={group.image}
                        alt={group.name}
                        onClick={() => setPhotoExpanded(true)}
                        className="w-40 h-40 rounded-full object-cover border-4 border-gold-warm/30 shadow-md cursor-zoom-in hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  )}

                  {/* Info */}
                  <div className="text-center -mt-1">
                    <p className="text-xs text-gray-text">
                      Líder:{" "}
                      <span className="font-medium text-navy">
                        {group.leader.name}
                      </span>
                    </p>
                    <p className="text-xs text-gray-text">
                      {group._count.members} membro(s)
                    </p>
                  </div>

                  {/* Description */}
                  {group.description && (
                    <div className="bg-blue-soft/30 dark:bg-navy/20 rounded-xl p-4">
                      <p className="text-sm text-gray-text leading-relaxed">
                        {group.description}
                      </p>
                    </div>
                  )}

                  {/* Members list */}
                  <div>
                    <h3 className="text-sm font-semibold text-navy mb-3">
                      Membros
                    </h3>
                    {loadingMembers ? (
                      <div className="flex flex-col gap-2">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 animate-pulse"
                          >
                            <div className="w-8 h-8 rounded-full bg-gray-med/40 flex-shrink-0" />
                            <div className="h-3 w-28 bg-gray-med/40 rounded" />
                          </div>
                        ))}
                      </div>
                    ) : members && members.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {members.map((m) => (
                          <div key={m.id} className="flex items-center gap-3">
                            {m.user.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={m.user.image}
                                alt={m.user.name ?? ""}
                                className="w-8 h-8 rounded-full object-cover border border-gray-med flex-shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gold-warm/20 flex items-center justify-center text-gold-warm text-xs font-bold flex-shrink-0">
                                {m.user.name?.charAt(0) ?? "?"}
                              </div>
                            )}
                            <span className="text-sm text-navy">
                              {m.user.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-text italic">
                        Nenhum membro ainda.
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t border-gray-med/40 flex items-center justify-end gap-3">
                  {joined ? (
                    <span className="text-sm text-gold-warm font-medium">
                      Solicitação enviada ✓
                    </span>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={joining}
                      onClick={handleJoin}
                    >
                      {joining ? "Enviando..." : "Pedir pra participar"}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Photo lightbox */}
      <AnimatePresence>
        {photoExpanded && group.image && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm cursor-zoom-out"
            onClick={() => setPhotoExpanded(false)}
          >
            <motion.img
              src={group.image}
              alt={group.name}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-[90vw] max-h-[90vh] rounded-2xl shadow-2xl object-contain"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...({} as any)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
