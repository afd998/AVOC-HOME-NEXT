// Database
export { db, pgPool } from "./db/client";
export * from "./db/schema";
export * from "./db/types";

// Re-export drizzle-orm utilities so consumers don't need to depend on drizzle-orm directly
export {
  eq,
  and,
  or,
  not,
  inArray,
  notInArray,
  sql,
  desc,
  asc,
  lt,
  lte,
  gt,
  gte,
} from "drizzle-orm";
export type { InferSelectModel, InferInsertModel } from "drizzle-orm";

// QC Generation
export { generateQcItems, generateQcItemsForAction } from "./qc/generate";

// Utilities
export { generateDeterministicId, composeActionIdInput } from "./utils/id";
export { adjustTimeByMinutes } from "./utils/time";

