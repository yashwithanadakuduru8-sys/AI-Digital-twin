import React, { useState, useEffect, useRef } from "react";
import {
  Database,
  Terminal,
  Cpu,
  Layers,
  Globe,
  Play,
  Check,
  Settings,
  Activity,
  FileText,
  RefreshCw,
  Search,
  Grid,
  ChevronRight,
  LineChart,
  Plus,
  ChevronDown,
  Trash2,
  X,
  ExternalLink,
  Sparkles,
  SearchCode,
  Lock,
  ArrowRight,
  Users,
  AlertCircle
} from "lucide-react";

interface WorkspaceConsoleProps {
  isOpen: boolean;
  onClose: () => void;
  onActivateTwin?: () => void;
}

export default function WorkspaceConsole({ isOpen, onClose, onActivateTwin }: WorkspaceConsoleProps) {
  const [activeService, setActiveService] = useState<"rds" | "dynamodb">("rds");
  const [selectedRegion, setSelectedRegion] = useState("us-east-1");
  const [queryInput, setQueryInput] = useState("SELECT * FROM outreach_drafts ORDER BY created_at DESC;");
  const [queryResult, setQueryResult] = useState<any[] | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  
  // Real-time metrics states
  const [cpuUtil, setCpuUtil] = useState(14.8);
  const [connections, setConnections] = useState(4);
  const [latency, setLatency] = useState(1.8);
  const [storageUsed, setStorageUsed] = useState(2.34);
  const [metricHistory, setMetricHistory] = useState<number[]>([12, 15, 13, 16, 14, 18, 15]);

  // Log stream state
  const [dbLogs, setDbLogs] = useState<Array<{ timestamp: string; type: "aurora" | "dynamodb" | "system"; message: string; method?: string }>>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // DynamoDB Scan query state
  const [ddbFilterKey, setDdbFilterKey] = useState("");
  const [ddbResult, setDdbResult] = useState<any[]>([]);

  // Periodically fluctuate stats and add console transactions
  useEffect(() => {
    if (!isOpen) return;

    // Load initial logs
    const initialLogs = [
      { timestamp: getTimestamp(), type: "system" as const, message: "Workspace Console initialized. SSL Connection secure." },
      { timestamp: getTimestamp(15), type: "aurora" as const, message: "Connection pool established (4 active, 10 idle clients)" },
      { timestamp: getTimestamp(10), type: "dynamodb" as const, message: "DynamoDB client connected to twin-memory-table" },
      { timestamp: getTimestamp(5), type: "aurora" as const, message: "SELECT * FROM users WHERE uid = 'twin-user-current' LIMIT 1" },
    ];
    setDbLogs(initialLogs);

    const interval = setInterval(() => {
      // Fluctuate CPU & Latency
      setCpuUtil(prev => Math.max(8.5, Math.min(65.2, +(prev + (Math.random() * 4 - 2)).toFixed(1))));
      setLatency(prev => Math.max(0.8, Math.min(4.5, +(prev + (Math.random() * 0.6 - 0.3)).toFixed(2))));
      setConnections(prev => Math.max(2, Math.min(15, prev + (Math.random() > 0.75 ? (Math.random() > 0.5 ? 1 : -1) : 0))));

      setMetricHistory(prev => {
        const next = [...prev.slice(1)];
        next.push(Math.round(cpuUtil));
        return next;
      });

      // Add random query logs matching outreach state
      const randomLogs = [
        { type: "aurora" as const, message: "SELECT COUNT(*) FROM outreach_drafts WHERE status = 'saved'" },
        { type: "dynamodb" as const, message: "PutItem action: Saved auto-save draft heartbeat to twin-memory-table" },
        { type: "aurora" as const, message: "UPDATE users SET last_active_at = NOW() WHERE uid = 'twin-user-current'" },
        { type: "dynamodb" as const, message: "Query action: Retrieved cognitive embedding vector (1536 dims)" },
        { type: "aurora" as const, message: "SELECT * FROM humanizer_rules WHERE is_enabled = true" }
      ];

      const log = randomLogs[Math.floor(Math.random() * randomLogs.length)];
      setDbLogs(prev => [
        ...prev,
        { timestamp: getTimestamp(), type: log.type, message: log.message }
      ].slice(-30)); // limit to last 30 logs

    }, 4000);

    return () => clearInterval(interval);
  }, [isOpen, cpuUtil]);

  // Scroll to bottom of logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [dbLogs]);

  function getTimestamp(secondsAgo = 0) {
    const d = new Date(Date.now() - secondsAgo * 1000);
    return d.toTimeString().split(" ")[0] + "." + String(d.getMilliseconds()).padStart(3, "0");
  }

  // Sync / load items from local storage to represent "Aurora PG outreach_drafts" or "DynamoDB memories"
  const getDraftsFromLocal = () => {
    try {
      // Try finding saved drafts or autosaved draft from ColdOutreachEngine
      const rawSaved = localStorage.getItem("twin_saved_drafts");
      const rawAutosaved = localStorage.getItem("twin_autosave_draft");
      
      let items: any[] = [];
      
      // Default initial mock drafts in case localstorage is empty
      const defaultDrafts = [
        {
          id: 101,
          company: "Acme Corp",
          role: "VP of Engineering",
          audience: "pro",
          tone: "confident",
          subject: "Frictionless checkout experience at Acme Corp",
          body: "Hey Sarah,\n\nI noticed your API documentation is extremely thorough but the developer onboarding flow still has some friction points. I actually designed a checkout prototype that reduces dropoff by 14%. Let me know if you'd like a look.\n\nBest,\nYour Twin",
          created_at: getTimestamp(3600)
        },
        {
          id: 102,
          company: "Stripe",
          role: "Integration Engineer",
          audience: "pro",
          tone: "bold",
          subject: "Your API playground dashboard",
          body: "Hi Marcus,\n\nYour dashboard is gorgeous. I've compiled some notes on simplifying the sandbox API key retrieval process. Would you be open to a quick portfolio view?\n\nBest,\nYour Twin",
          created_at: getTimestamp(1800)
        }
      ];

      if (rawSaved) {
        const parsedSaved = JSON.parse(rawSaved);
        if (Array.isArray(parsedSaved)) {
          parsedSaved.forEach((d: any, idx: number) => {
            items.push({
              id: idx + 1,
              company: d.company || "Unknown",
              role: d.role || "Prospect",
              audience: "pro",
              tone: d.tone || "confident",
              subject: d.subject || "No Subject",
              body: d.body || "",
              created_at: d.timestamp ? new Date(d.timestamp).toTimeString().split(" ")[0] : getTimestamp(idx * 600)
            });
          });
        }
      }

      if (rawAutosaved) {
        const d = JSON.parse(rawAutosaved);
        if (d && (d.subject || d.body)) {
          items.unshift({
            id: items.length + 1,
            company: d.inputs?.company || "Autosave Temp",
            role: d.inputs?.role || "Active Session",
            audience: "pro",
            tone: d.inputs?.tone || "confident",
            subject: d.subject || "Draft (Autosaved)",
            body: d.body || "",
            created_at: d.timestamp ? new Date(d.timestamp).toTimeString().split(" ")[0] : getTimestamp(1)
          });
        }
      }

      return items.length > 0 ? items : defaultDrafts;
    } catch (e) {
      return [];
    }
  };

  // Run PostgreSQL / Aurora queries simulator
  const handleExecuteQuery = () => {
    setIsRunning(true);
    setQueryError(null);
    setQueryResult(null);

    // Add log entry
    setDbLogs(prev => [
      ...prev,
      { timestamp: getTimestamp(), type: "aurora", message: `Executing query: "${queryInput}"` }
    ]);

    setTimeout(() => {
      setIsRunning(false);
      const queryClean = queryInput.trim().toLowerCase().replace(/;+$/, "");

      try {
        if (queryClean.startsWith("select * from outreach_drafts")) {
          const drafts = getDraftsFromLocal();
          if (queryClean.includes("where")) {
            // simple filter simulator
            const match = queryClean.match(/where\s+(\w+)\s*=\s*'([^']+)'/);
            if (match) {
              const field = match[1];
              const value = match[2];
              const filtered = drafts.filter(d => String(d[field]).toLowerCase() === value.toLowerCase());
              setQueryResult(filtered);
            } else {
              setQueryResult(drafts);
            }
          } else {
            setQueryResult(drafts);
          }
        } else if (queryClean.startsWith("select * from users")) {
          setQueryResult([
            { id: 1, uid: "twin-user-current", email: "yashwithanadakuduru8@gmail.com", last_active: getTimestamp(1), model_affinity: "gemini-2.5-pro", typing_wpm: 87 }
          ]);
        } else if (queryClean.startsWith("select * from humanizer_rules")) {
          setQueryResult([
            { id: 1, target_phrase: "delve into", replace_with: "explore / look into", penalty_weight: 4.5, matches_count: 12 },
            { id: 2, target_phrase: "not only... but also", replace_with: "both", penalty_weight: 2.1, matches_count: 5 },
            { id: 3, target_phrase: "testament to", replace_with: "shows", penalty_weight: 3.8, matches_count: 8 }
          ]);
        } else if (queryClean.startsWith("select count(*)")) {
          const drafts = getDraftsFromLocal();
          setQueryResult([{ "count(*)": drafts.length }]);
        } else if (queryClean.startsWith("insert") || queryClean.startsWith("update") || queryClean.startsWith("delete")) {
          setQueryResult({ status: "success", rows_affected: 1, message: "DML operation processed successfully (committed transaction)." });
          setDbLogs(prev => [
            ...prev,
            { timestamp: getTimestamp(), type: "aurora", message: "Transaction COMMITTED. Writing WAL (write-ahead log) block." }
          ]);
        } else {
          // generic help or error
          setQueryError(`SQL Error: Relation "${queryClean.split(" ")[2] || "unknown"}" does not exist. Try "SELECT * FROM outreach_drafts;" or "SELECT * FROM users;"`);
        }
      } catch (err: any) {
        setQueryError(err.message || "An unexpected error occurred during database compilation.");
      }
    }, 450);
  };

  // DynamoDB Scan query simulator
  const handleDynamoScan = () => {
    setIsRunning(true);
    // Add log
    setDbLogs(prev => [
      ...prev,
      { timestamp: getTimestamp(), type: "dynamodb", message: "Scan request initiated on table: twin-memory-table" }
    ]);

    setTimeout(() => {
      setIsRunning(false);
      const items = [
        { uid: "twin-user-current", timestamp: Date.now() - 5000, event_type: "keystroke_batch", wpm_reading: 94, source: "ColdOutreachEngine", data_size_bytes: 412 },
        { uid: "twin-user-current", timestamp: Date.now() - 15000, event_type: "humanizer_run", text_length: 1205, flags_count: 3, score: "92%" },
        { uid: "twin-user-current", timestamp: Date.now() - 45000, event_type: "orb_touch", state_transition: "Pondering", duration_ms: 1200 },
        { uid: "twin-user-current", timestamp: Date.now() - 120000, event_type: "autosave_trigger", changed_fields: ["subject", "body"], status: "synced_local" },
        { uid: "twin-user-current", timestamp: Date.now() - 300000, event_type: "model_inference", latency_sec: 1.64, prompt_tokens: 890, completion_tokens: 310 }
      ];

      if (ddbFilterKey) {
        const filtered = items.filter(item => 
          item.event_type.toLowerCase().includes(ddbFilterKey.toLowerCase())
        );
        setDdbResult(filtered);
      } else {
        setDdbResult(items);
      }
    }, 300);
  };

  // Inject random live metric spike or query log
  const handleForceLog = () => {
    const logs = [
      { type: "aurora" as const, message: "VACUUM ANALYZE completed on table outreach_drafts (reclaimed 4kb index slots)" },
      { type: "dynamodb" as const, message: "PROVISIONED CAPACITY ADJUSTMENT: auto-scaled write capacity units to 12" },
      { type: "system" as const, message: "HEALTH CHECK: RDS cluster replica node replica-01 fully synchronized." }
    ];
    const item = logs[Math.floor(Math.random() * logs.length)];
    setDbLogs(prev => [...prev, { timestamp: getTimestamp(), ...item }]);
    
    // Spike CPU briefly
    setCpuUtil(78.4);
    setTimeout(() => setCpuUtil(14.8), 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative flex flex-col w-full max-w-6xl h-[85vh] bg-[#0A0F1E] border border-white/10 rounded-2xl overflow-hidden shadow-2xl font-sans">
        
        {/* CONSOLE HEADER (AWS Style Visuals) */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#11192E] border-b border-white/10 text-white select-none">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-[#FF9900]/10 border border-[#FF9900]/30 text-[#FF9900]">
              <Database className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold tracking-wider text-[#FF9900]">AWS CONSOLE</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20 font-mono">
                  LIVE DB SIMULATOR
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-200">Workspace Database Console</h3>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Region Selector */}
            <div className="hidden sm:flex items-center space-x-2">
              <span className="text-[11px] text-slate-400 font-mono font-medium">Region:</span>
              <select 
                value={selectedRegion} 
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-[#050810]/60 border border-white/10 text-slate-200 text-xs px-2 py-1 rounded font-mono outline-none cursor-pointer focus:border-[#FF9900]/50"
              >
                <option value="us-east-1">N. Virginia (us-east-1)</option>
                <option value="ap-northeast-1">Tokyo (ap-northeast-1)</option>
                <option value="eu-west-1">Ireland (eu-west-1)</option>
                <option value="us-west-2">Oregon (us-west-2)</option>
              </select>
            </div>

            {/* Close Button */}
            <button 
              onClick={onClose} 
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* WORKSPACE NAV-BAR FOR DATABASES */}
        <div className="flex items-center justify-between px-6 py-2 bg-[#0A1224] border-b border-white/5">
          <div className="flex items-center space-x-6 text-sm">
            <button 
              onClick={() => setActiveService("rds")}
              className={`flex items-center space-x-2 py-2 border-b-2 font-mono text-xs font-bold transition-all ${
                activeService === "rds" 
                  ? "border-[#FF9900] text-white" 
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#FF9900]" />
              <span>RDS (Aurora PostgreSQL)</span>
            </button>

            <button 
              onClick={() => setActiveService("dynamodb")}
              className={`flex items-center space-x-2 py-2 border-b-2 font-mono text-xs font-bold transition-all ${
                activeService === "dynamodb" 
                  ? "border-[#FF9900] text-white" 
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>DynamoDB (High-Throughput NoSQL)</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-mono">Cluster Status: Healthy</span>
          </div>
        </div>

        {/* MAIN BODY AREA */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          
          {/* COLUMN 1: INTERACTIVE SERVICE TERMINAL / QUERY WORKSPACE */}
          <div className="flex-1 flex flex-col p-6 overflow-y-auto border-r border-white/5">
            {activeService === "rds" ? (
              <div className="flex flex-col flex-1 space-y-6">
                <div>
                  <h4 className="text-xs font-mono font-bold tracking-wider text-[#FF9900] uppercase">
                    Aurora Global Database Setup
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    A PostgreSQL cluster provisioned with millisecond read replicas. The schema contains relational user details, saved drafts, and cognitive training metadata.
                  </p>
                </div>

                {/* METRICS ROW */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-3 bg-[#0D1527] border border-white/5 rounded-xl">
                    <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
                      <span>CPU UTILIZATION</span>
                      <Cpu className="w-3.5 h-3.5 text-orange-400" />
                    </div>
                    <div className="text-lg font-mono font-bold text-white mt-1">
                      {cpuUtil}%
                    </div>
                    <div className="flex items-center space-x-1 mt-1.5 h-3">
                      {metricHistory.map((m, i) => (
                        <div 
                          key={i} 
                          className="flex-1 rounded-sm bg-orange-500/20" 
                          style={{ height: `${Math.min(100, Math.max(20, m * 1.5))}%` }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-[#0D1527] border border-white/5 rounded-xl">
                    <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
                      <span>DB CONNECTIONS</span>
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <div className="text-lg font-mono font-bold text-white mt-1">
                      {connections} / 100
                    </div>
                    <span className="text-[9px] text-emerald-400 font-mono mt-2 block">
                      Active Pool Normal
                    </span>
                  </div>

                  <div className="p-3 bg-[#0D1527] border border-white/5 rounded-xl">
                    <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
                      <span>READ/WRITE LATENCY</span>
                      <Activity className="w-3.5 h-3.5 text-teal-400" />
                    </div>
                    <div className="text-lg font-mono font-bold text-white mt-1">
                      {latency} ms
                    </div>
                    <span className="text-[9px] text-teal-400 font-mono mt-2 block">
                      SSD Cache Hit: 99.4%
                    </span>
                  </div>

                  <div className="p-3 bg-[#0D1527] border border-white/5 rounded-xl">
                    <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
                      <span>STORAGE USAGE</span>
                      <Database className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <div className="text-lg font-mono font-bold text-white mt-1">
                      {storageUsed} GB
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono mt-2 block">
                      Auto-scaling enabled
                    </span>
                  </div>
                </div>

                {/* INTERACTIVE SQL QUERY TOOL */}
                <div className="flex-1 flex flex-col p-4 bg-[#050810] border border-white/5 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-300">
                      <Terminal className="w-3.5 h-3.5 text-[#FF9900]" />
                      <span>PostgreSQL Query Worksheet</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Host: aurora-pg-twin-cluster.internal
                    </span>
                  </div>

                  {/* PRESET QUERY PILLS */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <button 
                      onClick={() => setQueryInput("SELECT * FROM outreach_drafts ORDER BY id DESC;")}
                      className="text-[10px] font-mono px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded border border-white/5 transition-all"
                    >
                      📑 Query Drafts Table
                    </button>
                    <button 
                      onClick={() => setQueryInput("SELECT * FROM users WHERE uid = 'twin-user-current';")}
                      className="text-[10px] font-mono px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded border border-white/5 transition-all"
                    >
                      👤 Query Active User
                    </button>
                    <button 
                      onClick={() => setQueryInput("SELECT * FROM humanizer_rules;")}
                      className="text-[10px] font-mono px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded border border-white/5 transition-all"
                    >
                      🛡️ Query Humanizer Rules
                    </button>
                  </div>

                  {/* TEXTAREA INPUT */}
                  <div className="relative flex-1 min-h-[100px] flex flex-col">
                    <textarea 
                      value={queryInput}
                      onChange={(e) => setQueryInput(e.target.value)}
                      className="flex-1 bg-[#090D1A] border border-white/10 text-slate-200 font-mono text-xs p-3 rounded-lg outline-none focus:border-[#FF9900]/50 resize-none"
                      placeholder="Enter PostgreSQL SQL query..."
                    />
                    <button 
                      onClick={handleExecuteQuery}
                      disabled={isRunning}
                      className="absolute bottom-3 right-3 inline-flex items-center space-x-1 px-4 py-1.5 bg-[#FF9900] hover:bg-[#E08500] text-white rounded font-mono font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {isRunning ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Play className="w-3.5 h-3.5" />
                      )}
                      <span>{isRunning ? "RUNNING..." : "RUN QUERY"}</span>
                    </button>
                  </div>

                  {/* QUERY RESULTS CONTAINER */}
                  <div className="mt-4 flex-1 flex flex-col min-h-[160px] bg-[#070A14] border border-white/5 rounded-lg overflow-hidden">
                    <div className="px-3 py-1.5 bg-white/5 border-b border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>Console Output / Query Results</span>
                      {queryResult && <span>{Array.isArray(queryResult) ? `${queryResult.length} row(s) returned` : "Transaction OK"}</span>}
                    </div>

                    <div className="p-3 flex-1 overflow-auto text-xs font-mono">
                      {isRunning ? (
                        <div className="flex items-center space-x-2 text-slate-400 py-4 justify-center">
                          <RefreshCw className="w-4 h-4 animate-spin text-[#FF9900]" />
                          <span>Executing query plan, scanning B-Tree indexes...</span>
                        </div>
                      ) : queryError ? (
                        <div className="p-2 border border-red-500/20 bg-red-500/5 text-red-400 rounded-lg whitespace-pre-wrap flex items-start space-x-2">
                          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{queryError}</span>
                        </div>
                      ) : queryResult ? (
                        <div className="overflow-x-auto">
                          {Array.isArray(queryResult) ? (
                            <table className="w-full text-left border-collapse min-w-[500px]">
                              <thead>
                                <tr className="border-b border-white/10 text-slate-400 text-[10px]">
                                  {Object.keys(queryResult[0] || {}).map((col) => (
                                    <th key={col} className="pb-2 pr-4">{col}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {queryResult.map((row, idx) => (
                                  <tr key={idx} className="border-b border-white/5 hover:bg-white/5 text-slate-300">
                                    {Object.values(row).map((val: any, vidx) => (
                                      <td key={vidx} className="py-2 pr-4 max-w-[200px] truncate" title={String(val)}>
                                        {typeof val === "object" ? JSON.stringify(val) : String(val)}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <pre className="text-emerald-400">{JSON.stringify(queryResult, null, 2)}</pre>
                          )}
                        </div>
                      ) : (
                        <div className="text-slate-500 italic flex items-center justify-center py-8">
                          No query has been executed yet. Click a preset query pill or hit 'RUN QUERY'.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* DYNAMODB CONTENT */
              <div className="flex flex-col flex-1 space-y-6">
                <div>
                  <h4 className="text-xs font-mono font-bold tracking-wider text-[#00E5FF] uppercase">
                    Amazon DynamoDB Document Table
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    A fully-managed, high-throughput NoSQL table used for raw keystroke telemetry, autosave checkpoint history, and real-time inference log auditing. No schema limits.
                  </p>
                </div>

                <div className="p-4 bg-[#0D1527] border border-white/5 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono block">TABLE NAME</span>
                    <span className="text-sm font-bold font-mono text-white">twin-memory-table</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono block">PARTITION KEY</span>
                    <span className="text-sm font-semibold font-mono text-[#00E5FF]">uid (String)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono block">SORT KEY</span>
                    <span className="text-sm font-semibold font-mono text-[#00E5FF]">timestamp (Number)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono block">PROVISIONED CAPACITY</span>
                    <span className="text-sm font-bold font-mono text-emerald-400">On-Demand Auto</span>
                  </div>
                </div>

                {/* DYNAMODB SCAN / ITEM MANAGER */}
                <div className="flex-1 flex flex-col p-4 bg-[#050810] border border-white/5 rounded-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-300">
                      <Grid className="w-3.5 h-3.5 text-[#00E5FF]" />
                      <span>DynamoDB Scan / Item Explorer</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
                        <input 
                          type="text"
                          value={ddbFilterKey}
                          onChange={(e) => setDdbFilterKey(e.target.value)}
                          placeholder="Filter event_type..."
                          className="bg-[#090D1A] border border-white/10 text-slate-200 font-mono text-[10px] pl-8 pr-3 py-1 rounded outline-none focus:border-[#00E5FF]/50"
                        />
                      </div>
                      <button 
                        onClick={handleDynamoScan}
                        className="inline-flex items-center space-x-1 px-3 py-1 bg-[#00E5FF]/20 hover:bg-[#00E5FF]/30 text-[#00E5FF] border border-[#00E5FF]/30 rounded font-mono font-bold text-xs transition-all cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>SCAN TABLE</span>
                      </button>
                    </div>
                  </div>

                  {/* TABLE VIEW */}
                  <div className="flex-1 min-h-[220px] bg-[#070A14] border border-white/5 rounded-lg overflow-y-auto">
                    {ddbResult.length > 0 ? (
                      <div className="divide-y divide-white/5">
                        {ddbResult.map((item, index) => (
                          <div key={index} className="p-3 hover:bg-white/5 transition-all text-xs font-mono">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                              <span className="text-[#00E5FF] font-bold">
                                event: {item.event_type}
                              </span>
                              <span className="text-slate-500 text-[10px]">
                                timestamp: {new Date(item.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <pre className="text-[11px] text-slate-400 overflow-x-auto max-w-full bg-[#050810]/40 p-2 rounded mt-1">
                              {JSON.stringify(item, null, 2)}
                            </pre>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                        <Grid className="w-8 h-8 text-slate-600 mb-2 animate-bounce" />
                        <p className="text-xs italic">No items retrieved.</p>
                        <button 
                          onClick={handleDynamoScan}
                          className="text-[11px] text-[#00E5FF] hover:underline font-mono mt-1"
                        >
                          Run initial scan action
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* COLUMN 2: LIVE RESOURCE TRANSACTION STREAM (REAL-TIME LOGS) */}
          <div className="w-full md:w-[320px] bg-[#070A15] p-4 flex flex-col justify-between overflow-hidden">
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
                <span className="text-xs font-mono font-bold text-slate-300 flex items-center space-x-2">
                  <Terminal className="w-3.5 h-3.5 text-teal-400" />
                  <span>Transaction Stream</span>
                </span>
                <span className="px-1.5 py-0.5 bg-teal-500/10 text-teal-400 text-[9px] rounded font-mono font-bold border border-teal-500/20">
                  REAL-TIME
                </span>
              </div>

              {/* LIVE STREAM LIST */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-[11px] font-mono scrollbar-thin">
                {dbLogs.map((log, index) => (
                  <div key={index} className="flex flex-col space-y-1 p-2 bg-white/5 rounded border border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                      <span className={`text-[8px] uppercase font-bold px-1 rounded ${
                        log.type === "aurora" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                        log.type === "dynamodb" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                        "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                      }`}>
                        {log.type}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-normal break-all">
                      {log.message}
                    </p>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </div>

            {/* LOWER CONTROLS */}
            <div className="pt-4 border-t border-white/5 space-y-3">
              <button 
                onClick={handleForceLog}
                className="w-full inline-flex items-center justify-center space-x-2 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded border border-white/10 font-mono text-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-teal-400" />
                <span>Inject Query Heartbeat</span>
              </button>

              <div className="p-3 bg-slate-900/40 rounded-xl border border-white/5">
                <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400 mb-1">
                  <Lock className="w-3 h-3 text-[#FF9900]" />
                  <span>Security & Compliance</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  All write-ahead logs and DynamoDB document frames are secured via AES-256 with key management keys fully automated.
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* BOTTOM STATUS BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-2.5 bg-[#050810] border-t border-white/10 text-[10px] font-mono text-slate-400 select-none">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-300">AWS SDK Active:</span>
              <span className="text-emerald-400">@aws-sdk/client-rds-data v3.x</span>
            </span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="hidden sm:inline">User Affinity: gemini-3.5-flash</span>
          </div>

          <div className="mt-1 sm:mt-0 flex items-center space-x-3">
            <span>Powered by yashwithanadakuduru8@gmail.com</span>
            <button 
              onClick={() => {
                if (onActivateTwin) {
                  onClose();
                  onActivateTwin();
                }
              }}
              className="text-[#00E5FF] hover:underline flex items-center space-x-0.5"
            >
              <span>Activate Twin</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
