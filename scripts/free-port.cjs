/**
 * free-port.cjs — kill whatever process is LISTENING on the given port(s).
 *
 * Why this exists: on Windows, killing a backgrounded `npm run dev` wrapper
 * does NOT kill its grandchildren (nodemon/vite/node). Those orphans keep
 * holding ports 5000 / 5173, so the next dev server either crashes
 * (EADDRINUSE) or silently drifts to a new port while the browser still
 * talks to the stale server — which shows up as phantom 404s on new routes.
 *
 * It is wired into each package's `predev` npm hook, so `npm run dev` is
 * self-healing: it clears the port, then binds fresh. Zero dependencies.
 *
 * Usage:  node ../scripts/free-port.cjs 5173
 *         node ../scripts/free-port.cjs 5000 5173
 *
 * It NEVER exits non-zero on "nothing to kill" — a failing predev would
 * block the dev server from ever starting on a clean machine.
 */
'use strict'

const { execSync } = require('node:child_process')

const isWindows = process.platform === 'win32'

/** Return the set of PIDs LISTENING on `port` (excluding our own process). */
function findListenerPids(port) {
  const pids = new Set()

  try {
    if (isWindows) {
      // netstat -ano lists every socket; we want only LISTENING rows whose
      // local address ends in `:<port>` (covers 0.0.0.0, 127.0.0.1, [::]).
      const out = execSync('netstat -ano -p TCP', { encoding: 'utf8' })
      for (const line of out.split(/\r?\n/)) {
        const parts = line.trim().split(/\s+/)
        // parts: [Proto, LocalAddr, ForeignAddr, State, PID]
        if (parts.length < 5) continue
        if (parts[3] !== 'LISTENING') continue
        if (!parts[1].endsWith(`:${port}`)) continue
        const pid = Number(parts[4])
        if (pid > 0) pids.add(pid)
      }
    } else {
      // POSIX: lsof prints one PID per line; -sTCP:LISTEN filters to listeners.
      const out = execSync(`lsof -ti tcp:${port} -sTCP:LISTEN`, {
        encoding: 'utf8',
      })
      for (const tok of out.split(/\s+/)) {
        const pid = Number(tok)
        if (pid > 0) pids.add(pid)
      }
    }
  } catch {
    // netstat/lsof found nothing (or isn't installed) — treat as "port free".
  }

  pids.delete(process.pid)
  return [...pids]
}

/** Force-kill a PID and its child tree. */
function killTree(pid) {
  try {
    if (isWindows) {
      // /T = kill the whole child tree (npm -> nodemon -> node), /F = force.
      execSync(`taskkill /PID ${pid} /T /F`, { stdio: 'ignore' })
    } else {
      process.kill(pid, 'SIGKILL')
    }
    return true
  } catch {
    return false // already gone, or not ours to kill — fine either way.
  }
}

const ports = process.argv.slice(2).filter((a) => /^\d+$/.test(a))

if (ports.length === 0) {
  console.error('free-port: no port given (usage: free-port.cjs 5173 [5000])')
  process.exit(0) // still don't block predev
}

for (const port of ports) {
  const pids = findListenerPids(port)
  if (pids.length === 0) {
    console.log(`free-port: :${port} already free`)
    continue
  }
  for (const pid of pids) {
    const ok = killTree(pid)
    console.log(
      `free-port: :${port} held by pid ${pid} — ${ok ? 'killed' : 'already gone'}`
    )
  }
}

process.exit(0)
