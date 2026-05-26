#!/usr/bin/env bash

set -euo pipefail

PROJECT_ROOT="$(pwd)"
OUTPUT_DIR="${PROJECT_ROOT}/output"
BUSYBOX_VERSION="1.37.0"
TARBALL="busybox-${BUSYBOX_VERSION}.tar.bz2"
URL="https://busybox.net/downloads/${TARBALL}"

echo "Launching BusyBox & Initramfs build..."
mkdir -p "$OUTPUT_DIR"

if [ ! -f "$TARBALL" ]; then
    echo "Downloading BusyBox v${BUSYBOX_VERSION} via curl..."
    curl -LO "$URL"
else
    echo "Source tarball already exists. Skipping download."
fi

echo "Extracting archive..."
tar -xf "$TARBALL"
cd "busybox-${BUSYBOX_VERSION}"

echo "Generating defconfig..."
make defconfig

echo "Build static binary & bypass tc compile error..."
sed -i 's/# CONFIG_STATIC is not set/CONFIG_STATIC=y/' .config
sed -i 's/CONFIG_TC=y/# CONFIG_TC is not set/' .config

echo "Validating configuration(olddefconfig)..."
make oldconfig

echo "Compiling BusyBox binary..."
make -j$(nproc)

echo "Generating basic filesystem(_install)..."
make install

