---
title: How a Computer Finds a Website
description: Follow a domain name from your browser through DNS resolution, addresses, and the first connection.
date: "2026-11-17"
category: Networking
tags: [dns, networking, fundamentals]
learningPath: Networking Foundations
lesson: 1
publish: true
draft: false
---

# How a Computer Finds a Website

Typing a website name looks simple. Underneath, your machine has to discover where to send packets. The first step is usually name resolution, not an HTTP request.

## 1. A name is not an address

The URL `https://example.com/` contains a hostname, `example.com`. Networks forward packets using IP addresses, so the browser (often via the operating system) needs an address for that name.

A simplified path looks like this:

1. Check browser or system caches and locally configured mappings.
2. Ask a configured DNS resolver if no usable answer is cached.
3. Use a returned IPv4 (A) or IPv6 (AAAA) address to attempt a connection.
4. Establish transport and security before exchanging an HTTPS request.

Actual browsers may perform these operations differently, use encrypted DNS, or connect using information already cached.

## 2. Recursive DNS resolution

A recursive resolver can answer from cache. Otherwise, it may ask authoritative DNS infrastructure, following referrals from the root to the relevant top-level domain and then the authoritative servers. The answer includes a time to live (TTL), which influences caching.

DNS does not guarantee that one hostname always maps to one address. A name may return several addresses and different answers at different times.

## 3. Inspect the process on Linux

Try these commands in a terminal:

```bash
getent ahosts example.com
resolvectl status
```

`getent` uses the system's configured name-service lookup mechanisms. `resolvectl` applies on systems running systemd-resolved; it may not be available or relevant on every Linux installation.

If `dig` is installed, you can also query DNS directly:

```bash
dig example.com A
dig example.com AAAA
```

## 4. DNS is not the whole connection

An address tells the client where to connect; it does not establish a reliable transport connection or prove the server's identity. For that, continue with [the TCP three-way handshake](/posts/tcp-three-way-handshake). HTTPS commonly negotiates TLS after establishing TCP; HTTP/3 instead uses QUIC over UDP.

## Investigate

Compare the answers of `getent ahosts` and `dig`. If they differ, investigate which resolver path each tool actually used. Do not assume a different output automatically means either tool is wrong.
