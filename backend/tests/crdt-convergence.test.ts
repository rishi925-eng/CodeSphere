// ============================================================================
// CRDT Convergence Tests
// ============================================================================
// These tests verify the core property of our RGA CRDT:
// ANY two replicas that have received the same set of operations
// MUST converge to the same document state, regardless of the order
// in which they received those operations.
//
// This is the mathematical guarantee that makes CRDTs superior to
// naive last-write-wins for collaborative editing.
// ============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { RGA } from '../src/crdt/RGA.js';
import type { CRDTOperation, InsertOp, DeleteOp } from '../src/crdt/types.js';

describe('RGA CRDT — Convergence Tests', () => {
  // ==========================================================================
  // Basic Operations
  // ==========================================================================

  describe('Basic single-client operations', () => {
    let rga: RGA;

    beforeEach(() => {
      rga = new RGA('client-A');
    });

    it('should start with an empty document', () => {
      expect(rga.toString()).toBe('');
      expect(rga.length).toBe(0);
    });

    it('should insert a single character', () => {
      rga.localInsert(0, 'H');
      expect(rga.toString()).toBe('H');
      expect(rga.length).toBe(1);
    });

    it('should insert multiple characters in sequence', () => {
      rga.localInsert(0, 'H');
      rga.localInsert(1, 'i');
      rga.localInsert(2, '!');
      expect(rga.toString()).toBe('Hi!');
    });

    it('should insert at the beginning', () => {
      rga.localInsert(0, 'b');
      rga.localInsert(0, 'a');
      expect(rga.toString()).toBe('ab');
    });

    it('should insert in the middle', () => {
      rga.localInsert(0, 'a');
      rga.localInsert(1, 'c');
      rga.localInsert(1, 'b'); // insert 'b' between 'a' and 'c'
      expect(rga.toString()).toBe('abc');
    });

    it('should delete a character', () => {
      rga.localInsert(0, 'H');
      rga.localInsert(1, 'i');
      rga.localDelete(0); // delete 'H'
      expect(rga.toString()).toBe('i');
      expect(rga.length).toBe(1);
    });

    it('should handle insert string', () => {
      const ops = rga.localInsertString(0, 'Hello');
      expect(rga.toString()).toBe('Hello');
      expect(ops.length).toBe(5);
    });

    it('should handle delete range', () => {
      rga.localInsertString(0, 'Hello');
      const ops = rga.localDeleteRange(1, 3); // delete 'ell'
      expect(rga.toString()).toBe('Ho');
      expect(ops.length).toBe(3);
    });
  });

  // ==========================================================================
  // Two-Client Convergence (THE CRITICAL TESTS)
  // ==========================================================================

  describe('Two-client convergence', () => {
    let clientA: RGA;
    let clientB: RGA;

    beforeEach(() => {
      clientA = new RGA('client-A');
      clientB = new RGA('client-B');
    });

    /**
     * Helper: Apply an operation to a remote RGA.
     * Simulates sending an operation over the network.
     */
    function applyToRemote(op: CRDTOperation, remote: RGA): void {
      remote.applyRemote(op);
    }

    /**
     * Helper: Apply all operations to a remote RGA.
     */
    function applyAllToRemote(ops: CRDTOperation[], remote: RGA): void {
      for (const op of ops) {
        remote.applyRemote(op);
      }
    }

    it('should converge when both clients insert at the same position', () => {
      // Both clients start with empty document
      // Client A inserts 'A' at position 0
      const opA = clientA.localInsert(0, 'A');
      // Client B inserts 'B' at position 0
      const opB = clientB.localInsert(0, 'B');

      // Apply A's op to B, and B's op to A
      applyToRemote(opA, clientB);
      applyToRemote(opB, clientA);

      // CONVERGENCE: Both must show the same string
      expect(clientA.toString()).toBe(clientB.toString());
      // Both characters should be present
      expect(clientA.toString()).toContain('A');
      expect(clientA.toString()).toContain('B');
    });

    it('should converge when clients insert at different positions', () => {
      // Setup: both start with "Hello"
      const setupOps = clientA.localInsertString(0, 'Hello');
      applyAllToRemote(setupOps, clientB);

      // Client A inserts '!' at end (position 5)
      const opA = clientA.localInsert(5, '!');
      // Client B inserts 'X' at beginning (position 0)
      const opB = clientB.localInsert(0, 'X');

      // Cross-apply
      applyToRemote(opA, clientB);
      applyToRemote(opB, clientA);

      // CONVERGENCE
      expect(clientA.toString()).toBe(clientB.toString());
      expect(clientA.toString()).toBe('XHello!');
    });

    it('should converge when both clients delete the same character', () => {
      // Setup: both start with "ABC"
      const setupOps = clientA.localInsertString(0, 'ABC');
      applyAllToRemote(setupOps, clientB);

      // Both clients delete 'B' at position 1
      const opA = clientA.localDelete(1);
      const opB = clientB.localDelete(1);

      // Cross-apply (both are deleting the same node — must be idempotent)
      applyToRemote(opA, clientB);
      applyToRemote(opB, clientA);

      // CONVERGENCE: Both should show "AC"
      expect(clientA.toString()).toBe('AC');
      expect(clientB.toString()).toBe('AC');
    });

    it('should converge when one inserts and the other deletes at the same position', () => {
      // Setup: both start with "ABC"
      const setupOps = clientA.localInsertString(0, 'ABC');
      applyAllToRemote(setupOps, clientB);

      // Client A inserts 'X' after 'B' (position 2)
      const opA = clientA.localInsert(2, 'X');
      // Client B deletes 'B' (position 1)
      const opB = clientB.localDelete(1);

      // Cross-apply
      applyToRemote(opA, clientB);
      applyToRemote(opB, clientA);

      // CONVERGENCE: 'X' should still appear even though 'B' was deleted
      // because the insert references 'B' as afterId, and tombstoned
      // nodes still serve as reference points.
      expect(clientA.toString()).toBe(clientB.toString());
      expect(clientA.toString()).toContain('X');
      expect(clientA.toString()).not.toContain('B');
    });

    it('should converge when operations are applied in different orders', () => {
      // Client A types "AB"
      const opA1 = clientA.localInsert(0, 'A');
      const opA2 = clientA.localInsert(1, 'B');

      // Client B types "CD"
      const opB1 = clientB.localInsert(0, 'C');
      const opB2 = clientB.localInsert(1, 'D');

      // Apply to client A in order: B1, A1→B, B2, A2→B
      applyToRemote(opB1, clientA);
      applyToRemote(opA1, clientB);
      applyToRemote(opB2, clientA);
      applyToRemote(opA2, clientB);

      // CONVERGENCE: Same string regardless of interleaving
      expect(clientA.toString()).toBe(clientB.toString());
      // All four characters should be present
      expect(clientA.toString()).toContain('A');
      expect(clientA.toString()).toContain('B');
      expect(clientA.toString()).toContain('C');
      expect(clientA.toString()).toContain('D');
    });

    it('should converge with reversed operation order', () => {
      // Same operations as above, but applied in reverse order
      const opA1 = clientA.localInsert(0, 'A');
      const opA2 = clientA.localInsert(1, 'B');
      const opB1 = clientB.localInsert(0, 'C');
      const opB2 = clientB.localInsert(1, 'D');

      // Create a third replica to verify order independence
      const clientC = new RGA('client-C');

      // Client C receives: A1, A2, B1, B2 (A's ops first)
      clientC.applyRemote(opA1);
      clientC.applyRemote(opA2);
      clientC.applyRemote(opB1);
      clientC.applyRemote(opB2);

      // Client A receives B's ops
      applyToRemote(opB1, clientA);
      applyToRemote(opB2, clientA);

      // Client B receives A's ops in reverse
      applyToRemote(opA2, clientB);
      applyToRemote(opA1, clientB);

      // ALL THREE must converge
      expect(clientA.toString()).toBe(clientB.toString());
      expect(clientB.toString()).toBe(clientC.toString());
    });

    it('should converge when editing the same line simultaneously', () => {
      // Setup: both start with "function foo() {}"
      const setup = clientA.localInsertString(0, 'function foo() {}');
      applyAllToRemote(setup, clientB);

      // Client A changes "foo" to "bar" (delete f,o,o at positions 9,10,11, insert b,a,r)
      // "function foo() {}" — 'f' of 'foo' is at index 9
      const deleteOps = clientA.localDeleteRange(9, 3);
      const insertOps = clientA.localInsertString(9, 'bar');

      // Client B adds a newline + return statement inside the braces
      // '}' is at index 16 in "function foo() {}"
      const opB = clientB.localInsertString(16, '\n  return 42;\n');

      // Cross-apply
      applyAllToRemote(deleteOps, clientB);
      applyAllToRemote(insertOps, clientB);
      applyAllToRemote(opB, clientA);

      // CONVERGENCE
      expect(clientA.toString()).toBe(clientB.toString());
      // Both edits should be preserved
      expect(clientA.toString()).toContain('bar');
      expect(clientA.toString()).toContain('return 42');
    });
  });

  // ==========================================================================
  // Idempotency Tests
  // ==========================================================================

  describe('Idempotency', () => {
    it('should handle duplicate insert operations', () => {
      const clientA = new RGA('client-A');
      const clientB = new RGA('client-B');

      const op = clientA.localInsert(0, 'X');

      // Apply the same operation twice to client B
      clientB.applyRemote(op);
      clientB.applyRemote(op); // duplicate — should be ignored

      expect(clientB.toString()).toBe('X');
      expect(clientB.length).toBe(1);
    });

    it('should handle duplicate delete operations', () => {
      const clientA = new RGA('client-A');
      const clientB = new RGA('client-B');

      const insertOp = clientA.localInsert(0, 'X');
      clientB.applyRemote(insertOp);

      const deleteOp = clientA.localDelete(0);

      // Apply the same delete twice to client B
      clientB.applyRemote(deleteOp);
      clientB.applyRemote(deleteOp); // duplicate — should be no-op

      expect(clientB.toString()).toBe('');
      expect(clientB.length).toBe(0);
    });
  });

  // ==========================================================================
  // Serialization Tests
  // ==========================================================================

  describe('Serialization / Deserialization', () => {
    it('should serialize and deserialize correctly', () => {
      const clientA = new RGA('client-A');
      clientA.localInsertString(0, 'Hello, World!');
      clientA.localDelete(5); // delete ','

      const serialized = clientA.serialize();

      const clientB = new RGA('client-B');
      clientB.deserialize(serialized);

      expect(clientB.toString()).toBe(clientA.toString());
      expect(clientB.toString()).toBe('Hello World!');
    });

    it('should handle operations after deserialization', () => {
      const clientA = new RGA('client-A');
      clientA.localInsertString(0, 'Hello');

      // Serialize and send to new joiner
      const serialized = clientA.serialize();
      const clientB = new RGA('client-B');
      clientB.deserialize(serialized);

      // Both clients continue editing
      const opA = clientA.localInsert(5, '!');
      const opB = clientB.localInsert(0, '>');

      clientB.applyRemote(opA);
      clientA.applyRemote(opB);

      expect(clientA.toString()).toBe(clientB.toString());
      expect(clientA.toString()).toBe('>Hello!');
    });
  });

  // ==========================================================================
  // Stress Test — Large-Scale Convergence
  // ==========================================================================

  describe('Stress tests', () => {
    it('should converge with 1000+ operations applied in random order', () => {
      const clientA = new RGA('client-A');
      const clientB = new RGA('client-B');

      // Client A generates 500 insert operations
      const opsA: CRDTOperation[] = [];
      for (let i = 0; i < 500; i++) {
        const char = String.fromCharCode(65 + (i % 26)); // A-Z cycling
        const pos = Math.min(i, clientA.length);
        const op = clientA.localInsert(pos, char);
        opsA.push(op);
      }

      // Client B generates 500 insert operations
      const opsB: CRDTOperation[] = [];
      for (let i = 0; i < 500; i++) {
        const char = String.fromCharCode(97 + (i % 26)); // a-z cycling
        const pos = Math.min(i, clientB.length);
        const op = clientB.localInsert(pos, char);
        opsB.push(op);
      }

      // Shuffle and apply all operations to both clients
      const allOps = [...opsA, ...opsB];
      
      // Apply A's ops to B and B's ops to A in shuffled order
      const shuffledForA = [...opsB].sort(() => Math.random() - 0.5);
      const shuffledForB = [...opsA].sort(() => Math.random() - 0.5);

      for (const op of shuffledForA) {
        clientA.applyRemote(op);
      }
      for (const op of shuffledForB) {
        clientB.applyRemote(op);
      }

      // CONVERGENCE: Both must produce identical documents
      expect(clientA.toString()).toBe(clientB.toString());
      // Both must have all 1000 characters
      expect(clientA.length).toBe(1000);
    });

    it('should converge with mixed insert and delete operations', () => {
      const clientA = new RGA('client-A');
      const clientB = new RGA('client-B');

      // Setup: shared initial text
      const setup = clientA.localInsertString(0, 'The quick brown fox jumps over the lazy dog');
      for (const op of setup) {
        clientB.applyRemote(op);
      }

      // Client A: delete "quick " and insert "slow "
      const opsA: CRDTOperation[] = [];
      opsA.push(...clientA.localDeleteRange(4, 6)); // delete "quick "
      opsA.push(...clientA.localInsertString(4, 'slow '));

      // Client B: delete "lazy " and insert "energetic "
      const opsB: CRDTOperation[] = [];
      opsB.push(...clientB.localDeleteRange(35, 5)); // delete "lazy "
      opsB.push(...clientB.localInsertString(35, 'energetic '));

      // Cross-apply
      for (const op of opsA) clientB.applyRemote(op);
      for (const op of opsB) clientA.applyRemote(op);

      // CONVERGENCE
      expect(clientA.toString()).toBe(clientB.toString());
      expect(clientA.toString()).toContain('slow');
      expect(clientA.toString()).toContain('energetic');
      expect(clientA.toString()).not.toContain('quick');
      expect(clientA.toString()).not.toContain('lazy');
    });

    it('should handle rapid concurrent typing on the same line by three clients', () => {
      const clientA = new RGA('client-A');
      const clientB = new RGA('client-B');
      const clientC = new RGA('client-C');

      // All three type simultaneously from position 0
      const opsA = clientA.localInsertString(0, 'AAA');
      const opsB = clientB.localInsertString(0, 'BBB');
      const opsC = clientC.localInsertString(0, 'CCC');

      // Apply all to all (in different orders to test order independence)
      for (const op of opsB) clientA.applyRemote(op);
      for (const op of opsC) clientA.applyRemote(op);

      for (const op of opsC) clientB.applyRemote(op);
      for (const op of opsA) clientB.applyRemote(op);

      for (const op of opsA) clientC.applyRemote(op);
      for (const op of opsB) clientC.applyRemote(op);

      // ALL THREE MUST CONVERGE
      expect(clientA.toString()).toBe(clientB.toString());
      expect(clientB.toString()).toBe(clientC.toString());
      expect(clientA.length).toBe(9); // 3 chars × 3 clients
    });
  });

  // ==========================================================================
  // Edge Cases
  // ==========================================================================

  describe('Edge cases', () => {
    it('should handle empty document operations', () => {
      const rga = new RGA('client-A');
      expect(rga.toString()).toBe('');
      expect(rga.length).toBe(0);
    });

    it('should throw on delete from empty document', () => {
      const rga = new RGA('client-A');
      expect(() => rga.localDelete(0)).toThrow();
    });

    it('should throw on delete at out-of-range position', () => {
      const rga = new RGA('client-A');
      rga.localInsert(0, 'A');
      expect(() => rga.localDelete(5)).toThrow();
    });

    it('should handle single character document', () => {
      const rga = new RGA('client-A');
      rga.localInsert(0, 'X');
      expect(rga.toString()).toBe('X');
      rga.localDelete(0);
      expect(rga.toString()).toBe('');
      expect(rga.totalNodes).toBe(1); // tombstone still exists
    });

    it('should maintain Lamport clock correctly', () => {
      const clientA = new RGA('client-A');
      const clientB = new RGA('client-B');

      // Client A does 5 operations → clock should be 5
      for (let i = 0; i < 5; i++) {
        clientA.localInsert(i, String(i));
      }
      expect(clientA.currentClock).toBe(5);

      // Client B receives A's ops → B's clock should be >= 5
      const serialized = clientA.serialize();
      clientB.deserialize(serialized);
      
      // B does a new operation → its clock should be > 5
      clientB.localInsert(0, 'B');
      expect(clientB.currentClock).toBeGreaterThan(5);
    });
  });
});
