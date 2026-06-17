# Alchmyst

Alchmyst is a protocol-driven AI agent developer observability console and simulation server. It is built to visualize agent execution traces in real-time and stress-test client-server communication under simulated network adversity.

## Project Structure

This repository contains the following components:

* [**agent-console**](file:///e:/alchmyst/agent-console/): A Next.js + TypeScript web application implementing the frontend trace timeline, context diff viewer, sequence buffering, and diagnostics dashboard.
* [**agent-server**](file:///e:/alchmyst/agent-server/): A Node.js + TypeScript WebSocket server simulating AI agent token/tool execution streams, heartbeats, and simulated network adversity (Chaos Mode).

## Quick Start

### 1. Install Dependencies
```bash
# In agent-server:
cd agent-server && npm install

# In agent-console:
cd agent-console && npm install
```

### 2. Running the Application

To run both services:

#### Normal Mode
```bash
# Terminal 1:
cd agent-server && npm start

# Terminal 2:
cd agent-console && npm run dev
```

#### Chaos Mode (Stress Testing)
```bash
# Terminal 1:
cd agent-server && npm start -- --mode chaos

# Terminal 2:
cd agent-console && npm run dev
```

For detailed architectures and features, refer to the individual component directories.
