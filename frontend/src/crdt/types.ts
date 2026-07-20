// ============================================================================
// CRDT Types — Frontend Copy
// ============================================================================
// Mirror of backend/src/crdt/types.ts
// These types define the wire format for CRDT operations sent over Socket.IO.
// ============================================================================

export interface CharId {
  clientId: string;
  clock: number;
}

export function charIdToString(id: CharId): string {
  return `${id.clientId}:${id.clock}`;
}

export function compareCharIds(a: CharId, b: CharId): number {
  if (a.clock !== b.clock) {
    return a.clock - b.clock;
  }
  return a.clientId < b.clientId ? -1 : a.clientId > b.clientId ? 1 : 0;
}

export function charIdsEqual(a: CharId | null, b: CharId | null): boolean {
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;
  return a.clientId === b.clientId && a.clock === b.clock;
}

export interface InsertOp {
  type: 'insert';
  id: CharId;
  afterId: CharId | null;
  value: string;
}

export interface DeleteOp {
  type: 'delete';
  targetId: CharId;
}

export type CRDTOperation = InsertOp | DeleteOp;

export interface RGANode {
  id: CharId;
  value: string;
  tombstone: boolean;
  next: RGANode | null;
}

export interface SerializedRGANode {
  id: CharId;
  value: string;
  tombstone: boolean;
}

export interface SerializedRGAState {
  nodes: SerializedRGANode[];
}
