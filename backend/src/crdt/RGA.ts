// ============================================================================
// RGA — Replicated Growable Array
// ============================================================================
// A CRDT (Conflict-free Replicated Data Type) for collaborative text editing.
//
// WHY RGA?
// --------
// The naive approach (broadcast full document on every keystroke) has two
// critical problems:
// 1. CONFLICTS: When two users type simultaneously, last-write-wins causes
//    one user's characters to vanish — terrible UX.
// 2. BANDWIDTH: Sending the entire document on every keystroke is O(n) per
//    keystroke, making it unusable for large documents.
//
// RGA solves both problems:
// - Operations (insert/delete) are COMMUTATIVE — applying them in any order
//   produces the same final document state. No conflicts, ever.
// - Operations are O(1) in payload size — only the changed character is sent.
//
// HOW IT WORKS
// ------------
// The document is a linked list of character nodes, each with a unique ID
// (clientId + Lamport timestamp). The linked list maintains a total order
// that all replicas agree on.
//
// INSERT: A new node is placed after a reference node (afterId). When
// multiple inserts target the same reference, they are ordered by their
// own IDs — higher Lamport timestamp wins (appears first). This ensures
// that concurrent typists' characters interleave naturally.
//
// DELETE: Nodes are never physically removed — they are "tombstoned"
// (marked as deleted). This preserves the linked list structure so that
// future inserts referencing a deleted node still find their correct
// position. Tombstoned nodes are excluded from the visible text.
//
// CONVERGENCE: Because insert and delete are both commutative and
// idempotent, any two replicas that have seen the same set of operations
// will have identical document state — regardless of the order in which
// they received those operations.
// ============================================================================

import {
  type CharId,
  type RGANode,
  type CRDTOperation,
  type InsertOp,
  type DeleteOp,
  type SerializedRGAState,
  type SerializedRGANode,
  charIdToString,
  compareCharIds,
  charIdsEqual,
} from './types.js';

// Re-export types for convenience
export type { CharId, CRDTOperation, InsertOp, DeleteOp, SerializedRGAState };

/**
 * RGA — Replicated Growable Array
 *
 * Usage:
 *   const rga = new RGA('client-uuid');
 *   
 *   // Local edits (from user keystrokes):
 *   const insertOp = rga.localInsert(0, 'H');  // insert 'H' at position 0
 *   const deleteOp = rga.localDelete(0);         // delete char at position 0
 *   // → Send these ops to the server via Socket.IO
 *
 *   // Remote edits (from other users via Socket.IO):
 *   rga.applyRemote(receivedOp);
 *   // → Update the editor with rga.toString()
 */
export class RGA {
  /**
   * Sentinel head node — does not represent a real character.
   * All nodes in the document come after this sentinel.
   * Its ID has clock=-1 so it is always "less than" any real node.
   */
  private head: RGANode;

  /**
   * Fast lookup: CharId string → RGANode
   * Enables O(1) node lookup for delete and insert-after operations.
   */
  private nodeMap: Map<string, RGANode>;

  /**
   * This client's unique identifier.
   * Combined with the Lamport clock, it creates globally unique CharIds.
   */
  private clientId: string;

  /**
   * Lamport logical clock.
   * Incremented on every local operation.
   * Updated to max(local, remote) + 1 on every remote operation.
   * Ensures causal ordering across all clients.
   */
  private clock: number;

  constructor(clientId: string) {
    this.clientId = clientId;
    this.clock = 0;

    // Create sentinel head node
    this.head = {
      id: { clientId: '__sentinel__', clock: -1 },
      value: '',
      tombstone: false,
      next: null,
    };

    this.nodeMap = new Map();
    this.nodeMap.set(charIdToString(this.head.id), this.head);
  }

  // ==========================================================================
  // Local Operations (called by the editor when the user types)
  // ==========================================================================

