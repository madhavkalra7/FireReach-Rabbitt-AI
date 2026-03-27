import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Line, RoundedBox, Text } from '@react-three/drei'
import * as THREE from 'three'

const STAGES = [
  { tool_name: 'agent1_discovery', label: 'Discovery' },
  { tool_name: 'agent2_signals', label: 'Signals' },
  { tool_name: 'agent3_verifier', label: 'Verify' },
  { tool_name: 'agent4_scorer', label: 'Score' },
  { tool_name: 'agent5_ranker', label: 'Rank' },
  { tool_name: 'agent6_contacts', label: 'Contacts' },
  { tool_name: 'agent7_outreach', label: 'Outreach' },
]

const NODE_X = [-6, -4, -2, 0, 2, 4, 6]

const STATUS_STYLE = {
  pending: { color: '#2e3553', emissive: '#14182c' },
  running: { color: '#ff7b3d', emissive: '#ff4a00' },
  completed: { color: '#30d28a', emissive: '#11884f' },
  failed: { color: '#ff4d6d', emissive: '#a1082f' },
}

function getStageStatusMap(steps = []) {
  return STAGES.reduce((map, stage) => {
    const match = steps.find((step) => step.tool_name === stage.tool_name)
    map[stage.tool_name] = match?.status || 'pending'
    return map
  }, {})
}

function getProgressIndex(statusMap) {
  const runningIndex = STAGES.findIndex((stage) => statusMap[stage.tool_name] === 'running')
  if (runningIndex >= 0) return runningIndex

  let lastCompleted = -1
  STAGES.forEach((stage, index) => {
    if (statusMap[stage.tool_name] === 'completed') lastCompleted = index
  })
  return Math.max(lastCompleted, 0)
}

function FlowPulse({ progressIndex }) {
  const pulseRef = useRef(null)

  useFrame(({ clock }) => {
    if (!pulseRef.current) return

    const safeIndex = Math.max(0, Math.min(progressIndex, NODE_X.length - 1))
    const startX = NODE_X[Math.max(0, safeIndex - 1)]
    const endX = NODE_X[safeIndex]
    const mix = (Math.sin(clock.elapsedTime * 2.7) + 1) / 2

    pulseRef.current.position.x = THREE.MathUtils.lerp(startX, endX, mix)
    pulseRef.current.position.y = 0.16 + Math.sin(clock.elapsedTime * 4.5) * 0.03
    pulseRef.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 6) * 0.08)
  })

  return (
    <mesh ref={pulseRef} position={[NODE_X[0], 0.16, 0]}>
      <sphereGeometry args={[0.15, 28, 28]} />
      <meshStandardMaterial color="#ffc992" emissive="#ff6b00" emissiveIntensity={1.4} roughness={0.2} metalness={0.25} />
    </mesh>
  )
}

function AgentNode({ x, index, label, status }) {
  const style = STATUS_STYLE[status] || STATUS_STYLE.pending
  const glowRef = useRef(null)

  useFrame(({ clock }) => {
    if (!glowRef.current) return

    if (status === 'running') {
      glowRef.current.material.emissiveIntensity = 0.65 + Math.sin(clock.elapsedTime * 7 + index) * 0.2
    } else if (status === 'completed') {
      glowRef.current.material.emissiveIntensity = 0.45
    } else if (status === 'failed') {
      glowRef.current.material.emissiveIntensity = 0.35
    } else {
      glowRef.current.material.emissiveIntensity = 0.15
    }
  })

  return (
    <group position={[x, 0, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.33, 0]}>
        <ringGeometry args={[0.32, 0.46, 48]} />
        <meshStandardMaterial color={style.color} emissive={style.emissive} emissiveIntensity={0.15} metalness={0.5} roughness={0.35} />
      </mesh>

      <RoundedBox ref={glowRef} args={[0.9, 0.42, 0.9]} radius={0.08} smoothness={4}>
        <meshStandardMaterial color={style.color} emissive={style.emissive} emissiveIntensity={0.2} metalness={0.45} roughness={0.25} />
      </RoundedBox>

      <Text position={[0, 0.55, 0]} fontSize={0.15} color="#dce6ff" anchorX="center" anchorY="middle">
        {String(index + 1)}
      </Text>

      <Text position={[0, -0.64, 0]} fontSize={0.13} color="#b8c4eb" anchorX="center" anchorY="middle">
        {label}
      </Text>
    </group>
  )
}

function PipelineScene({ statusMap }) {
  const progressIndex = getProgressIndex(statusMap)

  const trackPoints = useMemo(
    () => NODE_X.map((x, index) => new THREE.Vector3(x, 0, Math.sin(index * 0.5) * 0.18)),
    []
  )

  return (
    <>
      <color attach="background" args={['#05070f']} />
      <fog attach="fog" args={['#05070f', 8, 20]} />

      <ambientLight intensity={0.55} />
      <directionalLight position={[6, 7, 5]} intensity={1.1} color="#ffe5cf" />
      <pointLight position={[-5, 2, 2]} intensity={0.8} color="#4f77ff" />
      <pointLight position={[5, 2, 2]} intensity={0.9} color="#ff7b3d" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.95, 0]}>
        <planeGeometry args={[16, 4]} />
        <meshStandardMaterial color="#0b1020" metalness={0.3} roughness={0.85} />
      </mesh>

      <Line points={trackPoints} color="#21335f" lineWidth={2.5} transparent opacity={0.95} />
      <Line
        points={trackPoints.slice(0, Math.max(2, progressIndex + 1))}
        color="#ff8b46"
        lineWidth={3.2}
        transparent
        opacity={0.95}
      />

      {STAGES.map((stage, index) => (
        <AgentNode
          key={stage.tool_name}
          x={NODE_X[index]}
          index={index}
          label={stage.label}
          status={statusMap[stage.tool_name] || 'pending'}
        />
      ))}

      <FlowPulse progressIndex={progressIndex} />
    </>
  )
}

export default function Pipeline3D({ steps = [], message = '' }) {
  const statusMap = useMemo(() => getStageStatusMap(steps), [steps])

  return (
    <div className="pipeline3d-wrap">
      <div className="pipeline3d-header-row">
        <span className="pipeline3d-kicker">Realtime Agent Mesh</span>
        <span className="pipeline3d-meta">Serial Execution</span>
      </div>

      <div className="pipeline3d-scene">
        <Canvas camera={{ position: [0, 2.3, 10], fov: 34 }} dpr={[1, 1.6]}>
          <PipelineScene statusMap={statusMap} />
        </Canvas>
      </div>

      <div className="pipeline3d-track">
        {STAGES.map((stage, index) => {
          const status = statusMap[stage.tool_name] || 'pending'
          return (
            <div key={stage.tool_name} className={`pipeline3d-stage is-${status}`}>
              <span className="stage-index">{index + 1}</span>
              <span className="stage-label">{stage.label}</span>
            </div>
          )
        })}
      </div>

      <p className="pipeline3d-message">{message || 'Initializing distributed agents...'}</p>
    </div>
  )
}
