// ============================================================================
// RGA — Frontend Copy (Replicated Growable Array)
// ============================================================================
// Mirror of backend/src/crdt/RGA.ts for client-side use.
// Each browser tab maintains its own RGA instance that stays in sync
// with the server and other clients via CRDT operations over Socket.IO.
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
} from './types';

export type { CharId, CRDTOperation, InsertOp, DeleteOp, SerializedRGAState };

export class RGA {
  private head: RGANode;
  private nodeMap: Map<string, RGANode>;
  private clientId: string;
  private clock: number;
  private pendingOps: CRDTOperation[] = [];

  constructor(clientId: string) {
    this.clientId = clientId;
    this.clock = 0;

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
  // Local Operations
  // ==========================================================================

  localInsert(position: number, value: string): InsertOp {
    const afterNode = this.findVisibleNodeAt(position - 1);
    this.clock++;

    const newId: CharId = {
      clientId: this.clientId,
      clock: this.clock,
    };

    this.insertAfterNode(afterNode, newId, value);

    return {
      type: 'insert',
      id: newId,
      afterId: afterNode === this.head ? null : afterNode.id,
      value,
    };
  }

  localDelete(position: number): DeleteOp {
    const targetNode = this.findVisibleNodeAt(position);

    if (targetNode === this.head) {
      throw new Error(`Cannot delete at position ${position}: position out of range`);
    }

    targetNode.tombstone = true;

    return {
      type: 'delete',
      targetId: targetNode.id,
    };
  }

  localInsertString(position: number, text: string): InsertOp[] {
    const ops: InsertOp[] = [];
    for (let i = 0; i < text.length; i++) {
      const op = this.localInsert(position + i, text[i]!);
      ops.push(op);
    }
    return ops;
  }

  localDeleteRange(startPosition: number, count: number): DeleteOp[] {
    const ops: DeleteOp[] = [];
    for (let i = 0; i < count; i++) {
      const op = this.localDelete(startPosition);
      ops.push(op);
    }
    return ops;
  }

  // ==========================================================================
  // Remote Operations
  // ==========================================================================

  applyRemote(op: CRDTOperation): void {
    if (op.type === 'insert') {
      const idStr = charIdToString(op.id);
      if (this.nodeMap.has(idStr)) return; // Already applied

      const depId = op.afterId;
      if (depId !== null && !this.nodeMap.has(charIdToString(depId))) {
        this.pendingOps.push(op);
        return;
      }

      this.applyRemoteInsert(op);
    } else {
      const targetStr = charIdToString(op.targetId);
      if (!this.nodeMap.has(targetStr)) {
        this.pendingOps.push(op);
        return;
      }
      this.applyRemoteDelete(op);
    }

    this.processPendingOps();
  }

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

  private applyRemoteInsert(op: InsertOp): void {
    const idStr = charIdToString(op.id);

    if (this.nodeMap.has(idStr)) {
      return;
    }

    this.clock = Math.max(this.clock, op.id.clock);

    let afterNode: RGANode;
    if (op.afterId === null) {
      afterNode = this.head;
    } else {
      const afterStr = charIdToString(op.afterId);
      const found = this.nodeMap.get(afterStr);
      if (!found) {
        console.warn(`RGA: afterId ${afterStr} not found, appending at end`);
        afterNode = this.findLastNode();
      } else {
        afterNode = found;
      }
    }

    this.insertAfterNode(afterNode, op.id, op.value);
  }

  private applyRemoteDelete(op: DeleteOp): void {
    const idStr = charIdToString(op.targetId);
    const node = this.nodeMap.get(idStr);

    if (!node) {
      return;
    }

    this.clock = Math.max(this.clock, op.targetId.clock);
    node.tombstone = true;
  }

  // ==========================================================================
  // Internal Helpers
  // ==========================================================================

  private insertAfterNode(afterNode: RGANode, newId: CharId, value: string): RGANode {
    const newNode: RGANode = {
      id: newId,
      value,
      tombstone: false,
      next: null,
    };

    let current = afterNode;

    while (current.next !== null) {
      const nextNode = current.next;
      if (compareCharIds(nextNode.id, newId) > 0) {
        current = nextNode;
      } else {
        break;
      }
    }

    newNode.next = current.next;
    current.next = newNode;
    this.nodeMap.set(charIdToString(newId), newNode);

    return newNode;
  }

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

  get totalNodes(): number {
    return this.nodeMap.size - 1;
  }

  get currentClock(): number {
    return this.clock;
  }

  getClientId(): string {
    return this.clientId;
  }

  getCharIdAt(position: number): CharId | null {
    if (position < 0) return null;
    const node = this.findVisibleNodeAt(position);
    return node === this.head ? null : node.id;
  }

  // ==========================================================================
  // Serialization
  // ==========================================================================

  serialize(): SerializedRGAState {
    const nodes: SerializedRGANode[] = [];
    let current = this.head.next;

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

  deserialize(state: SerializedRGAState): void {
    this.head.next = null;
    this.nodeMap.clear();
    this.nodeMap.set(charIdToString(this.head.id), this.head);

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

    this.clock = Math.max(this.clock, maxClock);
  }

  applyRemoteBatch(ops: CRDTOperation[]): void {
    for (const op of ops) {
      this.applyRemote(op);
    }
  }
}

export default RGA;
