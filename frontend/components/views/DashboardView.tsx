import React from 'react';
import { Code2, Layers, Cpu, Zap, ShieldAlert, AlertTriangle, Terminal, CheckCircle2, XCircle } from 'lucide-react';
import { Card, Badge } from '../ui/Primitives';
import { RepoAnalysis } from '../../types';

export const DashboardView = ({ data, onStartWalkthrough }: { data: RepoAnalysis, onStartWalkthrough: () => void }) => {
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
           <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Code2 size={18} /></div>
             <h3 className="text-sm font-medium text-slate-500">Language</h3>
           </div>
           <p className="text-xl font-semibold text-slate-900">{data.environment.language}</p>
        </Card>
        {/* Simplified for brevity - similar structure for Framework, Engine, Build */}
        <Card className="p-6">
           <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Layers size={18} /></div>
             <h3 className="text-sm font-medium text-slate-500">Framework</h3>
           </div>
           <p className="text-xl font-semibold text-slate-900">{data.environment.framework}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {data.security.length > 0 && (
            <Card className="p-6 border-red-100 bg-red-50/30">
              <div className="flex items-center gap-2 mb-4 text-red-700">
                <ShieldAlert className="h-5 w-5" />
                <h3 className="font-semibold">Security Vulnerabilities Detected</h3>
              </div>
              <div className="space-y-3">
                {data.security.map((issue, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-100 shadow-sm">
                    <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900">{issue.description}</span>
                        <Badge variant="red">{issue.severity}</Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 font-mono">{issue.file}:{issue.line}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Dependencies</h3>
            <div className="overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr><th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Package</th><th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Version</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.dependencies.map((dep, i) => (
                    <tr key={i}><td className="py-3 px-4 text-sm font-medium text-slate-900">{dep.name}</td><td className="py-3 px-4 text-sm text-slate-500 font-mono">{dep.version}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
           <Card className="p-6 border-slate-200">
             <div className="flex items-center gap-2 mb-4 text-slate-900"><Terminal className="h-5 w-5" /><h3 className="font-semibold">Startup Check</h3></div>
             {data.startup_issues.length === 0 ? (
               <div className="flex flex-col items-center text-center py-4"><CheckCircle2 className="h-6 w-6 text-green-600 mb-2"/><p className="text-sm text-green-700">Ready to Run</p></div>
             ) : (
               <div className="space-y-3">
                 {data.startup_issues.map((issue, i) => (
                   <div key={i} className="p-3 rounded-lg border bg-red-50 border-red-100 text-left">
                     <div className="flex items-center gap-2 mb-1"><XCircle size={14} className="text-red-600"/><span className="text-xs font-bold uppercase text-red-700">{issue.title}</span></div>
                     <p className="text-sm text-slate-800 mb-1">{issue.description}</p>
                     <div className="text-xs bg-white/60 p-1.5 rounded font-mono text-slate-600">Fix: {issue.fix}</div>
                   </div>
                 ))}
               </div>
             )}
           </Card>
           <Card className="p-6 bg-slate-900 text-white border-slate-900">
             <h3 className="text-lg font-semibold mb-6">Run Instructions</h3>
             <div className="space-y-4">
               {data.tasks.map((task, i) => (
                 <div key={i} className="flex items-start gap-3"><div className="mt-0.5 h-5 w-5 rounded-full border border-slate-600 flex items-center justify-center shrink-0"><span className="text-xs text-slate-400">{i + 1}</span></div><p className="text-sm text-slate-300 font-mono">{task}</p></div>
               ))}
             </div>
             <button onClick={onStartWalkthrough} className="mt-8 w-full py-3 bg-white text-slate-900 rounded-xl font-medium text-sm hover:bg-slate-100">Start Walkthrough</button>
           </Card>
        </div>
      </div>
    </div>
  );
};