/**
 * AI-Ready Architecture
 * ---------------------
 * These interfaces define contracts for future AI features. Nothing here
 * is implemented yet — the goal is that when face search, auto-tagging,
 * etc. are built, they slot in behind these interfaces without any
 * changes to gallery/admin UI code, which will depend only on the
 * interface, not the implementation.
 *
 * To implement a feature later: create e.g. `face-search.service.ts`
 * implementing `FaceSearchService`, and wire it up in `ai/index.ts`.
 */

export interface FaceSearchService {
  findPhotosContainingFace(referenceImage: Blob, eventId?: string): Promise<string[] /* photo ids */>;
}

export interface FaceGroupingService {
  groupFacesInEvent(eventId: string): Promise<{ groupId: string; photoIds: string[] }[]>;
}

export interface AutoTaggingService {
  suggestTags(photoId: string): Promise<string[]>;
}

export interface DuplicateDetectionService {
  findDuplicates(eventId: string): Promise<{ photoIds: string[]; similarity: number }[]>;
}

export interface BlurDetectionService {
  isBlurry(photoId: string): Promise<boolean>;
}

export interface SmileDetectionService {
  hasSmile(photoId: string): Promise<boolean>;
}

export interface SmartAlbumService {
  generateAlbum(eventId: string, theme: string): Promise<string[] /* photo ids */>;
}

export interface CaptionGenerationService {
  generateCaption(photoId: string): Promise<string>;
}

export interface SemanticSearchService {
  search(query: string, filters?: Record<string, unknown>): Promise<string[] /* event or photo ids */>;
}

export interface HighlightGenerationService {
  generateHighlights(eventId: string, count: number): Promise<string[] /* photo ids */>;
}

export interface AIRecommendationService {
  recommendEvents(memberOrSessionId: string): Promise<string[] /* event ids */>;
}
