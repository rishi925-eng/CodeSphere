import { Terminal } from 'lucide-react';

interface OutputPanelProps {
  output: string;
}

const OutputPanel = ({ output }: OutputPanelProps) => {
  const hasError = output && (output.toLowerCase().includes('error') || output.toLowerCase().includes('exception'));
  const hasOutput = output && output !== 'Run your code to see output here...' && !output.includes('Running code');
  
  return (
    <div className="h-48 bg-dark-800 border-t border-dark-700 flex flex-col">
      <div className="flex items-center space-x-2 px-4 py-2.5 border-b border-dark-700 bg-dark-800/50 backdrop-blur-sm">
        <Terminal className="h-4 w-4 text-green-400" />
        <span className="text-sm font-semibold text-gray-300">Output</span>
        {hasOutput && (
          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
            hasError ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
          }`}>
            {hasError ? '⚠ Error' : '✓ Success'}
          </span>
        )}
      </div>
      <div className="flex-1 overflow-auto p-4 bg-dark-900">
        <pre className={`text-sm font-mono whitespace-pre-wrap leading-relaxed ${
          hasError ? 'text-red-400' : output ? 'text-gray-300' : 'text-gray-500 italic'
        }`}>
          {output || '💡 Run your code to see output here...'}
        </pre>
      </div>
    </div>
  );
};

export default OutputPanel;
