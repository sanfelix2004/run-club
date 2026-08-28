"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Film, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function UploadVideoPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetch("/api/hero-video/upload")
      .then((r) => r.json())
      .then((data) => setUploaded(data.uploaded))
      .catch(() => {});
  }, []);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setProgress(10);

    const formData = new FormData();
    formData.append("video", file);

    try {
      setProgress(40);
      const res = await fetch("/api/hero-video/upload", {
        method: "POST",
        body: formData,
      });
      setProgress(90);

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Caricamento fallito");
        return;
      }

      setUploaded(true);
      setProgress(100);
      toast.success("Video caricato! Vai alla home per vederlo.");
    } catch {
      toast.error("Errore di rete. Riprova.");
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFDFB] p-4">
      <div className="w-full max-w-md rounded-2xl border border-emerald-100 bg-white p-8 shadow-lg">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
          <Film className="h-7 w-7 text-emerald-600" />
        </div>

        <h1 className="text-2xl font-bold text-forest">Carica il video hero</h1>
        <p className="mt-2 text-sm leading-relaxed text-forest/60">
          Non riesci a trascinare il file? Usa il pulsante qui sotto per
          selezionarlo dal tuo computer.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/*"
          className="hidden"
          onChange={onFileChange}
        />

        {uploaded ? (
          <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
            <p className="mt-3 font-semibold text-forest">Video già caricato!</p>
            <p className="mt-1 text-sm text-forest/60">
              Lo sfondo è attivo sulla home page.
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-emerald-500 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
            >
              Vai alla home
            </Link>
          </div>
        ) : (
          <div className="mt-8">
            <Button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="w-full rounded-full bg-emerald-500 py-6 text-base text-white hover:bg-emerald-600"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Caricamento... {progress}%
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  Seleziona video dal computer
                </>
              )}
            </Button>
            <p className="mt-4 text-center text-xs text-forest/40">
              File: kling_20260828_VIDEO_Cinematic__4944_0.mp4
              <br />
              Max 100 MB
            </p>
          </div>
        )}

        <Link
          href="/"
          className="mt-6 block text-center text-sm text-emerald-600 hover:underline"
        >
          ← Torna alla home
        </Link>
      </div>
    </div>
  );
}
