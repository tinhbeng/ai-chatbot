import { Copy, CheckCircle, TrendingUp, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

function Section({
  title,
  children,
  copyText
}: {
  title: string;
  children: React.ReactNode;
  copyText?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 text-sm border mb-3">
      <div className="flex justify-between items-center mb-2 text-xs text-zinc-500 font-semibold">
        <span>{title}</span>
        <div className="flex gap-2 items-center">
          {copyText && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(copyText);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="flex items-center text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
            >
              {copied ? <CheckCircle size={14} className="mr-1 text-green-500" /> : <Copy size={14} className="mr-1" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
          <button
            onClick={() => setExpanded((prev) => !prev)}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>
      <pre
        className={`overflow-auto text-sm leading-snug whitespace-pre-wrap transition-all duration-300 ${
          expanded ? 'max-h-none' : 'max-h-4 overflow-hidden'
        }`}
      >
        {!expanded ? <span>{`{...}`}</span> : children}
      </pre>
    </div>
  );
}

const toolIconMap: Record<string, React.ReactNode> = {
  'get-defi-price': <TrendingUp className="inline mr-1 text-green-500" size={16} />, 
  'get-price-history': <TrendingUp className="inline mr-1 text-blue-500" size={16} />, 
  // Add more icons per tool here...
};

export function ToolCallCard({
  toolName,
  args,
  result,
  status = 200
}: {
  toolName: string;
  args: any;
  result: any;
  status?: number;
}) {
  const toolIcon = toolIconMap[toolName] || <HelpCircle className="inline mr-1 text-zinc-400" size={16} />;

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 my-4 shadow-sm">
      <div className="text-xs text-zinc-500 uppercase font-semibold mb-2">
        {toolIcon} {toolName}
      </div>

      <Section title="Request" copyText={JSON.stringify(args, null, 2)}>
        {JSON.stringify(args, null, 2)}
      </Section>

      <Section title={`Response (Status: ${status})`} copyText={JSON.stringify(result, null, 2)}>
        {typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)}
      </Section>
    </div>
  );
}