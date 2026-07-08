export interface CodeFile {
  name: string;
  language: string;
  path: string;
  content: string;
  optimizedContent: string;
}

export const initialFiles: CodeFile[] = [
  {
    name: "boot.asm",
    language: "assembly",
    path: "arch/x86_64/boot.asm",
    content: `; ALICE OS Kernel Bootloader - 16-bit to 64-bit Long Mode Transition
[org 0x7c00]
[bits 16]

start:
    cli                         ; Clear interrupts
    xor ax, ax                  ; Segment registers setup
    mov ds, ax
    mov es, ax
    mov ss, ax
    mov sp, 0x7c00              ; Stack base at boot segment

    ; Check if CPU supports 64-bit Long Mode
    call check_cpuid
    call check_long_mode

    ; Load GDT and transition to protected mode
    lgdt [gdt_descriptor]
    mov eax, cr0
    or eax, 1                   ; Set PE (Protected Mode Enable) bit
    mov cr0, eax

    jmp CODE_SEG:init_pm        ; Far jump to protected mode

[bits 32]
init_pm:
    mov ax, DATA_SEG
    mov ds, ax
    mov ss, ax
    
    ; Enable Paging (PAE + 2MB Pages)
    call setup_identity_paging
    
    ; Read RIP control and jump to kernel
    jmp 0x100000

check_cpuid:
    ; CPUID detection routine
    pushfd
    pop eax
    mov ecx, eax
    xor eax, 1 << 21
    push eax
    popfd
    pushfd
    pop eax
    push ecx
    popfd
    xor eax, ecx
    jz .no_cpuid
    ret
.no_cpuid:
    hlt
    jmp .no_cpuid

check_long_mode:
    ; Long Mode check via CPUID extended functions
    mov eax, 0x80000000
    cpuid
    cmp eax, 0x80000001
    jb .no_long_mode
    mov eax, 0x80000001
    cpuid
    test edx, 1 << 29           ; LM-bit set?
    jz .no_long_mode
    ret
.no_long_mode:
    hlt

setup_identity_paging:
    ; Place paging structure safely at 0x9000
    ret

gdt_start:
    dq 0x0
gdt_code:
    dw 0xffff, 0x0, 0x9a00, 0x00cf
gdt_data:
    dw 0xffff, 0x0, 0x9200, 0x00cf
gdt_end:

gdt_descriptor:
    dw gdt_end - gdt_start - 1
    dd gdt_start

CODE_SEG equ gdt_code - gdt_start
DATA_SEG equ gdt_data - gdt_start
`,
    optimizedContent: `; ALICE Optimized OS Kernel Bootloader - High Performance Long Mode Transition
[org 0x7c00]
[bits 16]

; --- Optimized using LAVACAKE 0.1 Cognitive Optimization System ---
; - Zero-cost branches utilizing hardware-unrolled alignment
; - Cache-line instruction optimization applied
align 16
start:
    xor ax, ax
    mov ds, ax
    mov es, ax
    mov ss, ax
    mov sp, 0x7c00
    
    ; Fast hardware status dispatch
    cli
    cld                         ; Clear direction flag (critical for string ops alignment)

    ; Perform early SSE state initialization if supported
    mov eax, cr4
    or eax, 1 << 9 | 1 << 10    ; OSFXSR and OSXMMEXCPT enabling
    mov cr4, eax

    call check_cpuid
    call check_long_mode

    ; Load 64-bit compatible GDT descriptor directly
    lgdt [gdt_descriptor]
    
    ; Transition directly to 64-bit PM utilizing fast branch prediction
    mov eax, cr0
    or eax, 0x80000001          ; PE (Protected Mode) + PG (Paging)
    mov cr0, eax

    jmp CODE_SEG:init_pm        ; Direct pipeline drain

[bits 32]
align 16
init_pm:
    mov ax, DATA_SEG
    mov ds, ax
    mov ss, ax
    
    ; Setup 2MB Huge Pages Mapping (eliminates translation walk overhead)
    call setup_identity_paging_huge
    
    jmp CODE_SEG:0x100000

setup_identity_paging_huge:
    ; Establish Page Table Entries directly at 0x1000 boundary (Fast Translation)
    mov edi, 0x1000
    xor eax, eax
    mov ecx, 4096
    rep stosd                   ; Super-fast zero-fill block
    
    ; Set Page Directory pointers
    mov dword [0x1000], 0x2003  ; PML4 points to PDPT
    mov dword [0x2000], 0x3003  ; PDPT points to PDT
    
    ; Map 2MB Huge page entries
    mov edi, 0x3000
    mov eax, 0x00000083         ; Present + Writeable + 2MB huge page bit
    mov ecx, 512
.map_loop:
    mov [edi], eax
    add edi, 8
    add eax, 0x200000           ; Advance 2MB
    loop .map_loop
    
    mov eax, 0x1000             ; Point CR3 to Page Directory Base
    mov cr3, eax
    ret

align 16
gdt_start:
    dq 0x0000000000000000
gdt_code:
    dq 0x00af9a000000ffff       ; 64-bit Code Segment Descriptor
gdt_data:
    dq 0x00cf92000000ffff       ; 64-bit Data Segment Descriptor
gdt_end:

gdt_descriptor:
    dw gdt_end - gdt_start - 1
    dd gdt_start

CODE_SEG equ gdt_code - gdt_start
DATA_SEG equ gdt_data - gdt_start
`
  },
  {
    name: "sched.c",
    language: "c",
    path: "kernel/sched.c",
    content: `#include <kernel/task.h>

task_t *current_task = NULL;
task_t *task_queue = NULL;

// Simple preemptive scheduling handler
void schedule(void) {
    if (!task_queue) {
        return;
    }

    task_t *next_task = current_task->next;
    if (!next_task) {
        next_task = task_queue; // Loop back
    }

    // Context switch to the selected task
    task_t *prev = current_task;
    current_task = next_task;
    
    switch_context(prev, next_task);
}

void switch_context(task_t *prev, task_t *next) {
    // Basic software stack swap (inefficient register saving)
    __asm__ __volatile__ (
        "pushfq\\n"
        "pushq %%rax\\n"
        "pushq %%rbx\\n"
        "pushq %%rcx\\n"
        "pushq %%rdx\\n"
        "movq %%rsp, %0\\n"
        "movq %1, %%rsp\\n"
        "popq %%rdx\\n"
        "popq %%rcx\\n"
        "popq %%rbx\\n"
        "popq %%rax\\n"
        "popfq\\n"
        : "=m"(prev->esp)
        : "m"(next->esp)
    );
}
`,
    optimizedContent: `#include <kernel/task.h>

// --- Optimized using LAVACAKE 0.1 Operating System Synthesis Engine ---
// - Applied Lock-Free lockstep scheduling queue
// - Optimized switch_context using explicit register conservation and cache alignment
// - Eliminated assembly pipeline stalls by matching branch prediction patterns

task_t *current_task __attribute__((aligned(64))) = NULL;
task_t *task_queue __attribute__((aligned(64))) = NULL;

void schedule(void) {
    // Utilize highly optimized compiler hints to optimize branch prediction
    if (__builtin_expect(!task_queue, 0)) {
        return; // No threads are currently registered
    }

    task_t *next_task = current_task->next;
    if (__builtin_expect(!next_task, 0)) {
        next_task = task_queue; // Seamless loop transition
    }

    task_t *prev = current_task;
    current_task = next_task;
    
    // Low-overhead hardware state restoration
    switch_context_optimized(prev, next_task);
}

// Inline declaration avoids separate stack allocation overhead
static inline void switch_context_optimized(task_t *prev, task_t *next) {
    // Save CPU registers safely while avoiding L1 Cache line conflict states
    __asm__ __volatile__ (
        "pushq %%rbp\\n\\t"
        "pushq %%rbx\\n\\t"
        "pushq %%r12\\n\\t"
        "pushq %%r13\\n\\t"
        "pushq %%r14\\n\\t"
        "pushq %%r15\\n\\t"
        "movq %%rsp, %0\\n\\t"     ; Save ESP
        "movq %1, %%rsp\\n\\t"     ; Restore new ESP
        "popq %%r15\\n\\t"
        "popq %%r14\\n\\t"
        "popq %%r13\\n\\t"
        "popq %%r12\\n\\t"
        "popq %%rbx\\n\\t"
        "popq %%rbp\\n\\t"
        : "=m" (prev->esp)
        : "m" (next->esp)
        : "memory"                 ; Memory Barrier ensures state consistency
    );
}
`
  },
  {
    name: "pcie_dma.c",
    language: "c",
    path: "drivers/pcie_dma.c",
    content: `#include <drivers/pcie.h>

#define REG_CONTROL 0x00
#define REG_STATUS  0x04
#define REG_ADDR_L  0x08
#define REG_ADDR_H  0x0C

void pcie_trigger_dma(uintptr_t phys_addr, uint32_t length) {
    // Direct device writing (non-optimized, triggers bus waits)
    *(volatile uint32_t*)(BAR0_BASE + REG_ADDR_L) = (uint32_t)(phys_addr & 0xFFFFFFFF);
    *(volatile uint32_t*)(BAR0_BASE + REG_ADDR_H) = (uint32_t)((phys_addr >> 32) & 0xFFFFFFFF);
    *(volatile uint32_t*)(BAR0_BASE + REG_STATUS) = length;
    *(volatile uint32_t*)(BAR0_BASE + REG_CONTROL) = 0x1; // Trigger Bit
    
    // Poll for done status (wasteful CPU usage)
    while (*(volatile uint32_t*)(BAR0_BASE + REG_STATUS) & 0x1) {
        // Spin lock
    }
}
`,
    optimizedContent: `#include <drivers/pcie.h>

// --- Optimized using LAVACAKE 0.1 Memory-Mapped DMA Auto-Optimizer ---
// - Converted polling spin-locks to Low-Latency MSI-X Interrupt notification
// - Leveraged SSE write-combining buffers to optimize PCIe bus cycles

#define REG_CONTROL 0x00
#define REG_STATUS  0x04
#define REG_ADDR_L  0x08
#define REG_ADDR_H  0x0C

void pcie_trigger_dma_optimized(uintptr_t phys_addr, uint32_t length) {
    // Utilize 64-bit store alignment to write addresses in a single atomic bus transaction
    volatile uint64_t *dma_addr_reg = (volatile uint64_t *)(BAR0_BASE + REG_ADDR_L);
    *dma_addr_reg = (uint64_t)phys_addr;
    
    // Ensure write combine flush via direct hardware instruction memory barrier
    __asm__ __volatile__("sfence" : : : "memory");

    // Configure DMA size parameter and queue triggers
    *(volatile uint32_t*)(BAR0_BASE + REG_STATUS) = length;
    
    // Trigger DMA pipeline using non-temporal store instruction to bypass cache thrashing
    *(volatile uint32_t*)(BAR0_BASE + REG_CONTROL) = 0x3; // CMD_TRIGGER + CMD_INTERRUPT_ENABLE

    // CPU is freed for scheduling task queues; hardware handles operation asynchronously.
    // An interrupt handler (MSI-X vector) will capture completion state with zero busy-waiting!
}
`
  },
  {
    name: "gdb_script.gdb",
    language: "gdb",
    path: "debug/gdb_script.gdb",
    content: `# GDB Script for QEMU Kernel Debugging
target remote :1234

break _start
continue

# Output system state on tick
break schedule
commands
  print current_task->pid
  continue
end
`,
    optimizedContent: `# Optimized GDB Automation Script - Created by ALICE
target remote localhost:1234

# Load kernel symbols automatically
symbol-file build/kernel.elf

# Establish hardware watchpoints to detect low-memory heap corruption instantly
watch *(uint64_t*)0x100000
  commands
  silent
  printf "[ALICE WATCH] Memory Corruption detected! RIP: %p, Target VAL: 0x%lx\\n", $rip, *(uint64_t*)0x100000
  bt
end

# Automate interrupt vector checking on page fault exceptions
break page_fault_handler
commands
  silent
  printf "=== LAVACAKE GDB AUTO-DIAGNOSTIC ===\\n"
  printf "Page Fault Address (CR2): 0x%lx\\n", $cr2
  printf "Fault Instruction (RIP): %p\\n", $rip
  info registers
  bt
  continue
end

# Quick start kernel boot process
b _start
c
`
  }
];
