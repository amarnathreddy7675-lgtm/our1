"use client";
import { useBlobUrl } from "@/lib/store";

export default function BlobVideo({ blob, className }: { blob: Blob | string; className?: string }) {
  const url = useBlobUrl(blob);
  return url ? <video src={url} controls playsInline autoPlay loop className={className} /> : null;
}