  /**
   * Insert a character at a visible position in the document.
   *
   * @param position - The 0-based index in the VISIBLE text where the
   *                   character should appear. Position 0 = before first char.
   * @param value - The character to insert (single char).
   * @returns The InsertOp to broadcast to other clients.
   *
   * Algorithm:
   * 1. Walk the linked list, counting non-tombstoned nodes until we reach
   *    the node at `position - 1` (the node AFTER which we insert).
   *    If position is 0, we insert after the sentinel head.
   * 2. Generate a new CharId with incremented Lamport clock.
   * 3. Create the new node and link it into the list.
   * 4. Return the InsertOp for broadcasting.
   */
  localInsert(position: number, value: string): InsertOp {
    // Find the node after which to insert
    const afterNode = this.findVisibleNodeAt(position - 1);
    
    // Increment Lamport clock
    this.clock++;
    
    const newId: CharId = {
      clientId: this.clientId,
      clock: this.clock,
    };

    // Create and link the new node
    const newNode = this.insertAfterNode(afterNode, newId, value);

    return {
      type: 'insert',
      id: newId,
      afterId: afterNode === this.head ? null : afterNode.id,
      value,
    };
  }

  /**
   * Delete the character at a visible position in the document.
   *
   * @param position - The 0-based index in the VISIBLE text of the
   *                   character to delete.
   * @returns The DeleteOp to broadcast to other clients.
   *
   * The character is NOT physically removed — it is tombstoned.
   * This preserves the linked list structure for future insert operations
   * that may reference this node as their afterId.
   */
  localDelete(position: number): DeleteOp {
    // Find the visible node at the given position
    const targetNode = this.findVisibleNodeAt(position);
    
    if (targetNode === this.head) {
      throw new Error(`Cannot delete at position ${position}: position out of range`);
    }

    // Tombstone the node
    targetNode.tombstone = true;

    return {
      type: 'delete',
      targetId: targetNode.id,
    };
  }

  /**
   * Generate multiple InsertOps for a multi-character string insert.
   * Used when the user pastes text or an autocomplete suggestion is accepted.
   */
  localInsertString(position: number, text: string): InsertOp[] {
    const ops: InsertOp[] = [];
    for (let i = 0; i < text.length; i++) {
      const op = this.localInsert(position + i, text[i]!);
      ops.push(op);
    }
    return ops;
  }

  /**
   * Generate multiple DeleteOps for a range deletion.
   * Used when the user selects text and deletes it.
   * Deletes from startPosition to startPosition + count - 1.
   * We always delete at startPosition because after each delete,
   * the next character slides into that position.
   */
  localDeleteRange(startPosition: number, count: number): DeleteOp[] {
    const ops: DeleteOp[] = [];
    for (let i = 0; i < count; i++) {
      const op = this.localDelete(startPosition);
      ops.push(op);
    }
    return ops;
  }

  // ==========================================================================
  // Remote Operations (called when receiving ops from other clients)
  // ==========================================================================

  /**
   * Operations buffered because their dependencies (afterId or targetId)
   * haven't arrived yet.
   */
  private pendingOps: CRDTOperation[] = [];

  /**
   * Apply a remote operation received from another client.
   */
  applyRemote(op: CRDTOperation): void {
    if (op.type === 'insert') {
      const idStr = charIdToString(op.id);
      if (this.nodeMap.has(idStr)) return; // Already applied

      // Check if dependencies exist
      const depId = op.afterId;
      if (depId !== null && !this.nodeMap.has(charIdToString(depId))) {
        // Parent node not found, buffer it
        this.pendingOps.push(op);
        return;
      }

      this.applyRemoteInsert(op);
    } else {
      const targetStr = charIdToString(op.targetId);
      if (!this.nodeMap.has(targetStr)) {
        // Target node not found, buffer it
        this.pendingOps.push(op);
        return;
      }
      this.applyRemoteDelete(op);
    }

    // Process any buffered operations that might now be ready
    this.processPendingOps();
  }

