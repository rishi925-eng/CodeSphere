import { Terminal, Loader2, Cpu, Clock } from 'lucide-react';

interface OutputPanelProps {
  output: string;
  status?: 'idle' | 'queued' | 'running' | 'completed' | 'failed';
  executionTime?: number; // in ms
  memoryUsed?: number; // in bytes
}

const OutputPanel = ({ 
  output, 
  status = 'idle', 
  executionTime, 
  memoryUsed 
}: OutputPanelProps) => {
  // Simple check for errors in the output text
  const isError = output.toLowerCase().includes('error') || 
                  output.toLowerCase().includes('exception') || 
                  status === 'failed';

  // Format memory usage to readable string
  const formatMemory = (bytes?: number) => {
    if (!bytes) return undefined;
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="h-56 bg-dark-950 border-t border-dark-700 flex flex-col font-mono text-sm relative group transition-all">
      {/* Panel Header */}
      <div className="bg-dark-900 border-b border-dark-700 px-4 py-2 flex items-center justify-between select-none">
        <div className="flex items-center space-x-2 text-gray-400">
          <Terminal className="h-4 w-4 text-primary-400" />
          <span className="text-xs font-semibold tracking-wider uppercase">Terminal Output</span>
        </div>
        
        {/* Status Indicator */}
        <div className="flex items-center space-x-4">
          {status === 'queued' && (
            <span className="flex items-center text-xs text-amber-400 animate-pulse">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Queued...
            </span>
          )}
          {status === 'running' && (
            <span className="flex items-center text-xs text-blue-400">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Running...
            </span>
          )}
          {status === 'completed' && (
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-950/45 px-2 py-0.5 rounded border border-emerald-500/20">
              Success
            </span>
          )}
          {status === 'failed' && (
            <span className="text-xs text-red-400 font-semibold bg-red-950/45 px-2 py-0.5 rounded border border-red-500/20">
              Failed
            </span>
          )}

          {/* Performance Metrics */}
          {executionTime !== undefined && (
            <div className="flex items-center space-x-1 text-xs text-gray-400">
              <Clock className="h-3.5 w-3.5 text-gray-500" />
              <span>{executionTime}ms</span>
            </div>
          )}
          {memoryUsed !== undefined && memoryUsed > 0 && (
            <div className="flex items-center space-x-1 text-xs text-gray-400">
              <Cpu className="h-3.5 w-3.5 text-gray-500" />
              <span>{formatMemory(memoryUsed)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Output Console */}
      <div className="flex-1 overflow-auto p-4 select-text">
        {status === 'idle' && !output ? (
          <div className="h-full flex items-center justify-center text-gray-500 select-none">
            <span className="bg-dark-900 border border-dark-800 px-4 py-2 rounded-lg text-xs tracking-wide">
              💡 Run your code to see output here...
            </span>
          </div>
        ) : (
          <pre className={`whitespace-pre-wrap break-all ${isError ? 'text-red-400' : 'text-gray-200'}`}>
            {output}
          </pre>
        )}
      </div>
    </div>
  );
};

export default OutputPanel;
