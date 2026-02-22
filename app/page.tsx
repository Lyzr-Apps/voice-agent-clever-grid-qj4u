'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { RiDashboardLine, RiRobot2Line, RiPhoneLine, RiSettings3Line, RiArrowUpSFill, RiArrowDownSFill, RiTimeLine, RiCalendarLine, RiUserLine, RiMicLine, RiMicOffLine, RiPhoneOffLine, RiUploadLine, RiCheckLine, RiCloseLine, RiArrowRightSLine, RiFileListLine, RiSearchLine, RiDownloadLine, RiPulseLine, RiVoiceprintLine, RiPhoneFindLine, RiCustomerService2Line, RiTeamLine, RiStarLine, RiFlashlightLine, RiShieldCheckLine, RiLinkLine } from 'react-icons/ri'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Label } from '@/components/ui/label'
import KnowledgeBaseUpload from '@/components/KnowledgeBaseUpload'
import { cn } from '@/lib/utils'

// ============================================================
// Constants
// ============================================================

const RAG_ID = '699aac0ee12ce1682031317a'

const AGENTS = [
  {
    id: '699aac1ddbfbe2b909c9ace0',
    name: 'Customer Support',
    description: 'Handles inbound calls to answer customer questions, FAQs, and product inquiries using company knowledge base via natural voice conversation',
    mode: 'Inbound' as const,
    hasKB: true,
    hasCalendar: false,
    icon: RiCustomerService2Line,
    color: 'hsl(262, 83%, 58%)',
  },
  {
    id: '699aac45dbfbe2b909c9ace3',
    name: 'Appointment Booking',
    description: 'Conducts voice conversations to collect appointment details, checks calendar availability, and books meetings on Google Calendar',
    mode: 'Both' as const,
    hasKB: false,
    hasCalendar: true,
    icon: RiCalendarLine,
    color: 'hsl(280, 70%, 50%)',
  },
  {
    id: '699aac3607441b9b9ccdfd69',
    name: 'Lead Qualification',
    description: 'Engages prospects in structured voice conversations, asks qualifying questions (BANT criteria), and scores leads based on predefined criteria',
    mode: 'Outbound' as const,
    hasKB: false,
    hasCalendar: false,
    icon: RiTeamLine,
    color: 'hsl(250, 65%, 55%)',
  },
]

// ============================================================
// Interfaces
// ============================================================

interface CallLog {
  id: string
  date: string
  caller: string
  agentName: string
  agentId: string
  duration: string
  outcome: string
  leadScore?: number
  transcript: string
  summary: string
  actionTaken: string
}

interface Appointment {
  id: string
  time: string
  title: string
  attendee: string
  status: string
}

interface TranscriptEntry {
  speaker: 'user' | 'agent'
  text: string
  timestamp: string
}

// ============================================================
// Mock Data
// ============================================================

const MOCK_STATS = {
  totalCalls: 47,
  totalCallsTrend: 12,
  appointmentsBooked: 8,
  appointmentsTrend: 3,
  leadsQualified: 15,
  leadsTrend: -2,
  avgDuration: '4:32',
  avgDurationTrend: 0.5,
}

