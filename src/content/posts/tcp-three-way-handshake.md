---
title: TCP Three-Way Handshake, Packet by Packet
description: Understand SYN, SYN-ACK, and ACK, then observe connection attempts with practical Linux commands.
date: "2026-11-17"
category: Networking
tags: [tcp, networking, transport]
learningPath: Networking Foundations
lesson: 2
publish: true
draft: false
---

# TCP Three-Way Handshake, Packet by Packet

DNS can give a client an address, but an IP address alone does not create a TCP connection. Before sending application data over a new TCP connection, the endpoints synchronize sequence numbers and establish connection state.

## 1. The three messages

For a typical active open, the handshake is:

| Step | Sender | TCP flags | What it means |
| --- | --- | --- | --- |
| 1 | Client | SYN | Proposes a connection and its initial sequence number |
| 2 | Server | SYN, ACK | Acknowledges the client's SYN and sends its own SYN |
| 3 | Client | ACK | Acknowledges the server's SYN |

The important idea is that both sides need to confirm receipt of the other's initial sequence number. The handshake also allows TCP options such as maximum segment size and window scaling to be negotiated.

## 2. What happens on failure?

If the server has no listening socket for the destination port, it will often respond with a TCP reset (RST). If a firewall silently drops SYN packets, the client may retransmit SYN segments and eventually time out.

A connection timeout and an immediate connection refusal are **different observations**, not interchangeable error messages.

## 3. Observe a connection locally

Start a listener in one terminal:

```bash
python -m http.server 8000
```

In another terminal:

```bash
curl -v http://127.0.0.1:8000/
ss -tn
```

To inspect packets, use a capture tool with adequate permissions:

```bash
sudo tcpdump -i lo -nn 'tcp port 8000'
```

Start the capture **before** running `curl`. The interface name `lo` is conventional on Linux. Captures may include extra packets; identify SYN and ACK flags rather than assuming exactly three captured packets.

## 4. TCP is not TLS

A completed TCP handshake means a transport connection has been established. It does **not** mean encryption or server authentication is complete.

For a conventional HTTPS-over-TCP connection, TLS negotiation follows. For HTTP/3, QUIC carries the transport and security functions over UDP instead.

## Investigation checklist

- Capture a successful loopback handshake.
- Try a port with no listener and inspect the RST behavior.
- Compare that behavior with a filtered network path **only if** you control the test environment and firewall.
- Revisit [DNS resolution](/posts/how-a-computer-finds-a-website) to see how the destination address was discovered.
