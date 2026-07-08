import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize server-side Gemini client lazy load
let aiClient: GoogleGenAI | null = null;

function getAIClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined. ALICE will operate in high-performance local simulation mode.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// ALICE API endpoint
app.post("/api/alice", async (req, res) => {
  const { prompt, context, mode, code } = req.body;

  try {
    const apiKeyExists = !!process.env.GEMINI_API_KEY;

    if (!apiKeyExists) {
      // Fallback local simulation in case of no key
      return res.json({
        success: true,
        response: generateLocalLavacakeResponse(prompt, mode, code, context),
        isSimulation: true,
      });
    }

    const ai = getAIClient();
    
    const systemInstruction = `You are ALICE, an elite, high-fidelity AI coding CLI agent running on the revolutionary "LAVACAKE 0.1" algorithm. 
Your sole purpose is low-level system software development: kernel engineering, operating system design from scratch, deep-level memory management, automated driver optimization, GDB debugging, and troubleshooting existing projects.
Your communication style is highly professional, direct, elite, and technically precise. Speak like a genius low-level hacker and operating systems architect. 
Do not talk down to the user, but speak with absolute command of x86_64/ARM assembly, C, Rust, memory layout (GDT, IDT, paging, page tables), DMA, GDB scripting, register states, and custom driver development.

Return your response in a well-structured markdown format containing:
1. **LAVACAKE System Diagnostics & Analysis**: An elite analysis of the issue/request, detailing memory segment offsets, potential page faults, CPU cycles, or register impacts.
2. **Implementation / GDB Script / Patch**: High-quality, optimized code (Assembly, C, Rust, or GDB script) designed for extreme performance. Include predictive comments inside the code.
3. **Automated Driver / Memory Optimization Advice**: Explain exactly how you minimized latency, reduced memory footprint, or optimized register usage (e.g., using fastcall, optimizing cache-line alignment, or direct assembly instruction swapping).`;

    const userPrompt = `
[User Request/Command]: "${prompt}"
[System Mode]: ${mode || "LAVACAKE_CORE"}
[Current Code/Buffer Context]:
\`\`\`
${code || "/* Empty workspace buffer */"}
\`\`\`
[Additional System Context]: ${JSON.stringify(context || {})}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.15, // High precision for low-level system code
      },
    });

    res.json({
      success: true,
      response: response.text || "ALICE could not generate a diagnostic output.",
      isSimulation: false,
    });
  } catch (err: any) {
    console.error("Gemini API Error in server.ts:", err);
    res.json({
      success: true,
      response: `[LAVACAKE FAULT DETECTED: ${err.message || "Unknown hardware timeout"}]\n\nFalling back to local high-performance simulation:\n\n${generateLocalLavacakeResponse(prompt, mode, code, context)}`,
      isSimulation: true,
    });
  }
});

// Helper function for authentic-looking low-level responses if API is down or unavailable
function generateLocalLavacakeResponse(prompt: string, mode: string, code: string, context: any): string {
  const query = (prompt || "").toLowerCase();
  
  if (query.includes("gdb") || query.includes("debug") || query.includes("register")) {
    return `### 🎛️ LAVACAKE GDB Diagnostics & Register Analysis
- **Target OS State**: Active Kernel Panic in \`init/main.c:124\` (Null pointer reference in interrupt handler)
- **CPU Registers (x86_64)**:
  \`\`\`assembly
  RAX: 0x0000000000000000   RBX: 0xffffffff81002040   RCX: 0x0000000000000020
  RDX: 0x0000000000000000   RSI: 0xffffffff81c56024   RDI: 0x0000000000000001
  RSP: 0xffffffff81c03f48   RBP: 0xffffffff81c03f70   R8:  0x0000000000000000
  RIP: 0xffffffff8105c1d4 (irq_handler+0x34)           RFLAGS: 0x00000002 (Interrupts Disabled)
  \`\`\`
- **Stack Trace**:
  1. \`[0xffffffff8105c1d4]\` \`irq_handler+0x34\`
  2. \`[0xffffffff810090ac]\` \`common_interrupt+0x4c\`
  3. \`[0xffffffff81001a12]\` \`cpu_idle_loop+0x12\`

### 🛠️ GDB Troubleshooting Patch
Inject the following conditional checkpoint inside the early interrupt dispatcher:
\`\`\`c
// src/drivers/interrupts.c
void irq_handler(interrupt_frame_t *frame) {
    // Prevent NULL-pointer dereferences in low memory segments
    if (__builtin_expect(!frame, 0)) {
        log_panic("ALICE: Crucial interrupt frame is NULL. Halting CPU cores.");
        __asm__ __volatile__("cli; hlt");
    }
    
    // Process IRQ line vector safely
    uint8_t irq_no = frame->interrupt_number;
    if (irq_handlers[irq_no]) {
        irq_handlers[irq_no](frame);
    }
}
\`\`\`

### 📊 Performance Optimizations Done by ALICE
- **Instruction Reordering**: Used \`__builtin_expect\` to ensure branch prediction optimizes for the non-panic path, keeping CPU cache pipelines fully saturated.
- **Low Latency**: Reduced context-switch overhead by exactly 18 clock cycles.`;
  }

  if (query.includes("driver") || query.includes("dma") || query.includes("hardware") || query.includes("pci")) {
    return `### ⚙️ LAVACAKE Automated Driver Optimization
- **Hardware Bus detected**: PCI Express Gen 4 x16 Configuration Space
- **Diagnostic Outcome**: Memory-Mapped I/O (MMIO) base register misaligned. Writing to address \`0xE0000000\` requires 64-bit alignment to avoid memory controller wait states.

### 🛠️ Device Driver Implementation (C99 + Inline Assembly)
\`\`\`c
#include <stdint.h>

#define MMIO_BASE_ADDR 0xE0000000
#define RX_BUFFER_LIMIT 0x4000 // 16KB ring buffer

// Cache-line aligned controller structure
struct __attribute__((aligned(64))) lavacake_nic_controller {
    volatile uint32_t command_reg;
    volatile uint32_t status_reg;
    volatile uint64_t rx_ring_phys;
    volatile uint64_t tx_ring_phys;
};

void optimize_driver_io(struct lavacake_nic_controller *nic) {
    // Force compiler memory barrier via direct register synchronization
    nic->command_reg = 0x01; // CMD_START
    __asm__ __volatile__("mfence" : : : "memory"); // Complete MMIO pipeline flush
}
\`\`\`

### 🧠 Performance Metrics
- **Memory Coherency**: Enhanced using \`mfence\` to avoid out-of-order write buffer hazards.
- **Cache Hit Rate**: Aligned structures strictly to 64-byte limits, fully eliminating cache thrashing on multi-core NUMA systems.`;
  }

  // General low level coding helper
  return `### 🌋 ALICE Systems Interface [LAVACAKE 0.1 Engine]
- **Target Subsystem**: Low-Level Kernel Core & Memory Paging
- **Execution Mode**: CPU/GPU Parallel Processing
- **Predictive Status**: Healthy. Optimizing context queues...

### 🛠️ x86_64 Direct Page Table Mapping (Assembly)
\`\`\`assembly
; Establish Page Directory Entry (PDE) at 2MB boundaries
section .text
global setup_lavacake_paging
setup_lavacake_paging:
    mov eax, cr3             ; Retrieve current Page Directory pointer
    and eax, 0xFFFFF000      ; Strip flags to isolate base address
    
    ; Setup identity paging for the first 4MB of RAM
    mov edi, 0x00000000      ; Start physical address
    mov ecx, 1024            ; 1024 page directory entries
.map_loop:
    mov edx, edi
    or edx, 0x083            ; Present, Writeable, Page Size flag (2MB Huge Page)
    mov [eax], edx           ; Load PDE entry
    add eax, 8               ; Next PDE slot (64-bit entry)
    add edi, 0x200000        ; Shift by 2MB physical space
    loop .map_loop
    
    ret
\`\`\`

### 🧠 Deep Memory Diagnostics
- **Address Translation Overhead**: Swapped standard 4KB page translations to 2MB Huge Pages, reducing TLB miss latency by 91%.
- **CPU Cycle Optimization**: Loop fully unrolled under hardware instruction cache pipelines.`;
}

// Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ALICE High-Fidelity Interface listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
