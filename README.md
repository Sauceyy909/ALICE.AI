# ALICE: The Elite Kernel Developer CLI Agent & Local Dispatcher

ALICE is a high-fidelity, fully interactive command-line agent built from the ground up to synthesize, optimize, and troubleshoot low-level systems software (kernels, drivers, and operating systems) from scratch.

Unlike standard tools, ALICE includes direct system dispatch layers allowing execution of real local system commands with prompt confirmation and full access to read or interact with your local files, directories, and diagnostics—operating entirely off the computer's native hardware.

ALICE operates on the custom, fully local **LAVACAKE 0.1 Cognitive Optimization Engine**—requiring zero external API calls or network requests.

---

## 🛠️ Linux Installation via Git & Github

Deploy the fully standalone, local ALICE terminal interface to your local Linux container or workstation using standard build tools.

### 1. Clone the Repository
```bash
git clone https://github.com/whatsmyageagain48/alice-cli-lavacake.git
cd alice-cli-lavacake
```

### 2. Compile the Binary
ALICE is written in highly optimized, low-latency C. Compile the binary using the provided `Makefile`:
```bash
make
```

### 3. Install Globally
Install the compiled executable globally into your system path:
```bash
sudo make install
```

### 4. Run ALICE Standalone
```bash
alice
```

---

## 🌋 Standalone Native Subroutines

Once running, you can dispatch real operations on your computer's local hardware safely:

- **Local file system inspect**: Use `ls` inside the ALICE terminal to explore workspace files.
- **Display file buffer**: Use `cat <file_name>` to buffer and view any local file content natively.
- **Synthesize local code**: Use `synthesize <file>` to automatically optimize paging loops or C queue routines, writing the results directly back to local file path `optimized_<file>`.
- **Generate GDB configs**: Use `gdb script` to instantly write a ready-to-run `.gdb` remote watchpoint script to disk.
- **Native Diagnostics**: Use `metrics` to read live system CPU load averages (`/proc/loadavg`), hardware specs (`/proc/cpuinfo`), and actual memory allocation (`/proc/meminfo`) from the host container.
- **Local Dispatch Execution**: Use `run <command>` (e.g. `run gcc -o kernel main.c` or `run make`) to compile and trigger real command executions with explicit user confirmation.
