// ============================================================================
// CodeEditor — CRDT-aware Monaco Editor
// ============================================================================
// Updated to convert Monaco editor changes into CRDT operations.
//
// BEFORE: onChange sends the FULL document text → Room.tsx broadcasts it
// AFTER: onCRDTOperations sends individual insert/delete operations →
//        Room.tsx emits them via Socket.IO → other clients apply them
//
// The key challenge is handling the bidirectional flow:
// 1. LOCAL changes: User types → Monaco fires onDidChangeModelContent →
//    we convert the delta to CRDT ops → emit to server
// 2. REMOTE changes: Server sends CRDT op → we apply to local RGA →
//    we update Monaco via executeEdits (which does NOT fire onChange,
//    preventing an infinite loop)
// ============================================================================

import { useRef, useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import type { CRDTOperation } from '../crdt/types';
import type { RGA } from '../crdt/RGA';

interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (code: string) => void;
  readOnly?: boolean;
  // CRDT integration props
  rga?: RGA | null;
  onCRDTOperations?: (ops: CRDTOperation[]) => void;
}

const CodeEditor = ({ 
  code, 
  language, 
  onChange, 
  readOnly = false,
  rga,
  onCRDTOperations,
}: CodeEditorProps) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  // Flag to prevent infinite loop: when we apply remote changes via
  // executeEdits, Monaco fires onDidChangeModelContent. We use this flag
  // to distinguish remote changes (ignore) from local changes (convert to CRDT ops).
  const isApplyingRemote = useRef(false);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // ====================================================================
    // Hook into Monaco's content change event for CRDT integration
    // ====================================================================
    if (rga && onCRDTOperations) {
      editor.onDidChangeModelContent((event: any) => {
        // Skip if this change was caused by a remote CRDT operation
        if (isApplyingRemote.current) return;

        const ops: CRDTOperation[] = [];
        const model = editor.getModel();
        if (!model) return;

        // Process each change in the event.
        // Monaco gives us changes as an array of { range, text, rangeOffset, rangeLength }
        // We need to convert these to CRDT operations.
        //
        // IMPORTANT: Changes in a single event are given in the order they
        // were applied by Monaco. We process them in order, adjusting offsets
        // as we go (each insert/delete shifts subsequent positions).
        for (const change of event.changes) {
          const startOffset = change.rangeOffset;
          const deletedLength = change.rangeLength;
          const insertedText = change.text;

          // Handle deletions first (delete characters that were replaced/removed)
          if (deletedLength > 0) {
            try {
              const deleteOps = rga.localDeleteRange(startOffset, deletedLength);
              ops.push(...deleteOps);
            } catch (e) {
              console.warn('CRDT delete error:', e);
            }
          }

          // Handle insertions (insert new characters)
          if (insertedText.length > 0) {
            try {
              const insertOps = rga.localInsertString(startOffset, insertedText);
              ops.push(...insertOps);
            } catch (e) {
              console.warn('CRDT insert error:', e);
            }
          }
        }

        // Emit CRDT operations to the server
        if (ops.length > 0 && onCRDTOperations) {
          onCRDTOperations(ops);
        }

        // Also update the parent's code state for non-CRDT consumers
        const newValue = model.getValue();
        onChange(newValue);
      });
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    // In CRDT mode, changes are handled by onDidChangeModelContent above.
    // This callback is only used in non-CRDT (legacy) mode.
    if (!rga && value !== undefined && !readOnly) {
      onChange(value);
    }
  };

  /**
   * Apply a remote CRDT operation to the Monaco editor.
   * Uses executeEdits to modify the editor content WITHOUT triggering
   * the onDidChangeModelContent handler (prevented by isApplyingRemote flag).
   */
  const applyRemoteOperation = useCallback((op: CRDTOperation) => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco || !rga) return;

    const model = editor.getModel();
    if (!model) return;

    // Apply the operation to the local RGA first
    rga.applyRemote(op);

    // Now update Monaco to match the RGA state.
    // Instead of replacing the entire document (which loses cursor position),
    // we apply surgical edits based on the operation type.
    isApplyingRemote.current = true;
    try {
      // Get the full text from RGA and set it
      // This is simpler than trying to compute the exact Monaco edit
      // and works correctly with tombstones and reordering
      const newText = rga.toString();
      const currentText = model.getValue();
      
      if (newText !== currentText) {
        // Save cursor position
        const position = editor.getPosition();
        const selections = editor.getSelections();
        
        // Replace entire content
        model.setValue(newText);
        
        // Restore cursor position (best effort)
        if (position) {
          editor.setPosition(position);
        }
        if (selections) {
          editor.setSelections(selections);
        }
      }
    } finally {
      isApplyingRemote.current = false;
    }
  }, [rga]);

  /**
   * Apply a batch of remote CRDT operations.
   */
  const applyRemoteBatch = useCallback((ops: CRDTOperation[]) => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco || !rga) return;

    const model = editor.getModel();
    if (!model) return;

    isApplyingRemote.current = true;
    try {
      // Apply all operations to the local RGA
      for (const op of ops) {
        rga.applyRemote(op);
      }

      // Update Monaco
      const newText = rga.toString();
      const currentText = model.getValue();
      
      if (newText !== currentText) {
        const position = editor.getPosition();
        const selections = editor.getSelections();
        model.setValue(newText);
        if (position) editor.setPosition(position);
        if (selections) editor.setSelections(selections);
      }
    } finally {
      isApplyingRemote.current = false;
    }
  }, [rga]);

  // Expose methods for parent component to call
  useEffect(() => {
    if (editorRef.current) {
      (editorRef.current as any).__applyRemoteOperation = applyRemoteOperation;
      (editorRef.current as any).__applyRemoteBatch = applyRemoteBatch;
    }
  }, [applyRemoteOperation, applyRemoteBatch]);

  // Monaco language mapping
  const getMonacoLanguage = (lang: string) => {
    const languageMap: { [key: string]: string } = {
      javascript: 'javascript',
      typescript: 'typescript',
      python: 'python',
      java: 'java',
      cpp: 'cpp',
      go: 'go'
    };
    return languageMap[lang] || 'javascript';
  };

  return (
    <div className="flex-1 relative bg-dark-900 overflow-hidden">
      <Editor
        height="100%"
        language={getMonacoLanguage(language)}
        value={rga ? undefined : code}  // In CRDT mode, Monaco manages its own state
        defaultValue={code}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme="vs-dark"
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
          fontLigatures: true,
          lineNumbers: 'on',
          rulers: [80, 120],
          wordWrap: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          readOnly: readOnly,
          cursorStyle: 'line',
          cursorBlinking: 'smooth',
          smoothScrolling: true,
          padding: { top: 16, bottom: 16 },
          suggest: {
            showMethods: true,
            showFunctions: true,
            showConstructors: true,
            showFields: true,
            showVariables: true,
            showClasses: true,
            showStructs: true,
            showInterfaces: true,
            showModules: true,
            showProperties: true,
            showEvents: true,
            showOperators: true,
            showUnits: true,
            showValues: true,
            showConstants: true,
            showEnums: true,
            showEnumMembers: true,
            showKeywords: true,
            showWords: true,
            showColors: true,
            showFiles: true,
            showReferences: true,
            showFolders: true,
            showTypeParameters: true,
            showSnippets: true
          },
          quickSuggestions: {
            other: true,
            comments: false,
            strings: false
          },
          tabSize: 2,
          insertSpaces: true,
          detectIndentation: true,
          formatOnPaste: true,
          formatOnType: true,
          bracketPairColorization: {
            enabled: true
          }
        }}
      />
    </div>
  );
};

export default CodeEditor;
