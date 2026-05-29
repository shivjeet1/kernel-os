#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(pwd)"
OUTPUT_DIR="${PROJECT_ROOT}/output"
KERNEL_VERSION="6.18.20"

echo "Starting Linux Kernel build..."
mkdir -p "$OUTPUT_DIR"

if [ ! -f "linux-${KERNEL_VERSION}.tar.xz" ]; then
    echo "Downloading Linux Kernel v${KERNEL_VERSION}..."
    curl -fLO --progress-bar "https://cdn.kernel.org/pub/linux/kernel/v6.x/linux-${KERNEL_VERSION}.tar.xz"
else
    echo "Kernel archive already exists."
fi

echo "Extracting kernel..."
tar -xf "linux-${KERNEL_VERSION}.tar.xz"
cd "linux-${KERNEL_VERSION}"

echo "Initializing (allnoconfig)..."
make ARCH=x86_64 allnoconfig

echo "Injecting kernel features..."

./scripts/config --enable CONFIG_64BIT
./scripts/config --enable CONFIG_BLK_DEV_INITRD
./scripts/config --enable CONFIG_DEVTMPFS
./scripts/config --enable CONFIG_TTY
./scripts/config --enable CONFIG_SERIAL_8250
./scripts/config --enable CONFIG_SERIAL_8250_CONSOLE   
./scripts/config --enable CONFIG_BINFMT_ELF            

echo "PS/2 Hardware Bus & Keyboard drivers..."
./scripts/config --enable CONFIG_INPUT
./scripts/config --enable CONFIG_INPUT_KEYBOARD
./scripts/config --enable CONFIG_KEYBOARD_ATKBD
# The missing Motherboard PS/2 Controller (Crucial for QEMU)
./scripts/config --enable CONFIG_SERIO
./scripts/config --enable CONFIG_SERIO_I8042
./scripts/config --enable CONFIG_SERIO_LIBPS2

echo "Virtual Terminal & VGA Display drivers..."
./scripts/config --enable CONFIG_VT
./scripts/config --enable CONFIG_VT_CONSOLE
./scripts/config --enable CONFIG_VGA_CONSOLE
./scripts/config --enable CONFIG_DUMMY_CONSOLE

./scripts/config --enable CONFIG_PRINTK
./scripts/config --enable CONFIG_SYSFS

./scripts/config --enable CONFIG_CMDLINE_BOOL
./scripts/config --set-str CONFIG_CMDLINE "console=tty0 quiet loglevel=3 no-reboot"
./scripts/config --enable CONFIG_CMDLINE_OVERRIDE


echo "Validating configuration (olddefconfig)..."
make ARCH=x86_64 olddefconfig

echo "Compiling Linux Kernel..."
make ARCH=x86_64 -j$(nproc)

echo "Copying compiled artifact to output/ directory..."
cp arch/x86/boot/bzImage "$OUTPUT_DIR/"

echo "Success! Kernel compilation complete."
echo "Artifact location: ${OUTPUT_DIR}/bzImage"

