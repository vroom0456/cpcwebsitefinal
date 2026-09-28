"use client";

import { useState, useEffect, useRef } from "react";
import * as faceapi from "@vladmandic/face-api";
import { createClient } from "@/lib/supabase/client";
import { BrainCircuit, Play, Square, CheckCircle2, AlertCircle } from "lucide-react";

export function AdminFaceIndexer() {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [statusText, setStatusText] = useState("Loading AI models...");
  const stopRef = useRef(false);

  useEffect(() => {
    async function loadModels() {
      try {
        // Load lightweight SSD MobileNet v1 for face detection
        // Using unpkg CDN for the pre-trained weights
        const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/";
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setIsModelLoaded(true);
        setStatusText("AI Models Ready. Ready to index gallery.");
      } catch (err) {
        console.error("Failed to load face-api models:", err);
        setStatusText("Failed to load AI models. Check console.");
      }
    }
    loadModels();
  }, []);

  const startIndexing = async () => {
    if (!isModelLoaded) return;
    setIsProcessing(true);
    stopRef.current = false;
    const supabase = createClient();

    try {
      setStatusText("Fetching gallery photos...");
      // Fetch photos that haven't been processed
      const { data: photos, error } = await supabase
        .from("photos")
        .select("id, drive_file_id")
        .order("created_at", { ascending: false });

      if (error || !photos) throw new Error(error?.message || "Failed to fetch photos");

      setProgress({ current: 0, total: photos.length });

      for (let i = 0; i < photos.length; i++) {
        if (stopRef.current) {
          setStatusText("Indexing stopped by user.");
          break;
        }

        const photo = photos[i];
        if (!photo) continue;
        setStatusText(`Processing photo ${i + 1} of ${photos.length}...`);

        try {
          // 1. Load image via our CORS-friendly proxy
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = `/api/drive/photo/${photo.drive_file_id}`;
          
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });

          // 2. Detect faces
          const detections = await faceapi
            .detectAllFaces(img)
            .withFaceLandmarks()
            .withFaceDescriptors();

          // 3. Save to database using Supabase RPC or direct insert
          for (const detection of detections) {
            // Check if this photo/face combo already exists
            const descriptorArray = Array.from(detection.descriptor);
            
            const { data: matches, error: matchError } = await supabase.rpc("match_face", {
              query_embedding: descriptorArray,
              match_threshold: 0.5, // High threshold for same person
              match_count: 1
            });

            let faceId;

            if (matchError || !matches || matches.length === 0) {
              // Create a new unknown face
              const { data: newFace, error: insertError } = await supabase
                .from("faces")
                .insert({ is_hidden: false })
                .select("id")
                .single();
              
              if (newFace) faceId = newFace.id;
            } else {
              faceId = matches[0].face_id;
            }

            if (faceId) {
              // Link photo to face
              const box = detection.detection.box;
              await supabase.from("photo_faces").upsert({
                photo_id: photo.id,
                face_id: faceId,
                embedding: descriptorArray,
                bounding_box: { x: box.x, y: box.y, width: box.width, height: box.height },
                confidence: detection.detection.score
              }, { onConflict: "photo_id, face_id" });
            }
          }

          setProgress(p => ({ ...p, current: i + 1 }));
        } catch (photoErr) {
          console.error(`Failed to process photo ${photo.id}:`, photoErr);
        }
      }

      if (!stopRef.current) setStatusText("Indexing complete!");
    } catch (err: any) {
      console.error(err);
      setStatusText(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-[#10081C] border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-[#9D5EE5]/20 flex items-center justify-center text-[#9D5EE5]">
          <BrainCircuit size={24} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">AI Face Indexer</h2>
          <p className="text-sm text-white/50">Run client-side AI to detect and cluster faces across your entire gallery.</p>
        </div>
      </div>

      <div className="bg-black/40 rounded-xl p-4 mb-6 font-mono text-xs text-[#C084FC]">
        {statusText}
      </div>

      {isProcessing && (
        <div className="mb-6">
          <div className="flex justify-between text-xs text-white/60 mb-2">
            <span>{progress.current} / {progress.total} Photos</span>
            <span>{Math.round((progress.current / (progress.total || 1)) * 100)}%</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#9D5EE5] transition-all duration-300"
              style={{ width: `${(progress.current / (progress.total || 1)) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex gap-4">
        {!isProcessing ? (
          <button
            onClick={startIndexing}
            disabled={!isModelLoaded}
            className="flex items-center gap-2 px-6 py-3 bg-[#9D5EE5] text-white rounded-full text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#8A4CD1] transition-colors"
          >
            <Play size={16} />
            Start Indexing
          </button>
        ) : (
          <button
            onClick={() => { stopRef.current = true; }}
            className="flex items-center gap-2 px-6 py-3 bg-red-500/20 text-red-500 rounded-full text-sm font-bold hover:bg-red-500/30 transition-colors"
          >
            <Square size={16} />
            Stop Indexing
          </button>
        )}
      </div>
    </div>
  );
}