const MOCK_CALL_LOGS: CallLog[] = [
  { id: 'cl1', date: '2026-02-22 09:15', caller: 'Sarah Mitchell', agentName: 'Customer Support', agentId: '699aac1ddbfbe2b909c9ace0', duration: '3:42', outcome: 'Resolved', transcript: 'Customer asked about return policy for electronics. Agent provided 30-day return window details and steps for initiating a return.', summary: 'Return policy inquiry - resolved with standard procedure information.', actionTaken: 'Sent return label via email' },
  { id: 'cl2', date: '2026-02-22 09:45', caller: 'James Rodriguez', agentName: 'Appointment Booking', agentId: '699aac45dbfbe2b909c9ace3', duration: '2:18', outcome: 'Booked', transcript: 'Prospect requested a product demo meeting. Agent confirmed availability for Feb 24 at 2:00 PM and booked the calendar event.', summary: 'Demo meeting booked for Feb 24, 2:00 PM.', actionTaken: 'Google Calendar event created' },
  { id: 'cl3', date: '2026-02-22 10:02', caller: 'Emily Chen', agentName: 'Lead Qualification', agentId: '699aac3607441b9b9ccdfd69', duration: '6:55', outcome: 'Qualified', leadScore: 85, transcript: 'Engaged prospect on BANT criteria. Budget: $50k-100k confirmed. Authority: VP of Operations. Need: Automated customer service. Timeline: Q2 2026.', summary: 'High-quality lead - VP of Operations at mid-market SaaS company. Strong budget and clear timeline.', actionTaken: 'Lead forwarded to sales team' },
  { id: 'cl4', date: '2026-02-22 10:30', caller: 'Michael Park', agentName: 'Customer Support', agentId: '699aac1ddbfbe2b909c9ace0', duration: '5:12', outcome: 'Escalated', transcript: 'Customer reported billing discrepancy on latest invoice. Agent attempted to resolve but required finance team intervention.', summary: 'Billing dispute requiring manual review by finance.', actionTaken: 'Escalated to billing department' },
  { id: 'cl5', date: '2026-02-22 11:00', caller: 'Amanda Brooks', agentName: 'Lead Qualification', agentId: '699aac3607441b9b9ccdfd69', duration: '4:08', outcome: 'Not Qualified', leadScore: 32, transcript: 'Prospect showed interest but lacks budget approval. Small team, limited authority for purchasing decisions. Timeline unclear.', summary: 'Early-stage prospect - nurture and follow up in 3 months.', actionTaken: 'Added to nurture campaign' },
  { id: 'cl6', date: '2026-02-22 11:30', caller: 'David Kim', agentName: 'Appointment Booking', agentId: '699aac45dbfbe2b909c9ace3', duration: '1:55', outcome: 'Booked', transcript: 'Follow-up consultation requested. Agent booked slot for Feb 25 at 10:00 AM.', summary: 'Follow-up consultation booked.', actionTaken: 'Google Calendar event created' },
  { id: 'cl7', date: '2026-02-22 12:15', caller: 'Lisa Wang', agentName: 'Customer Support', agentId: '699aac1ddbfbe2b909c9ace0', duration: '2:45', outcome: 'Resolved', transcript: 'Customer inquiry about product features and compatibility. Agent provided detailed specs from knowledge base.', summary: 'Product compatibility question resolved.', actionTaken: 'No further action needed' },
]

const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 'ap1', time: '10:00 AM', title: 'Product Demo - Acme Corp', attendee: 'Robert Chen', status: 'confirmed' },
  { id: 'ap2', time: '11:30 AM', title: 'Follow-up Consultation', attendee: 'Jessica Lee', status: 'confirmed' },
  { id: 'ap3', time: '2:00 PM', title: 'Sales Discovery Call', attendee: 'James Rodriguez', status: 'pending' },
  { id: 'ap4', time: '3:30 PM', title: 'Onboarding Session', attendee: 'Maria Garcia', status: 'confirmed' },
  { id: 'ap5', time: '4:45 PM', title: 'Technical Review', attendee: 'Alex Thompson', status: 'pending' },
]

const MOCK_RECENT_ACTIVITY = [
  { agentName: 'Customer Support', caller: 'Sarah M.', status: 'Resolved', duration: '3:42', time: '9:15 AM' },
  { agentName: 'Appointment Booking', caller: 'James R.', status: 'Booked', duration: '2:18', time: '9:45 AM' },
  { agentName: 'Lead Qualification', caller: 'Emily C.', status: 'Qualified', duration: '6:55', time: '10:02 AM' },
  { agentName: 'Customer Support', caller: 'Michael P.', status: 'Escalated', duration: '5:12', time: '10:30 AM' },
  { agentName: 'Lead Qualification', caller: 'Amanda B.', status: 'Not Qualified', duration: '4:08', time: '11:00 AM' },
]

// ============================================================
// Error Boundary
// ============================================================

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4 text-sm">{this.state.error}</p>
            <button onClick={() => this.setState({ hasError: false, error: '' })} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// ============================================================
// Markdown renderer
// ============================================================

function formatInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part
  )
}

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-2">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-sm mt-3 mb-1">{line.slice(4)}</h4>
        if (line.startsWith('## ')) return <h3 key={i} className="font-semibold text-base mt-3 mb-1">{line.slice(3)}</h3>
        if (line.startsWith('# ')) return <h2 key={i} className="font-bold text-lg mt-4 mb-2">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 list-disc text-sm">{formatInline(line.slice(2))}</li>
        if (/^\d+\.\s/.test(line)) return <li key={i} className="ml-4 list-decimal text-sm">{formatInline(line.replace(/^\d+\.\s/, ''))}</li>
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm">{formatInline(line)}</p>
      })}
    </div>
  )
}

// ============================================================
// Utility: outcome badge color
// ============================================================

function getOutcomeBadgeVariant(outcome: string): string {
  switch (outcome.toLowerCase()) {
    case 'resolved': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    case 'booked': return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'qualified': return 'bg-violet-100 text-violet-700 border-violet-200'
    case 'not qualified': return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'escalated': return 'bg-red-100 text-red-700 border-red-200'
    default: return 'bg-muted text-muted-foreground'
  }
}

function getModeBadge(mode: string): string {
  switch (mode) {
    case 'Inbound': return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'Outbound': return 'bg-orange-100 text-orange-700 border-orange-200'
    case 'Both': return 'bg-purple-100 text-purple-700 border-purple-200'
    default: return 'bg-muted text-muted-foreground'
  }
}

