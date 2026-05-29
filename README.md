# kernel-os

# Minimal Kernel OS
This project is a custom, bare-metal Linux operating system built entirely from scratch. Instead of taking a heavy, pre-configured distribution, this project starts from an absolute blank slate (`allnoconfig`) and surgically adds only the drivers and subsystems required to boot a fully functional terminal environment.

The entire build process is automated through bash scripts and a GitHub Actions CI/CD pipeline.

## The Architecture

The OS is divided into two decoupled components: the Kernel and the Userland. The automation is handled by two independent scripts located in the `setup/` directory:

* **`setup/linux-kernel.sh`**: This script downloads the Linux kernel source and strips away all default configurations. It then injects only the essential drivers (like `TTY` for the terminal, `i8042` for PS/2 keyboard input, and `VGA` for the display) and compiles them into a single, bootable `bzImage`.
* **`setup/busybox.sh`**: This script handles the userland. It downloads BusyBox, configures it as a static binary, and bypasses known compile errors (like disabling the `tc` network utility). It then creates the fundamental Linux folder structure (`/dev`, `/proc`, `/sys`), writes the `init` daemon configuration (`inittab`), and packs everything into a compressed RAM disk (`initramfs.cpio.gz`).

## The Reasons 

Here are a few core engineering decisions made during this project:

* **Why start with `allnoconfig`?** It is easy to compile a kernel with default settings. Starting with an empty configuration proves a deeper understanding of how the kernel actually interacts with the hardware (like manually bridging the PS/2 bus to the virtual keyboard).
* **Why embed the Kernel Command Line?** Instead of passing a long, messy `-append` string through QEMU to configure the boot sequence, the boot parameters (`console=tty0 quiet loglevel=3 no-reboot`) are compiled directly into the kernel binary. This makes the final OS completely self-contained.
* **Why use an Arch Linux container in CI/CD?**
To automate the releases, the GitHub Actions workflow runs inside an Arch Linux Docker container. Using `pacman -Syu` ensures the build environment is perfectly synced with the latest rolling release, preventing any partial-upgrade dependency breaks during compilation.

## Execution Instructions

You can download the pre-compiled `bzImage` and `initramfs.cpio.gz` from the **Releases** section of this repository, or you can build it locally.

### How to Build Locally

If you want to compile the OS on your own machine, ensure you have standard build tools installed (e.g., `base-devel`, `bc`, `cpio`, `curl`, and `qemu`).

**1. Clone the repository:**

```bash
git clone https://github.com/shivjeet1/kernel-os.git 
cd kernel-os
```

**2. Make the scripts executable:**

```bash
chmod +x setup/linux-kernel.sh
chmod +x setup/busybox.sh

```

**3. Run the builds:**

```bash
# Locally build the kernel and userland
./setup/linux-kernel.sh
./setup/busybox.sh
```

*The compiled artifacts will be saved in the `/output` directory.*

### How to Run the OS

Once you have the `bzImage` and `initramfs.cpio.gz` (either built locally or downloaded from Releases), you can boot the OS using QEMU.

Run the following command from the same directory as your artifacts:

```bash
qemu-system-x86_64 \
    -kernel bzImage \
    -initrd initramfs.cpio.gz \
    -no-reboot
```

**To shut down the OS:** Simply type `reboot` inside the BusyBox terminal. The `init` daemon will safely unmount the filesystems, halt the kernel, and cleanly exit the QEMU window.

```

