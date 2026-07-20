// ============================================================================
// CRDT Types — Shared type definitions for RGA operations
// ============================================================================
// These types define the wire format for CRDT operations sent over Socket.IO.
// Both the backend (server-side RGA) and frontend (client-side RGA) use these.
// ============================================================================

/**
 * CharId — Globally unique, totally ordered character identifier.
 *
 * Every character in the document gets a unique ID composed of:
 * - clientId: A UUID assigned per editing session (unique per browser tab)
 * - clock: A Lamport timestamp that increments with every local operation
 *
 * Total ordering: Compare by clock DESC first, then clientId DESC to break ties.
 * This ensures deterministic ordering even when two clients generate operations
 * with the same Lamport timestamp (possible if they haven't seen each other's ops).
 */
export interface CharId {
  clientId: string;
  clock: number;
}

/**
 * Serialize a CharId to a string for use as a Map key.
 * Format: "clientId:clock"
 */
export function charIdToString(id: CharId): string {
  return `${id.clientId}:${id.clock}`;
}

/**
 * Compare two CharIds for total ordering.
 * Returns:
 *  - negative if a < b (a should come AFTER b in the document — lower priority)
 *  - positive if a > b (a should come BEFORE b in the document — higher priority)
 *  - 0 if equal
 *
 * Higher clock = higher priority (inserted later = appears first among siblings).
 * If clocks tie, higher clientId string = higher priority (deterministic tiebreaker).
 */
export function compareCharIds(a: CharId, b: CharId): number {
  if (a.clock !== b.clock) {
    return a.clock - b.clock;
  }
  return a.clientId < b.clientId ? -1 : a.clientId > b.clientId ? 1 : 0;
}

/**
 * Check if two CharIds are equal.
 */
export function charIdsEqual(a: CharId | null, b: CharId | null): boolean {
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;
  return a.clientId === b.clientId && a.clock === b.clock;
}

// ============================================================================
// Operation Types
// ============================================================================

/**
 * InsertOp — Insert a character into the document.
 *
 * The character is placed AFTER the node identified by `afterId`.
 * If `afterId` is null, the character is inserted at the very beginning
 * (after the sentinel head node).
 *
 * When multiple inserts target the same `afterId`, they are ordered by
 * their own `id` using compareCharIds — higher ID = placed first (leftward).
 * This gives "last writer appears first" semantics among concurrent siblings,
 * which produces natural interleaving behavior.
 */
export interface InsertOp {
  type: 'insert';
  id: CharId;
  afterId: CharId | null;
  value: string;
}

/**
 * DeleteOp — Soft-delete (tombstone) a character.
 *
 * The character identified by `targetId` is marked as a tombstone.
 * It remains in the linked list to preserve ordering for future inserts
 * that reference it as their `afterId`, but it is excluded from the
 * visible document text.
 *
 * Deleting an already-tombstoned character is a no-op (idempotent).
 */
export interface DeleteOp {
  type: 'delete';
  targetId: CharId;
}

/**
 * CRDTOperation — Union type for all CRDT operations.
 */
export type CRDTOperation = InsertOp | DeleteOp;

// ============================================================================
// RGA Node (internal linked list node)
// ============================================================================

/**
 * RGANode — A single node in the RGA linked list.
 *
 * The RGA document is represented as a singly-linked list of nodes.
 * Each node holds:
 * - id: Unique identifier for this character
 * - value: The character content (single char or empty for sentinel)
 * - tombstone: Whether this character has been deleted
 * - next: Pointer to the next node in the list
 */
export interface RGANode {
  id: CharId;
  value: string;
  tombstone: boolean;
  next: RGANode | null;
}

// ============================================================================
// Serialization types (for sending full state over the wire)
// ============================================================================

/**
 * Serialized representation of an RGA node (no circular references).
 */
export interface SerializedRGANode {
  id: CharId;
  value: string;
  tombstone: boolean;
}

/**
 * Serialized RGA state — sent to new joiners so they can reconstruct
 * the full document state.
 */
export interface SerializedRGAState {
  nodes: SerializedRGANode[];
}