// ============================================================
// Voice Call Hook
// ============================================================

function useVoiceCall() {
  const [isCallActive, setIsCallActive] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [activeAgentName, setActiveAgentName] = useState<string>('')

  const wsRef = useRef<WebSocket | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const sampleRateRef = useRef(24000)
  const nextPlayTimeRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isMutedRef = useRef(false)

  useEffect(() => {
    isMutedRef.current = isMuted
  }, [isMuted])

  const playAudioChunk = useCallback((base64Audio: string) => {
    const ctx = audioContextRef.current
    if (!ctx) return
    try {
      const raw = atob(base64Audio)
      const bytes = new Uint8Array(raw.length)
      for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i)
      const pcm16 = new Int16Array(bytes.buffer)
      const float32 = new Float32Array(pcm16.length)
      for (let i = 0; i < pcm16.length; i++) float32[i] = pcm16[i] / 32768
      const buffer = ctx.createBuffer(1, float32.length, sampleRateRef.current)
      buffer.getChannelData(0).set(float32)
      const source = ctx.createBufferSource()
      source.buffer = buffer
      const gainNode = ctx.createGain()
      gainNode.gain.value = 1
      gainNode.connect(ctx.destination)
      source.connect(gainNode)
      const now = ctx.currentTime
      const startTime = Math.max(now, nextPlayTimeRef.current)
      source.start(startTime)
      nextPlayTimeRef.current = startTime + buffer.duration
    } catch (err) {
      // Silently handle audio decode errors
    }
  }, [])

  const startCall = useCallback(async (agentId: string, agentName: string) => {
    setError(null)
    setIsConnecting(true)
    setActiveAgentId(agentId)
    setActiveAgentName(agentName)
    setTranscripts([])
    setCallDuration(0)
    nextPlayTimeRef.current = 0

    try {
      // Step 1: Start session
      const res = await fetch('https://voice-sip.studio.lyzr.ai/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId }),
      })
      if (!res.ok) throw new Error('Failed to start voice session')
      const data = await res.json()
      const wsUrl = data?.wsUrl
      const sr = data?.audioConfig?.sampleRate ?? 24000
      sampleRateRef.current = sr

      if (!wsUrl) throw new Error('No WebSocket URL received')

      // Step 2: Get mic access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream

      // Step 3: Audio context for playback
      const playbackCtx = new AudioContext({ sampleRate: sr })
      audioContextRef.current = playbackCtx

      // Step 4: Mic capture context
      const captureCtx = new AudioContext({ sampleRate: sr })
      const micSource = captureCtx.createMediaStreamSource(stream)
      const processor = captureCtx.createScriptProcessor(4096, 1, 1)
      processorRef.current = processor

      // Step 5: Connect WebSocket
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        setIsCallActive(true)
        setIsConnecting(false)
        // Start duration timer
        timerRef.current = setInterval(() => {
          setCallDuration(prev => prev + 1)
        }, 1000)
      }

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          if (msg.type === 'audio' && msg.audio) {
            playAudioChunk(msg.audio)
          } else if (msg.type === 'transcript') {
            const speaker = msg.role === 'user' ? 'user' : 'agent'
            const text = msg.text || msg.transcript || ''
            if (text) {
              const now = new Date()
              const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
              setTranscripts(prev => [...prev, { speaker, text, timestamp }])
            }
            setIsThinking(false)
          } else if (msg.type === 'thinking') {
            setIsThinking(true)
          } else if (msg.type === 'clear') {
            setIsThinking(false)
          } else if (msg.type === 'error') {
            setError(msg.message || 'Voice agent error')
          }
        } catch {
          // Non-JSON message, ignore
        }
      }

      ws.onerror = () => {
        setError('WebSocket connection error')
        setIsConnecting(false)
      }

      ws.onclose = () => {
        setIsCallActive(false)
        setIsConnecting(false)
        if (timerRef.current) clearInterval(timerRef.current)
      }

      // Step 6: Wire mic capture
      processor.onaudioprocess = (e) => {
        if (isMutedRef.current) return
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
        const input = e.inputBuffer.getChannelData(0)
        const pcm16 = new Int16Array(input.length)
        for (let i = 0; i < input.length; i++) {
          pcm16[i] = Math.max(-32768, Math.min(32767, Math.floor(input[i] * 32768)))
        }
        const uint8 = new Uint8Array(pcm16.buffer)
        let binary = ''
        for (let i = 0; i < uint8.length; i++) {
          binary += String.fromCharCode(uint8[i])
        }
        const base64 = btoa(binary)
        wsRef.current.send(JSON.stringify({
          type: 'audio',
          audio: base64,
          sampleRate: sampleRateRef.current,
        }))
      }

      micSource.connect(processor)
      // Connect to silent gain node - NOT audioContext.destination
      const silentGain = captureCtx.createGain()
      silentGain.gain.value = 0
      processor.connect(silentGain)
      silentGain.connect(captureCtx.destination)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to start call'
      setError(message)
      setIsConnecting(false)
    }
  }, [playAudioChunk])

  const endCall = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop())
      mediaStreamRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {})
      audioContextRef.current = null
    }
    if (processorRef.current) {
      processorRef.current.disconnect()
      processorRef.current = null
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setIsCallActive(false)
    setIsConnecting(false)
    setIsMuted(false)
    setIsThinking(false)
    nextPlayTimeRef.current = 0
  }, [])

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev)
  }, [])

  return {
    isCallActive,
    isConnecting,
    isMuted,
    callDuration,
    transcripts,
    isThinking,
    error,
    activeAgentId,
    activeAgentName,
    startCall,
    endCall,
    toggleMute,
    setError,
  }
}

