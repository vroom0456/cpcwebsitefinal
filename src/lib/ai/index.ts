import type {
  FaceSearchService,
  FaceGroupingService,
  AutoTaggingService,
  DuplicateDetectionService,
  BlurDetectionService,
  SmileDetectionService,
  SmartAlbumService,
  CaptionGenerationService,
  SemanticSearchService,
  HighlightGenerationService,
  AIRecommendationService,
} from "./types";

/**
 * Central registry of AI services. Every entry is `null` until the
 * corresponding feature is implemented. UI code should check for
 * presence (e.g. `if (aiServices.faceSearch) { ... }`) and hide the
 * relevant controls when a service isn't wired up yet — this keeps the
 * app fully functional with zero AI features enabled.
 */
export const aiServices: {
  faceSearch: FaceSearchService | null;
  faceGrouping: FaceGroupingService | null;
  autoTagging: AutoTaggingService | null;
  duplicateDetection: DuplicateDetectionService | null;
  blurDetection: BlurDetectionService | null;
  smileDetection: SmileDetectionService | null;
  smartAlbum: SmartAlbumService | null;
  captionGeneration: CaptionGenerationService | null;
  semanticSearch: SemanticSearchService | null;
  highlightGeneration: HighlightGenerationService | null;
  recommendations: AIRecommendationService | null;
} = {
  faceSearch: null,
  faceGrouping: null,
  autoTagging: null,
  duplicateDetection: null,
  blurDetection: null,
  smileDetection: null,
  smartAlbum: null,
  captionGeneration: null,
  semanticSearch: null,
  highlightGeneration: null,
  recommendations: null,
};
