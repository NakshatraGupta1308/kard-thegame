import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080').replace(/\/+$/, '')
const RECONNECT_DELAY = 3000
const CONNECTION_TIMEOUT = 20000
const MAX_RETRIES = 20

let client = null
let connected = false
let pendingCallbacks = []
let failedAttempts = 0
let status = 'connecting' // 'connecting' | 'connected' | 'failed'
const statusListeners = new Set()

function setStatus(next) {
  status = next
  statusListeners.forEach(listener => listener(status))
}

export function getStatus() {
  return status
}

export function onStatusChange(listener) {
  statusListeners.add(listener)
  return () => statusListeners.delete(listener)
}

export function connect(onConnected) {
  if (connected) {
    onConnected()
    return
  }

  if (client) {
    pendingCallbacks.push(onConnected)
    return
  }

  pendingCallbacks.push(onConnected)

  client = new Client({
    webSocketFactory: () => new SockJS(`${BACKEND_URL}/ws`),
    onConnect: () => {
      console.log('WebSocket connected')
      connected = true
      failedAttempts = 0
      setStatus('connected')
      pendingCallbacks.forEach(cb => cb())
      pendingCallbacks = []
    },
    onDisconnect: () => {
      console.log('WebSocket disconnected')
      connected = false
      client = null
    },
    onWebSocketClose: () => {
      connected = false
      if (status === 'failed') return
      failedAttempts++
      if (failedAttempts >= MAX_RETRIES) {
        console.warn(`WebSocket gave up after ${failedAttempts} attempts`)
        client.deactivate()
        setStatus('failed')
      } else {
        setStatus('connecting')
      }
    },
    onStompError: (frame) => console.error('STOMP error', frame),
    reconnectDelay: RECONNECT_DELAY,
    connectionTimeout: CONNECTION_TIMEOUT,
  })

  setStatus('connecting')
  client.activate()
}

export function retry() {
  if (!client || status !== 'failed') return
  failedAttempts = 0
  setStatus('connecting')
  client.activate()
}

export function disconnect() {
  // no-op: keep connection alive across pages
}

export function subscribe(destination, callback) {
  if (!client || !connected) return
  const sub = client.subscribe(destination, (message) => {
    callback(JSON.parse(message.body))
  })
  return sub
}

export function send(destination, body) {
  if (!client || !connected) return
  client.publish({
    destination: `/app${destination}`,
    body: JSON.stringify(body),
  })
}