  /**
   * Try to apply any operations currently in the pending buffer.
   */
  private processPendingOps(): void {
    let progress = true;
    while (progress) {
      progress = false;
      for (let i = 0; i < this.pendingOps.length; i++) {
        const op = this.pendingOps[i]!;
        let ready = false;

        if (op.type === 'insert') {
          const depId = op.afterId;
          if (depId === null || this.nodeMap.has(charIdToString(depId))) {
            ready = true;
          }
        } else {
          const targetStr = charIdToString(op.targetId);
          if (this.nodeMap.has(targetStr)) {
            ready = true;
          }
        }

        if (ready) {
          this.pendingOps.splice(i, 1);
          i--;
          if (op.type === 'insert') {
            this.applyRemoteInsert(op);
          } else {
            this.applyRemoteDelete(op);
          }
          progress = true;
        }
      }
    }
  }

  /**
   * Apply a remote insert operation.
   */
  private applyRemoteInsert(op: InsertOp): void {
    const idStr = charIdToString(op.id);

    // Idempotency check — skip if already applied
    if (this.nodeMap.has(idStr)) {
      return;
    }

    // Update Lamport clock: max(local, remote) + 1 for causal ordering
    this.clock = Math.max(this.clock, op.id.clock);

    // Find the reference node (afterId)
    let afterNode: RGANode;
    if (op.afterId === null) {
      afterNode = this.head;
    } else {
      const afterStr = charIdToString(op.afterId);
      const found = this.nodeMap.get(afterStr);
      if (!found) {
        // Fallback (should not be reached now that buffering is active)
        console.warn(`RGA: afterId ${afterStr} not found, appending at end`);
        afterNode = this.findLastNode();
      } else {
        afterNode = found;
      }
    }

    this.insertAfterNode(afterNode, op.id, op.value);
  }

  /**
   * Apply a remote delete operation.
   */
  private applyRemoteDelete(op: DeleteOp): void {
    const idStr = charIdToString(op.targetId);
    const node = this.nodeMap.get(idStr);

    if (!node) {
      return;
    }

    // Update Lamport clock
    this.clock = Math.max(this.clock, op.targetId.clock);

    // Tombstone (idempotent)
    node.tombstone = true;
  }

  // ==========================================================================
  // Internal Helpers
  // ==========================================================================

  /**
   * Insert a new node after `afterNode`, finding the correct position
   * among sibling nodes based on CharId ordering.
   *
   * "Siblings" are nodes that were inserted directly after the same
   * reference node. Among siblings, higher CharId = placed first (leftward).
   *
   * Why this ordering?
   * - If User A and User B both insert after the same character at the
   *   same time, we need a deterministic rule to decide who goes first.
   * - Higher Lamport clock means "later" operation, which we place first
   *   (leftward). This gives natural interleaving: if A types "ab" and
   *   B types "cd" concurrently after the same position, the result is
   *   a deterministic merge like "cdab" or "abcd" — never "acbd".
   */
  private insertAfterNode(afterNode: RGANode, newId: CharId, value: string): RGANode {
    const newNode: RGANode = {
      id: newId,
      value,
      tombstone: false,
      next: null,
    };

    // Scan forward from afterNode to find insertion point
    let current = afterNode;
    
    while (current.next !== null) {
      const nextNode = current.next;
      
      // Check if nextNode is a "sibling" (also inserted after the same reference)
      // or a node inserted after some later node (in which case it's not our sibling).
      //
      // We determine siblinghood by comparing IDs: a node with a HIGHER ID than
      // our new node was inserted "later" (or by a higher-priority client) and
      // should stay to our left. We keep scanning past it.
      //
      // A node with a LOWER ID should come after us — we stop here.
      if (compareCharIds(nextNode.id, newId) > 0) {
        // nextNode has higher priority — keep scanning
        current = nextNode;
      } else {
        // nextNode has lower or equal priority — insert before it
        break;
      }
    }

    // Link the new node into the list
    newNode.next = current.next;
    current.next = newNode;

    // Register in the lookup map
    this.nodeMap.set(charIdToString(newId), newNode);

    return newNode;
  }