// ============================================================
// Format duration
// ============================================================

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

// ============================================================
// Sub-components
// ============================================================

function StatCard({ title, value, trend, trendLabel, icon: Icon }: { title: string; value: string | number; trend: number; trendLabel: string; icon: React.ComponentType<{ className?: string }> }) {
  const isPositive = trend > 0
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-3xl font-bold mt-1 tracking-tight">{value}</p>
            <div className="flex items-center gap-1 mt-2">
              {isPositive ? (
                <RiArrowUpSFill className="h-4 w-4 text-emerald-500" />
              ) : trend < 0 ? (
                <RiArrowDownSFill className="h-4 w-4 text-red-500" />
              ) : null}
              <span className={cn('text-xs font-medium', isPositive ? 'text-emerald-600' : trend < 0 ? 'text-red-600' : 'text-muted-foreground')}>
                {trend > 0 ? '+' : ''}{trendLabel}
              </span>
              <span className="text-xs text-muted-foreground ml-1">vs yesterday</span>
            </div>
          </div>
          <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function VoiceCallModal({ isOpen, voice, onClose }: { isOpen: boolean; voice: ReturnType<typeof useVoiceCall>; onClose: () => void }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [voice.transcripts])

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={() => { voice.endCall(); onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RiVoiceprintLine className="h-5 w-5 text-primary" />
            {voice.activeAgentName}
          </DialogTitle>
          <DialogDescription>
            {voice.isConnecting ? 'Connecting...' : voice.isCallActive ? 'Call in progress' : 'Call ended'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status & Duration */}
          <div className="flex items-center justify-center gap-6">
            {voice.isCallActive && (
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
                <span className="text-sm font-medium text-emerald-600">Live</span>
              </div>
            )}
            {voice.isConnecting && (
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
                </span>
                <span className="text-sm font-medium text-amber-600">Connecting</span>
              </div>
            )}
            <div className="text-2xl font-mono font-bold tracking-wider">{formatDuration(voice.callDuration)}</div>
          </div>

          {/* Pulse Animation */}
          {voice.isCallActive && (
            <div className="flex justify-center py-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((h, i) => (
                  <div
                    key={i}
                    className={cn('w-1 rounded-full bg-primary transition-all duration-300', voice.isThinking ? 'animate-pulse' : '')}
                    style={{ height: `${h * (voice.isCallActive ? 8 : 3)}px`, animationDelay: `${i * 80}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Thinking indicator */}
          {voice.isThinking && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <RiPulseLine className="h-4 w-4 animate-pulse" />
              <span className="text-sm">Agent is thinking...</span>
            </div>
          )}

          {/* Transcript */}
          <div ref={scrollRef} className="h-48 overflow-y-auto border rounded-lg p-3 bg-muted/30 space-y-2">
            {voice.transcripts.length === 0 && !voice.isConnecting && (
              <p className="text-center text-muted-foreground text-sm py-8">
                {voice.isCallActive ? 'Waiting for conversation...' : 'No transcript available'}
              </p>
            )}
            {voice.isConnecting && (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <div className="animate-pulse flex gap-1">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <div className="h-2 w-2 rounded-full bg-primary" style={{ animationDelay: '150ms' }} />
                  <div className="h-2 w-2 rounded-full bg-primary" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-sm text-muted-foreground">Establishing voice connection...</span>
              </div>
            )}
            {Array.isArray(voice.transcripts) && voice.transcripts.map((entry, i) => (
              <div key={i} className={cn('flex flex-col', entry.speaker === 'user' ? 'items-end' : 'items-start')}>
                <div className={cn('max-w-[80%] rounded-lg px-3 py-2 text-sm', entry.speaker === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card border')}>
                  {entry.text}
                </div>
                <span className="text-xs text-muted-foreground mt-1">{entry.timestamp}</span>
              </div>
            ))}
          </div>

          {/* Error message */}
          {voice.error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive flex items-center gap-2">
              <RiCloseLine className="h-4 w-4 flex-shrink-0" />
              {voice.error}
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            {(voice.isCallActive || voice.isConnecting) && (
              <>
                <Button
                  variant={voice.isMuted ? 'destructive' : 'outline'}
                  size="lg"
                  className="rounded-full h-14 w-14 p-0"
                  onClick={voice.toggleMute}
                  disabled={!voice.isCallActive}
                >
                  {voice.isMuted ? <RiMicOffLine className="h-6 w-6" /> : <RiMicLine className="h-6 w-6" />}
                </Button>
                <Button
                  variant="destructive"
                  size="lg"
                  className="rounded-full h-14 w-14 p-0"
                  onClick={voice.endCall}
                >
                  <RiPhoneOffLine className="h-6 w-6" />
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DashboardScreen({ showSample, onNavigate }: { showSample: boolean; onNavigate: (screen: string) => void }) {
  const stats = showSample ? MOCK_STATS : { totalCalls: 0, totalCallsTrend: 0, appointmentsBooked: 0, appointmentsTrend: 0, leadsQualified: 0, leadsTrend: 0, avgDuration: '0:00', avgDurationTrend: 0 }
  const activities = showSample ? MOCK_RECENT_ACTIVITY : []
  const appointments = showSample ? MOCK_APPOINTMENTS : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Real-time overview of your voice agent operations</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Calls Today" value={stats.totalCalls} trend={stats.totalCallsTrend} trendLabel={`${stats.totalCallsTrend}`} icon={RiPhoneLine} />
        <StatCard title="Appointments Booked" value={stats.appointmentsBooked} trend={stats.appointmentsTrend} trendLabel={`${stats.appointmentsTrend}`} icon={RiCalendarLine} />
        <StatCard title="Leads Qualified" value={stats.leadsQualified} trend={stats.leadsTrend} trendLabel={`${stats.leadsTrend}`} icon={RiTeamLine} />
        <StatCard title="Avg Call Duration" value={stats.avgDuration} trend={stats.avgDurationTrend > 0 ? 1 : 0} trendLabel={`${stats.avgDurationTrend}min`} icon={RiTimeLine} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Recent Call Activity</CardTitle>
            <CardDescription>Latest interactions across all voice agents</CardDescription>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <RiPhoneFindLine className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground font-medium">No calls yet</p>
                <p className="text-sm text-muted-foreground mt-1">Activate your agents to get started</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {activities.map((act, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                          <RiUserLine className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{act.caller}</p>
                          <p className="text-xs text-muted-foreground">{act.agentName} -- {act.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{act.duration}</span>
                        <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', getOutcomeBadgeVariant(act.status))}>
                          {act.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Today's Appointments */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Today&apos;s Appointments</CardTitle>
            <CardDescription>Upcoming booked meetings</CardDescription>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <RiCalendarLine className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground font-medium">No appointments today</p>
                <p className="text-sm text-muted-foreground mt-1">Meetings will appear here when booked</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="relative pl-6 pb-3 border-l-2 border-primary/20 last:border-l-0">
                      <div className="absolute left-[-5px] top-1 h-2 w-2 rounded-full bg-primary" />
                      <p className="text-xs text-primary font-semibold">{apt.time}</p>
                      <p className="text-sm font-medium mt-0.5">{apt.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <RiUserLine className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{apt.attendee}</span>
                        <span className={cn('text-xs px-1.5 py-0 rounded-full', apt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>
                          {apt.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button variant="default" onClick={() => onNavigate('agents')} className="gap-2">
          <RiRobot2Line className="h-4 w-4" />
          Start Outbound Campaign
        </Button>
        <Button variant="outline" onClick={() => onNavigate('logs')} className="gap-2">
          <RiFileListLine className="h-4 w-4" />
          View All Logs
        </Button>
      </div>
    </div>
  )
}

function AgentsScreen({ showSample, onStartCall }: { showSample: boolean; onStartCall: (agentId: string, agentName: string) => void }) {
  const [agentStates, setAgentStates] = useState<Record<string, boolean>>({
    '699aac1ddbfbe2b909c9ace0': true,
    '699aac45dbfbe2b909c9ace3': true,
    '699aac3607441b9b9ccdfd69': true,
  })
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null)
  const [greetings, setGreetings] = useState<Record<string, string>>({
    '699aac1ddbfbe2b909c9ace0': 'Hello! Thank you for calling our support line. How can I help you today?',
    '699aac45dbfbe2b909c9ace3': 'Hi there! I can help you schedule an appointment. What date and time works best for you?',
    '699aac3607441b9b9ccdfd69': 'Good day! I am reaching out to learn more about your business needs. Do you have a moment to chat?',
  })
  const [tones, setTones] = useState<Record<string, string>>({
    '699aac1ddbfbe2b909c9ace0': 'Professional',
    '699aac45dbfbe2b909c9ace3': 'Friendly',
    '699aac3607441b9b9ccdfd69': 'Consultative',
  })

  const callCounts: Record<string, number> = showSample ? {
    '699aac1ddbfbe2b909c9ace0': 23,
    '699aac45dbfbe2b909c9ace3': 12,
    '699aac3607441b9b9ccdfd69': 12,
  } : {
    '699aac1ddbfbe2b909c9ace0': 0,
    '699aac45dbfbe2b909c9ace3': 0,
    '699aac3607441b9b9ccdfd69': 0,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Agent Configuration</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your voice agents, knowledge bases, and integrations</p>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {AGENTS.map((agent) => {
          const Icon = agent.icon
          const isExpanded = expandedAgent === agent.id
          const isActive = agentStates[agent.id] ?? false

          return (
            <Card key={agent.id} className="shadow-md overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${agent.color}15` }}>
                      <Icon className="h-5 w-5" style={{ color: agent.color }} />
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {agent.name}
                        <Badge variant="outline" className={cn('text-xs font-medium', getModeBadge(agent.mode))}>
                          {agent.mode}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {callCounts[agent.id] ?? 0} calls
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">{agent.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`switch-${agent.id}`} className="text-xs text-muted-foreground">{isActive ? 'Active' : 'Inactive'}</Label>
                      <Switch id={`switch-${agent.id}`} checked={isActive} onCheckedChange={(c) => setAgentStates(prev => ({ ...prev, [agent.id]: c }))} />
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setExpandedAgent(isExpanded ? null : agent.id)}>
                      <RiArrowRightSLine className={cn('h-4 w-4 transition-transform', isExpanded ? 'rotate-90' : '')} />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="border-t pt-5 space-y-5">
                  {/* Agent-specific panels */}
                  {agent.hasKB && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <RiUploadLine className="h-4 w-4 text-primary" />
                        Knowledge Base
                      </h3>
                      <p className="text-xs text-muted-foreground">Upload documents to train this agent on your product information, FAQs, and policies.</p>
                      <KnowledgeBaseUpload ragId={RAG_ID} />
                    </div>
                  )}

                  {agent.hasCalendar && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <RiCalendarLine className="h-4 w-4 text-primary" />
                        Google Calendar Integration
                      </h3>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                        <RiCheckLine className="h-5 w-5 text-emerald-600" />
                        <div>
                          <p className="text-sm font-medium text-emerald-700">Connected</p>
                          <p className="text-xs text-emerald-600">Google Calendar is linked and active via Composio</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {!agent.hasKB && !agent.hasCalendar && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <RiStarLine className="h-4 w-4 text-primary" />
                        BANT Qualification Criteria
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: 'Budget', desc: 'Financial capacity and allocated budget', icon: RiFlashlightLine },
                          { label: 'Authority', desc: 'Decision-making power of contact', icon: RiShieldCheckLine },
                          { label: 'Need', desc: 'Business problem alignment with solution', icon: RiSearchLine },
                          { label: 'Timeline', desc: 'Implementation urgency and timeframe', icon: RiTimeLine },
                        ].map((c) => (
                          <div key={c.label} className="p-3 rounded-lg border bg-muted/30">
                            <div className="flex items-center gap-2 mb-1">
                              <c.icon className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium">{c.label}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{c.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Voice personality */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <RiVoiceprintLine className="h-4 w-4 text-primary" />
                      Voice Personality
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Tone</Label>
                        <Select value={tones[agent.id] ?? 'Professional'} onValueChange={(v) => setTones(prev => ({ ...prev, [agent.id]: v }))}>
                          <SelectTrigger className="text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Professional">Professional</SelectItem>
                            <SelectItem value="Friendly">Friendly</SelectItem>
                            <SelectItem value="Consultative">Consultative</SelectItem>
                            <SelectItem value="Empathetic">Empathetic</SelectItem>
                            <SelectItem value="Assertive">Assertive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Greeting Message</Label>
                        <Textarea
                          className="text-sm resize-none"
                          rows={3}
                          value={greetings[agent.id] ?? ''}
                          onChange={(e) => setGreetings(prev => ({ ...prev, [agent.id]: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Test Call Button */}
                  <div className="flex items-center gap-3">
                    <Button onClick={() => onStartCall(agent.id, agent.name)} disabled={!isActive} className="gap-2">
                      <RiPhoneLine className="h-4 w-4" />
                      Test Call
                    </Button>
                    <span className="text-xs text-muted-foreground">Start a live voice session with this agent</span>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function CallLogsScreen({ showSample }: { showSample: boolean }) {
  const [agentFilter, setAgentFilter] = useState('all')
  const [outcomeFilter, setOutcomeFilter] = useState('all')
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const logs = showSample ? MOCK_CALL_LOGS : []

  const filteredLogs = logs.filter(log => {
    if (agentFilter !== 'all' && log.agentId !== agentFilter) return false
    if (outcomeFilter !== 'all' && log.outcome.toLowerCase() !== outcomeFilter) return false
    if (searchQuery && !log.caller.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return
    const headers = 'Date,Caller,Agent,Duration,Outcome,Lead Score,Summary'
    const rows = filteredLogs.map(l =>
      `"${l.date}","${l.caller}","${l.agentName}","${l.duration}","${l.outcome}","${l.leadScore ?? 'N/A'}","${l.summary}"`
    )
    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'call_logs.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Call Logs</h1>
          <p className="text-muted-foreground text-sm mt-1">Complete history of all voice agent interactions</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleExportCSV} disabled={filteredLogs.length === 0}>
          <RiDownloadLine className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1.5 min-w-[180px]">
              <Label className="text-xs">Search Caller</Label>
              <div className="relative">
                <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  className="pl-9 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5 min-w-[160px]">
              <Label className="text-xs">Agent</Label>
              <Select value={agentFilter} onValueChange={setAgentFilter}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Agents</SelectItem>
                  {AGENTS.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 min-w-[160px]">
              <Label className="text-xs">Outcome</Label>
              <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Outcomes</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="booked">Booked</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="not qualified">Not Qualified</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="shadow-md">
        <CardContent className="p-0">
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <RiFileListLine className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground font-medium">
                {showSample ? 'No matching call logs' : 'No call logs yet'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {showSample ? 'Try adjusting your filters' : 'Activate your agents to get started'}
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Caller</TableHead>
                    <TableHead className="text-xs">Agent</TableHead>
                    <TableHead className="text-xs">Duration</TableHead>
                    <TableHead className="text-xs">Outcome</TableHead>
                    <TableHead className="text-xs">Lead Score</TableHead>
                    <TableHead className="text-xs w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <React.Fragment key={log.id}>
                      <TableRow className="cursor-pointer hover:bg-muted/40" onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}>
                        <TableCell className="text-sm">{log.date}</TableCell>
                        <TableCell className="text-sm font-medium">{log.caller}</TableCell>
                        <TableCell className="text-sm">{log.agentName}</TableCell>
                        <TableCell className="text-sm">{log.duration}</TableCell>
                        <TableCell>
                          <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', getOutcomeBadgeVariant(log.outcome))}>
                            {log.outcome}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.leadScore != null ? (
                            <div className="flex items-center gap-2">
                              <Progress value={log.leadScore} className="h-2 w-16" />
                              <span className="text-xs font-medium">{log.leadScore}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">--</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <RiArrowRightSLine className={cn('h-4 w-4 transition-transform text-muted-foreground', expandedRow === log.id ? 'rotate-90' : '')} />
                        </TableCell>
                      </TableRow>
                      {expandedRow === log.id && (
                        <TableRow>
                          <TableCell colSpan={7} className="bg-muted/20 p-4">
                            <div className="space-y-3">
                              <div>
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Transcript</h4>
                                <p className="text-sm">{log.transcript}</p>
                              </div>
                              <div>
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Summary</h4>
                                <p className="text-sm">{log.summary}</p>
                              </div>
                              <div>
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Action Taken</h4>
                                <p className="text-sm">{log.actionTaken}</p>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function SettingsScreen() {
  const [phoneNumber, setPhoneNumber] = useState('+1 (555) 123-4567')
  const [businessHoursStart, setBusinessHoursStart] = useState('09:00')
  const [businessHoursEnd, setBusinessHoursEnd] = useState('18:00')
  const [defaultGreeting, setDefaultGreeting] = useState('Thank you for calling. How may I assist you today?')
  const [fallbackMessage, setFallbackMessage] = useState('I apologize, but I am unable to help with that request. Let me transfer you to a human representative.')
  const [timezone, setTimezone] = useState('America/New_York')
  const [savedStatus, setSavedStatus] = useState<string | null>(null)

  const handleSave = () => {
    setSavedStatus('Settings saved successfully')
    setTimeout(() => setSavedStatus(null), 3000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Configure global settings for your voice agents</p>
      </div>

      {savedStatus && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-700 flex items-center gap-2">
          <RiCheckLine className="h-4 w-4" />
          {savedStatus}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Google Calendar */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <RiCalendarLine className="h-4 w-4 text-primary" />
              Google Calendar
            </CardTitle>
            <CardDescription>Calendar integration for appointment booking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-50 border border-emerald-200">
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <RiCheckLine className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-700">Connected via Composio</p>
                <p className="text-xs text-emerald-600 mt-0.5">Appointment Booking Agent can create and manage calendar events</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Phone Number */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <RiPhoneLine className="h-4 w-4 text-primary" />
              Phone Configuration
            </CardTitle>
            <CardDescription>Primary phone number for voice agents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs">Phone Number</Label>
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
              <RiLinkLine className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Connected to all voice agents</span>
            </div>
          </CardContent>
        </Card>

        {/* Business Hours */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <RiTimeLine className="h-4 w-4 text-primary" />
              Business Hours
            </CardTitle>
            <CardDescription>Set operating hours for your voice agents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Start Time</Label>
                <Input type="time" value={businessHoursStart} onChange={(e) => setBusinessHoursStart(e.target.value)} className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">End Time</Label>
                <Input type="time" value={businessHoursEnd} onChange={(e) => setBusinessHoursEnd(e.target.value)} className="text-sm" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern (ET)</SelectItem>
                  <SelectItem value="America/Chicago">Central (CT)</SelectItem>
                  <SelectItem value="America/Denver">Mountain (MT)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific (PT)</SelectItem>
                  <SelectItem value="Europe/London">GMT</SelectItem>
                  <SelectItem value="Asia/Kolkata">IST</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <RiVoiceprintLine className="h-4 w-4 text-primary" />
              Default Messages
            </CardTitle>
            <CardDescription>Configure fallback and greeting messages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Default Greeting</Label>
              <Textarea
                value={defaultGreeting}
                onChange={(e) => setDefaultGreeting(e.target.value)}
                className="text-sm resize-none"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Fallback Message</Label>
              <Textarea
                value={fallbackMessage}
                onChange={(e) => setFallbackMessage(e.target.value)}
                className="text-sm resize-none"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2">
          <RiCheckLine className="h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  )
}

// ============================================================
// Main Page Component
// ============================================================

export default function Page() {
  const [activeScreen, setActiveScreen] = useState('dashboard')
  const [showSample, setShowSample] = useState(false)
  const [showCallModal, setShowCallModal] = useState(false)
  const voice = useVoiceCall()

  const handleStartCall = (agentId: string, agentName: string) => {
    setShowCallModal(true)
    voice.startCall(agentId, agentName)
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: RiDashboardLine },
    { id: 'agents', label: 'Agents', icon: RiRobot2Line },
    { id: 'logs', label: 'Call Logs', icon: RiPhoneLine },
    { id: 'settings', label: 'Settings', icon: RiSettings3Line },
  ]

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-foreground font-sans flex">
        {/* Sidebar */}
        <aside className="w-64 bg-card border-r flex flex-col flex-shrink-0 min-h-screen">
          {/* Logo */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
                <RiVoiceprintLine className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-base font-bold tracking-tight">VoiceAssist AI</h2>
                <p className="text-xs text-muted-foreground">Voice Agent Dashboard</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeScreen === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveScreen(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              )
            })}
          </nav>

          {/* Agent Status */}
          <div className="p-4 border-t">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Agent Status</h3>
            <div className="space-y-2">
              {AGENTS.map((agent) => {
                const isActiveAgent = voice.activeAgentId === agent.id && (voice.isCallActive || voice.isConnecting)
                return (
                  <div key={agent.id} className="flex items-center gap-2">
                    <span className={cn('h-2 w-2 rounded-full flex-shrink-0', isActiveAgent ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/30')} />
                    <span className="text-xs truncate">{agent.name}</span>
                    {isActiveAgent && <span className="text-xs text-emerald-600 font-medium ml-auto">Active</span>}
                  </div>
                )
              })}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen overflow-y-auto">
          {/* Top Bar */}
          <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b px-6 py-3 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {navItems.find(n => n.id === activeScreen)?.label ?? 'Dashboard'}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="sample-toggle" className="text-xs text-muted-foreground cursor-pointer">Sample Data</Label>
                <Switch
                  id="sample-toggle"
                  checked={showSample}
                  onCheckedChange={setShowSample}
                />
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="p-6">
            {activeScreen === 'dashboard' && (
              <DashboardScreen showSample={showSample} onNavigate={setActiveScreen} />
            )}
            {activeScreen === 'agents' && (
              <AgentsScreen showSample={showSample} onStartCall={handleStartCall} />
            )}
            {activeScreen === 'logs' && (
              <CallLogsScreen showSample={showSample} />
            )}
            {activeScreen === 'settings' && (
              <SettingsScreen />
            )}
          </div>
        </main>

        {/* Voice Call Modal */}
        <VoiceCallModal isOpen={showCallModal} voice={voice} onClose={() => setShowCallModal(false)} />
      </div>
    </ErrorBoundary>
  )
}
