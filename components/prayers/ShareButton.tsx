"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  prayerId: string;
  title: string;
}

export default function ShareButton({ title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;

    if (navigator.share) {
      await navigator.share({ title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleShare}
      className="border-navy/20 text-navy hover:bg-navy/5"
    >
      <Share2 className="w-4 h-4 mr-1.5" />
      {copied ? "Link copiado!" : "Compartilhar"}
    </Button>
  );
}
