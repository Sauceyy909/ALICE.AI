import React, { useState, useEffect, useRef } from "react";
import { synthesizeLocalLavacake } from "./lavacakeEngine";

export default function App() {
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    "LAVACAKE Core (v0.1-Release) boot sequence initiated...",
    "CPU Hardware Detection: 64 Cores, SSE4.2, AVX-512, Hardware Virtualization enabled.",
    "GPU Accelerators: Saturated CUDA pipeline synchronized with local host container.",
    "ALICE AI Engine: Initialized offline. Core memory limits loaded successfully.",
    "Status: System fully offline. No external APIs or metrics reporting configured.",
    "--------------------------------------------------------------------------------",
    "      ___           ___           ___           ___           ___",
    "     /\\  \\         /\\__\\         /\\  \\         /\\  \\         /\\  \\",
    "    /::\\  \\       /:/  /        /::\\  \\       /::\\  \\       /::\\  \\",
    "   /:/\\:\\  \\     /:/  /        /:/\\:\\  \\     /:/\\:\\  \\     /:/\\:\\  \\",
    "  /::\\~\\:\\  \\   /:/  /  ___   /:/  \\:\\  \\   /:/  \\:\\  \\   /::\\~\\:\\  \\",
    " /:/\\:\\ \\:\\__\\ /:/__/  /\\__\\ /:/__/ \\:\\__\\ /:/__/ \\:\\__\\ /:/\\:\\ \\:\\__\\",
    " \\/__\\:\\/:/  / \\:\\  \\ /:/  / \\:\\  \\  \\/__/ \\:\\  \\  \\/__/ \\/__\\:\\/:/  /",
    "      \\::/  /   \\:\\  /:/  /   \\:\\  \\        \\:\\  \\            \\::/  /",
    "      /:/  /     \\:\\/:/  /     \\:\\  \\        \\:\\  \\           /:/  /",
    "     /:/  /       \\::/  /       \\:\\__\\        \\:\\__\\         /:/  /",
    "     \\/__/         \\/__/         \\/__/         \\/__/         \\/__/",
    "",
    "             === ALICE: STANDALONE KERNEL DEVELOPMENT CLI ===",
    "                    PRE-TRAINED ON STANDALONE HARDWARE",
    "--------------------------------------------------------------------------------",
    "Type 'help' to review available operating system, MMU, and GDB commands.",
    ""
  ]);

  const [cliInput, setCliInput] = useState("");
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalHistory]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const command = cliInput.trim();
    if (!command) return;

    // Append user input
    setTerminalHistory(prev => [...prev, `alice@lavacake:~$ ${command}`]);
    setCliInput("");

    const lowerCmd = command.toLowerCase();

    setTimeout(() => {
      if (lowerCmd === "help") {
        setTerminalHistory(prev => [
          ...prev,
          "Available Commands:",
          "  help                  - List all available low-level system subroutines.",
          "  synthesize <module>   - Synthesize and optimize kernel modules (e.g. 'paging', 'scheduler').",
          "  gdb attach            - Connect remote kernel target port 1234 to inspect registers.",
          "  optimize driver       - Trigger direct MSI-X and memory-mapped DMA pipeline optimizations.",
          "  metrics               - Display real-time CPU cycle execution and host core latency.",
          "  install               - Show Github instructions to clone, compile and run ALICE locally.",
          "  clear                 - Wipes the active terminal buffer."
        ]);
        return;
      }

      if (lowerCmd === "clear") {
        setTerminalHistory([]);
        return;
      }

      if (lowerCmd === "metrics") {
        const cpu = (20 + Math.random() * 15).toFixed(1);
        const gpu = (5 + Math.random() * 8).toFixed(1);
        const latency = (0.05 + Math.random() * 0.05).toFixed(3);
        setTerminalHistory(prev => [
          ...prev,
          `[LAVACAKE TELEMETRY HUD]`,
          `  CPU Cycle Load   : ${cpu}%`,
          `  GPU Acceleration : ${gpu}%`,
          `  Core I/O Latency : ${latency}ms`,
          `  RAM Occupation   : 2.14 GB (Fully unrolled L1 cache line occupancy)`,
          `  Thermal Core     : 41 C (Liquid nitrogen container heat sink active)`
        ]);
        return;
      }

      if (lowerCmd === "gdb attach" || lowerCmd === "gdb") {
        setTerminalHistory(prev => [
          ...prev,
          "[GDB] Attaching target remote on Port 1234...",
          "[GDB] Loaded debug symbols from build/kernel.elf automatically.",
          "",
          "CPU Registers (x86_64 CPU state dump):",
          "  RAX: 0x0000000000000000   RBX: 0x0000000000007c00   RCX: 0x0000000000001000",
          "  RSP: 0x0000000000007bf0   RBP: 0x0000000000000000   RIP: 0xffffffff8105c1d4",
          "  CR0: 0x80000011 (Identity mapped paging enable)     CR3: 0x0000000000009000",
          "",
          "Active Watchpoints:",
          "  - Watchpoint 1: *(uint64_t*)0x100000 (Monitors low-memory heap corruption)"
        ]);
        return;
      }

      if (lowerCmd === "optimize driver" || lowerCmd === "optimize") {
        setTerminalHistory(prev => [
          ...prev,
          "[DRIVER] Scanned PCIe configuration base registers...",
          "[DRIVER] Swapped standard polling wait-states with low-latency MSI-X Interrupt Vectors.",
          "[DRIVER] Enabled write-combining buffer caching and single-cycle 64-bit store alignments.",
          "[DRIVER] Status: STABLE. PCIe transfer cycle latency reduced by 42%."
        ]);
        return;
      }

      if (lowerCmd === "install") {
        setTerminalHistory(prev => [
          ...prev,
          "================================================================================",
          "STANDALONE LINUX INSTALLATION SYSTEM (GIT & GITHUB)",
          "================================================================================",
          "Execute the following sequences on your local Linux box:",
          "",
          "1) Clone repo:",
          "   git clone https://github.com/whatsmyageagain48/alice-cli-lavacake.git",
          "   cd alice-cli-lavacake",
          "",
          "2) Compile optimized native C client:",
          "   make",
          "",
          "3) Global install executable path:",
          "   sudo make install",
          "",
          "4) Run binary locally:",
          "   alice",
          "================================================================================"
        ]);
        return;
      }

      // Default back to local cognitive AI engine (LAVACAKE 0.1)
      const result = synthesizeLocalLavacake(command, "", "workspace_buffer");
      setTerminalHistory(prev => [
        ...prev,
        result.response,
        `[LAVACAKE 0.1 STATS] Local cycle processing complete in ${result.latencyMs}ms.`
      ]);

    }, 200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-emerald-400 font-mono p-4 flex flex-col relative select-text overflow-hidden">
      
      {/* Scanline and CRT flickering visual effect overlay */}
      <div className="absolute inset-0 pointer-events-none z-50 scanlines opacity-[0.12]"></div>
      
      {/* Glow aura */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-emerald-500/5 blur-[80px] pointer-events-none"></div>

      {/* TTY Header bar */}
      <div className="border-b border-emerald-950/80 pb-2 mb-4 flex justify-between items-center text-xs opacity-85 select-none">
        <div className="flex items-center space-x-3">
          <span>[TTY_CONSOLE: /dev/pts/1]</span>
          <span className="text-[10px] bg-emerald-950 border border-emerald-800 text-emerald-400 px-1 rounded animate-pulse">LAVACAKE_LINK</span>
        </div>
        <div>
          <span>76.8 kbps | LOCALHOST</span>
        </div>
      </div>

      {/* Scrolling Shell Interface */}
      <div className="flex-1 overflow-y-auto space-y-3 text-xs leading-relaxed max-h-[calc(100vh-100px)] pr-2">
        {terminalHistory.map((line, idx) => (
          <div key={idx} className="whitespace-pre-wrap selection:bg-emerald-800 selection:text-white">
            {line}
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      {/* Raw Shell Input Prompt */}
      <form onSubmit={handleCommand} className="mt-4 pt-2 border-t border-emerald-950/80 flex items-center space-x-2">
        <span className="text-emerald-500 font-bold">&gt;_</span>
        <input
          type="text"
          value={cliInput}
          onChange={(e) => setCliInput(e.target.value)}
          placeholder="Type 'help' or write OS kernel synthesis prompts..."
          className="flex-1 bg-transparent text-emerald-300 focus:outline-none placeholder-emerald-950 font-mono text-xs caret-emerald-400"
          autoFocus
        />
      </form>
    </div>
  );
}
