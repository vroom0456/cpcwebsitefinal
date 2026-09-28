-- Migration 0011: AI Faces and Photo Face Relationships

CREATE TABLE IF NOT EXISTS public.faces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  cover_face_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.photo_faces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
  face_id UUID NOT NULL REFERENCES public.faces(id) ON DELETE CASCADE,
  embedding JSONB,
  bounding_box JSONB,
  confidence DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_photo_face UNIQUE(photo_id, face_id)
);

CREATE INDEX IF NOT EXISTS idx_photo_faces_photo_id ON public.photo_faces(photo_id);
CREATE INDEX IF NOT EXISTS idx_photo_faces_face_id ON public.photo_faces(face_id);

-- RLS policies
ALTER TABLE public.faces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_faces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Faces are publicly viewable" ON public.faces
  FOR SELECT USING (is_hidden = false);

CREATE POLICY "Photo faces are publicly viewable" ON public.photo_faces
  FOR SELECT USING (true);
