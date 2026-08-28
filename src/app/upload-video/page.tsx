"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Film, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function UploadVideoPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [selectedName, setSelectedName] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/hero-video/upload")
      .then((r) => r.json())
      .then((data) => setUploaded(data.uploaded))
      .catch(() => {});
  }, []);

  const handleUpload = useCallback(async (file: File) => {
    setSelectedName(file.name);
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
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleUpload(file);
      } else {
        toast.error("Nessun file rilevato. Trascina il file .mp4 direttamente.");
      }
    },
    [handleUpload],
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFDFB] p-4">
      <div className="w-full max-w-lg rounded-2xl border border-emerald-100 bg-white p-8 shadow-lg">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
          <Film className="h-7 w-7 text-emerald-600" />
        </div>

        <h1 className="text-2xl font-bold text-forest">Carica il video hero</h1>
        <p className="mt-2 text-sm leading-relaxed text-forest/60">
          Il video è nei tuoi Download sul Mac? Trascinalo qui sotto oppure
          usa il pulsante per selezionarlo.
        </p>

        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Importante:</strong> apri questa pagina dal{" "}
          <strong>Preview di Cursor</strong> sul tuo Mac (non dal desktop
          remoto). Così il Finder può accedere ai tuoi Download.
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".mp4,video/*,*/*"
          className="sr-only"
          onChange={onFileChange}
        />

        {uploaded ? (
          <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
            <p className="mt-3 font-semibold text-forest">Video caricato!</p>
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
          <div className="mt-8 space-y-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
                dragOver
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-emerald-200 bg-emerald-50/30 hover:border-emerald-400 hover:bg-emerald-50/60"
              }`}
            >
              <Upload className="mx-auto h-10 w-10 text-emerald-500" />
              <p className="mt-4 font-semibold text-forest">
                Trascina il video qui
              </p>
              <p className="mt-2 text-sm text-forest/50">
                oppure clicca per aprire il Finder
              </p>
              <p className="mt-3 text-xs text-forest/40">
                kling_20260828_VIDEO_Cinematic__4944_0.mp4
              </p>
            </div>

            <Button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="w-full rounded-full bg-emerald-500 py-5 text-base text-white hover:bg-emerald-600"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Caricamento{selectedName ? ` ${selectedName}` : ""}... {progress}%
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  Seleziona dal Finder
                </>
              )}
            </Button>

            <label className="block">
              <span className="mb-2 block text-xs font-medium text-forest/50">
                Oppure usa il selettore file diretto:
              </span>
              <input
                type="file"
                accept=".mp4,video/*,*/*"
                disabled={uploading}
                onChange={onFileChange}
                className="block w-full text-sm text-forest file:mr-4 file:rounded-full file:border-0 file:bg-emerald-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-emerald-700 hover:file:bg-emerald-200"
              />
            </label>
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
