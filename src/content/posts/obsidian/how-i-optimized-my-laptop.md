---
title: How I Optimized My Laptop
description: Slashing 65% idle power, never locking mid-video, and freeing 13 GB
  — focusing only on changes that made a real difference.
date: 2026-11-20
tags:
  - linux
  - hyprland
  - omarchy
  - performance
  - hardware
slug: how-i-optimized-my-laptop
publish: true
draft: false
featured: false
---

# How I Optimized My Laptop

Most optimization advice for Linux laptops is filled with placebo tweaks: modifying obscure kernel parameters, tweaking scheduler tick rates, or disabling random services that save 2 MB of RAM. You spend hours configuring things, yet the laptop feels exactly the same.

When optimizing my laptop (an HP Victus with an AMD Ryzen 7 5800H, NVIDIA RTX 3050 Mobile, and a 144 Hz display running Omarchy / Hyprland), I set one strict ground rule: **only keep changes that produce an immediate, noticeable real-world improvement.**

If I couldn't see it, hear it, or measure a tangible difference in daily use, it wasn't worth doing.

Here are the four changes that actually transformed my daily experience.

***

## 1. Never Getting Locked Out Mid-Video

### The Problem

On modern Wayland compositors like Hyprland, system idle managers (`hypridle`, `swayidle`) listen to user input like mouse movements and keystrokes.

If you were watching a 20-minute video on YouTube, Netflix, or in a local media player without touching the keyboard, the system assumed you walked away. The screen would dim, lock, and go to sleep in the middle of a scene.

The standard workaround was a manual "Stay Awake" toggle in the desktop bar. But that created a worse problem: if you left it on and stepped away from your desk, the laptop stayed awake forever, wasting battery and screen life.

### The Fix

Instead of manually toggling sleep inhibitors, I installed two lightweight Wayland-native background daemons:

1. **`wayland-pipewire-idle-inhibit`**: Monitors PipeWire audio streams. Whenever an application plays sound (a YouTube tab, Spotify, Discord voice call, or media player), it automatically sends an idle inhibition lock to Wayland.
2. **`wl-mpris-idle-inhibit`**: Listens to MPRIS media player signals (like video playback in browsers or mpv) and inhibits idle whenever media is active.

Both run seamlessly as systemd user services:

```bash
systemctl --user enable --now wayland-pipewire-idle-inhibit.service
systemctl --user enable --now wl-mpris-idle-inhibit.service
```

### The Noticeable Difference

I never have to touch a "Stay Awake" toggle again. When a video is playing, the screen stays awake. As soon as the video ends or pauses, normal power-saving idle timers kick back in.

***

## 2. Slashing Idle Power Draw by 65% (Fans Went Silent)

### The Problem

Even when sitting completely idle on the desktop with nothing open, the laptop was running warm (around 48–52 °C) and the cooling fans were constantly humming in the background.

Checking hardware metrics revealed the CPU package was continuously drawing **23 to 28 Watts** while doing nothing. The AMD P-State Energy Performance Preference (EPP) was locked into a high-performance profile, keeping clock frequencies elevated and preventing CPU cores from entering deep sleep states (C-states).

### The Fix

I switched the system power profile to `balanced` using `powerprofilesctl`:

```bash
powerprofilesctl set balanced
```

This properly activated AMD P-State's `balance_performance` governor. Under this profile, the CPU drops clock speeds and core voltages down to floor levels when idle, but instantly ramps up to 4.4 GHz the millisecond a heavy task demands it.

### The Noticeable Difference

* **Idle Power**: Dropped from **23W down to 8W** (a **65% reduction** in power consumption).
* **Thermals**: Idle APU temperature dropped by **10–12 °C** (down to a cool 38–40 °C).
* **Acoustics**: The cooling fans shut off completely at idle. The laptop is silent.
* **Battery**: Real-world unplugged battery life more than doubled.

***

## 3. Reclaiming 13 GB of Wasted SSD Storage

### The Problem

The NVMe root partition had climbed to 47% utilization. Modern package managers, caches, and containerized runtime layers silently accumulate gigabytes of obsolete data.

### The Fix

I audited the disk usage to target the biggest offenders without touching any necessary files:

1. **Purged Duplicate Flatpak Runtimes**: Obsidian was installed both natively and via Flatpak. Removing the duplicate Flatpak along with its orphaned GNOME 47 runtime layers freed **2.8 GB**.
2. **Pruned Developer Toolchains**: `mise` had cached multiple inactive Node and toolchain tarballs. Running `mise prune -y` and `mise cache clear` instantly recovered **3.7 GB**.
3. **Flushed Secondary Browser Caches**: Unused caches from secondary browsers (`~/.cache/chromium` and `~/.cache/BraveSoftware`) were consuming **2.1 GB**.
4. **Cleared Package Build Residue**: AUR build directories (`yay` cache) held **744 MB** of old compiled packages.

### The Noticeable Difference

Root partition usage dropped from **47% to 43%**, instantly expanding free space from **184 GB to 197 GB** (**13 GB freed**).

***

## 4. Butter-Smooth 144 Hz Hardware Cursor

### The Problem

In the Hyprland configuration, `no_hardware_cursors` was set to `true`.

When hardware cursors are disabled, the compositor has to redraw and composite the cursor into the frame buffer on every single mouse movement. On a 144 Hz display, moving the cursor rapidly caused unnecessary compositor wakeups, subtle micro-stutters, and wasted GPU cycles.

### The Fix

Since the laptop uses a modern AMD Cezanne integrated GPU with full hardware plane support, hardware cursors work flawlessly without flickering.

In `~/.config/hypr/looknfeel.lua`:

```lua
cursor = {
  no_hardware_cursors = false,
}
```

### The Noticeable Difference

Mouse movement at 144 Hz became instantly responsive and fluid, completely offloading cursor rendering from the compositor pipeline to the display hardware.

***

## Summary of Real-World Results

| Area                | Before                                         | After                                | Real-World Impact                             |
| :------------------ | :--------------------------------------------- | :----------------------------------- | :-------------------------------------------- |
| **Video Playback**  | Screen locks mid-video unless manually toggled | Auto-inhibits idle on media playback | Zero manual toggles, never dims during movies |
| **Idle Power**      | 23W – 28W continuous draw                      | \~8W package power                   | 65% power drop, fans turn off, cooler lap     |
| **Thermals**        | 48 °C – 52 °C on idle                          | 38 °C – 40 °C on idle                | 10–12 °C cooler system                        |
| **Storage**         | 184 GB available (47% used)                    | 197 GB available (43% used)          | 13 GB storage reclaimed                       |
| **Cursor at 144Hz** | Software composited                            | Native hardware overlay plane        | Silky smooth tracking, zero compositor tax    |

***

## The Takeaway

Stop spending time applying 50 minor tweaks that make no perceptible difference. Focus on what you actually feel, hear, and see: keep your screen awake when watching videos, let your processor downclock when you're not using it, wipe duplicate runtimes, and let your hardware do what it was designed to do.
