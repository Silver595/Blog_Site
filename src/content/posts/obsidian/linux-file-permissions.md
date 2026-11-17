---
title: Understanding Linux File Permissions
description: A practical introduction to Linux file permissions, chmod, and ownership.
date: 2026-11-17
tags:
  - linux
  - permissions
  - system-administration
slug: linux-file-permissions
publish: true
draft: false
featured: false
---

# Understanding Linux File Permissions

Linux uses permissions to control who can read, modify, or execute files and directories.

## 1. Understanding permission bits

Run:

```bash
ls -l
```

Example output:

```text
-rwxr-xr-- 1 silver silver 1024 Nov 17 10:00 script.sh
```

The first character represents the file type. The next nine characters represent permissions for the owner, group, and others.

| Permission | Symbol | Numeric value |
| ---------- | ------ | ------------- |
| Read       | r      | 4             |
| Write      | w      | 2             |
| Execute    | x      | 1             |

## 2. Changing permissions

```bash
chmod 755 script.sh
```

This grants the owner read, write, and execute permissions; the group and others receive read and execute permissions.

## 3. Changing ownership

```bash
sudo chown silver:silver script.sh
```

## 4. Practical exercise

Create a test file:

```bash
touch test.txt
chmod 640 test.txt
ls -l test.txt
```

Observe the resulting permissions and explain which users can read or modify the file.

## Key takeaway

Permissions are fundamental to Linux security, but access decisions can also involve directory permissions, access control lists, and other security mechanisms.
