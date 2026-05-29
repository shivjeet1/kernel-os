import React, { useState } from 'react';
import { Terminal, Cpu, Play, ChevronDown } from 'lucide-react';

// --- Components inline to bypass import errors ---

const CodeBlock = ({ code, language = 'bash', filename = '' }) => {
  const [copyState, setCopyState] = useState('Copy');

  const handleCopy = async () => {
    try {
      const cleanCode = code.replace(/^[$#]\s/gm, '');
      await navigator.clipboard.writeText(cleanCode);
      setCopyState('Copied!');
      setTimeout(() => setCopyState('Copy'), 2000);
    } catch (err) {
      console.error("Clipboard API failed.", err);
      setCopyState('Error');
    }
  };

  return (
    <div className="rounded-sm bg-[#0a0a0a] border border-zinc-800 my-4 font-mono">
      <div className="flex items-center justify-between px-4 py-2 bg-black border-b border-zinc-800">
        <span className="text-xs text-zinc-500">{filename || language}</span>
        <button 
          onClick={handleCopy}
          className="text-xs text-zinc-400 hover:text-white transition-colors"
        >
          {copyState}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm text-zinc-300">{code}</code>
      </pre>
    </div>
  );
};

const ExpandableCard = ({ title, subtitle, icon: Icon, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="p-6 bg-black border border-zinc-800 hover:border-zinc-600 transition-colors">
      <div
        className="flex items-center justify-between cursor-pointer group select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-4">
          {Icon && <Icon className="text-zinc-400 group-hover:text-white transition-colors shrink-0" size={24} />}
          <div>
            <h3 className="text-lg font-semibold text-zinc-200 group-hover:text-white transition-colors">{title}</h3>
            {subtitle && <p className="text-sm font-mono text-zinc-500 mt-1">{subtitle}</p>}
          </div>
        </div>
        <div className="text-zinc-600 group-hover:text-zinc-300 transition-colors ml-4 shrink-0">
          <ChevronDown size={20} className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>
      <div className={`grid transition-all duration-200 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-6' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

const SectionHeading = ({ title }) => (
  <div className="mb-6">
    <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
      <span className="text-zinc-600 font-mono text-base font-normal">{">>"}</span> 
      {title}
    </h2>
  </div>
);

// --- Main App ---

export default function App() {
  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-zinc-800">
      <nav className="fixed top-0 w-full z-50 bg-black/90 border-b border-zinc-900">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-2 font-bold text-white tracking-tight">
            <Terminal size={18} />
            <span>Kernel OS</span>
          </div>
          <a 
            href="https://github.com/shivjeet1/kernel-os" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center space-x-2 text-sm text-zinc-500 hover:text-white transition-colors"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
            <span>Source</span>
          </a>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-24 space-y-24">
        <section className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Baseline Kernel OS.
          </h1>
          <p className="text-zinc-400 max-w-2xl leading-relaxed">
            Built from an absolute blank slate (<code>allnoconfig</code>). I explicitly declared hardware dependencies to create a highly deterministic, zero-bloat environment.              No defaults, no fluff.
          </p>
          <div className="flex items-center space-x-4 pt-2">
            <a href="#build" className="px-4 py-2 bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-colors flex items-center space-x-2">
              <Play size={16} />
              <span>Run the OS</span>
            </a>
          </div>
        </section>

        <section id="architecture" className="scroll-mt-20">
          <SectionHeading title="Architecture Setup" />
          <p className="text-zinc-400 mb-6 text-sm max-w-2xl">
            Separated into two distinct scripts to keep the build process sane.
          </p>
          <div className="flex flex-col space-y-2">
            <ExpandableCard title="The Kernel" subtitle="setup/linux-kernel.sh" icon={Cpu}>
              <ul className="space-y-2 text-sm text-zinc-400 list-disc list-inside">
                <li>Initiates from <code>linux-6.8.x</code> allnoconfig baseline.</li>
                <li>Injects required drivers manually (TTY, i8042 PS/2, VGA).</li>
                <li>Embeds command line to bypass external bootloaders like GRUB.</li>
                <li>Compiles to a <code>bzImage</code>.</li>
              </ul>
            </ExpandableCard>

            <ExpandableCard title="The Userland" subtitle="setup/busybox.sh" icon={Terminal}>
              <ul className="space-y-2 text-sm text-zinc-400 list-disc list-inside">
                <li>Utilizes BusyBox <code>v1.36.1</code> multi-call architecture.</li>
                <li>Strictly static linking (no <code>glibc</code> deps to lug around).</li>
                <li>Configures a lightweight <code>init</code> daemon.</li>
                <li>Packs into a tmpfs-backed <code>initramfs.cpio.gz</code>.</li>
              </ul>
            </ExpandableCard>
          </div>
        </section>

        <section>
          <SectionHeading title="Notes & Decisions" />
          <div className="space-y-6 text-sm text-zinc-400 border-l border-zinc-800 pl-6 ml-2">
            <div>
              <strong className="text-zinc-200 block mb-1">Embedded Command Line</strong>
              Boot instructions are baked right into the kernel. External bootloaders are unnecessary overhead for this use-case.
            </div>
            <div>
              <strong className="text-zinc-200 block mb-1">initramfs {">"} initrd</strong>
              Loading files directly into RAM is significantly faster and removes the need for the kernel to hold extra block device driver code just to read basic startup files.
            </div>
            <div>
              <strong className="text-zinc-200 block mb-1">Hardware Emulation Quirks</strong>
              Even though PS/2 ports are dead, QEMU still relies on emulating the Intel 8042 controller via ACPI to capture host keystrokes. Had to explicitly inject <code>CONFIG_SERIO_I8042</code> to get the keyboard working.
            </div>
          </div>
        </section>

        <section id="build" className="scroll-mt-20">
          <SectionHeading title="Execution" />
          <div className="max-w-2xl space-y-6">
            <p className="text-sm text-zinc-400">
              Ensure you have <code>base-devel</code>, <code>bc</code>, <code>cpio</code>, and <code>qemu</code> installed on your host.
            </p>
            <div>
              <CodeBlock 
                filename="Terminal"
                code={`$ git clone https://github.com/shivjeet1/kernel-os.git\n$ cd kernel-os\n$ chmod +x setup/*.sh\n\n# Build kernel and userland\n$ ./setup/linux-kernel.sh\n$ ./setup/busybox.sh`} 
              />
            </div>
            <div>
              <h3 className="text-zinc-200 font-semibold mb-2 text-sm">Booting</h3>
              <CodeBlock 
                filename="Terminal"
                code={`$ qemu-system-x86_64 -kernel bzImage -initrd initramfs.cpio.gz -no-reboot`} 
              />
              <p className="text-xs text-zinc-500 mt-2">
                Type <code>reboot</code> inside BusyBox to safely unmount and halt.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 mt-12 py-8 text-center">
        <a 
          href="https://github.com/shivjeet1" 
          target="_blank" 
          rel="noreferrer"
          className="text-sm text-zinc-600 hover:text-white transition-colors font-mono inline-flex items-center gap-2"
        >
          <span>&copy; {new Date().getFullYear()}</span>
          <span>@shivjeet1</span>
        </a>
      </footer>

    </div>
  );
}