  /**
   * Find the visible (non-tombstoned) node at a given position.
   *
   * Position -1 returns the sentinel head node.
   * Position 0 returns the first visible character.
   *
   * @throws Error if position is out of range.
   */
  private findVisibleNodeAt(position: number): RGANode {
    if (position === -1) {
      return this.head;
    }

    let current = this.head.next;
    let visibleIndex = 0;

    while (current !== null) {
      if (!current.tombstone) {
        if (visibleIndex === position) {
          return current;
        }
        visibleIndex++;
      }
      current = current.next;
    }

    throw new Error(
      `Position ${position} out of range (document has ${visibleIndex} visible characters)`
    );
  }

  /**
   * Find the last node in the linked list.
   */
  private findLastNode(): RGANode {
    let current = this.head;
    while (current.next !== null) {
      current = current.next;
    }
    return current;
  }

  // ==========================================================================
  // Query Methods
  // ==========================================================================

  /**
   * Render the visible document text.
   * Walks the linked list and concatenates non-tombstoned characters.
   */
  toString(): string {
    const chars: string[] = [];
    let current = this.head.next;

    while (current !== null) {
      if (!current.tombstone) {
        chars.push(current.value);
      }
      current = current.next;
    }

    return chars.join('');
  }

  /**
   * Get the number of visible (non-tombstoned) characters.
   */
  get length(): number {
    let count = 0;
    let current = this.head.next;

    while (current !== null) {
      if (!current.tombstone) {
        count++;
      }
      current = current.next;
    }

    return count;
  }

  /**
   * Get the total number of nodes (including tombstones).
   * Useful for monitoring tombstone accumulation.
   */
  get totalNodes(): number {
    return this.nodeMap.size - 1; // Exclude sentinel
  }

  /**
   * Get the current Lamport clock value.
   */
  get currentClock(): number {
    return this.clock;
  }

  /**
   * Get this RGA instance's client ID.
   */
  getClientId(): string {
    return this.clientId;
  }

  /**
   * Get the CharId of the visible character at a given position.
   * Returns null for position -1 (represents "beginning of document").
   */
  getCharIdAt(position: number): CharId | null {
    if (position < 0) return null;
    const node = this.findVisibleNodeAt(position);
    return node === this.head ? null : node.id;
  }

  // ==========================================================================
  // Serialization (for sending full state to new joiners)
  // ==========================================================================

  /**
   * Serialize the RGA state to a plain object.
   * Used when a new client joins and needs the full document state.
   *
   * We serialize all nodes (including tombstones) to preserve the
   * complete linked list structure. The deserializing client can then
   * apply any buffered operations correctly.
   */
  serialize(): SerializedRGAState {
    const nodes: SerializedRGANode[] = [];
    let current = this.head.next; // Skip sentinel

    while (current !== null) {
      nodes.push({
        id: current.id,
        value: current.value,
        tombstone: current.tombstone,
      });
      current = current.next;
    }

    return { nodes };
  }

  /**
   * Deserialize an RGA state and replace this instance's content.
   * Used by new joiners to initialize their local RGA from the server's state.
   */
  deserialize(state: SerializedRGAState): void {
    // Clear existing state
    this.head.next = null;
    this.nodeMap.clear();
    this.nodeMap.set(charIdToString(this.head.id), this.head);

    // Rebuild linked list in order
    let current = this.head;
    let maxClock = 0;

    for (const serializedNode of state.nodes) {
      const node: RGANode = {
        id: serializedNode.id,
        value: serializedNode.value,
        tombstone: serializedNode.tombstone,
        next: null,
      };

      current.next = node;
      current = node;
      this.nodeMap.set(charIdToString(node.id), node);

      if (node.id.clock > maxClock) {
        maxClock = node.id.clock;
      }
    }

    // Update clock to be at least as high as the highest seen
    this.clock = Math.max(this.clock, maxClock);
  }

  // ==========================================================================
  // Batch Operations (for efficiency)
  // ==========================================================================

  /**
   * Apply multiple remote operations at once.
   * More efficient than calling applyRemote() in a loop when
   * receiving a batch of operations (e.g., after a network reconnect).
   */
  applyRemoteBatch(ops: CRDTOperation[]): void {
    for (const op of ops) {
      this.applyRemote(op);
    }
  }
}

export default RGA;
