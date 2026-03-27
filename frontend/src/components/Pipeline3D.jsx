import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Line } from '@react-three/drei'
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
  pending: { color: '#334166', emissive: '#111c38' },
  running: { color: '#ff8a47', emissive: '#ff4b0f' },
  completed: { color: '#35d895', emissive: '#0d8a56' },
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

function getActiveStage(statusMap) {
  const running = STAGES.find((stage) => statusMap[stage.tool_name] === 'running')
  if (running) return running

  let lastCompleted = null
  STAGES.forEach((stage) => {
    if (statusMap[stage.tool_name] === 'completed') lastCompleted = stage
  })
  return lastCompleted || STAGES[0]
}

function MovingBackground() {
  const pointsRef = useRef(null)
  const ringRef = useRef(null)

  const particlePositions = useMemo(() => {
    const data = new Float32Array(720)
    for (let i = 0; i < 240; i += 1) {
      data[i * 3] = (Math.random() - 0.5) * 20
      data[i * 3 + 1] = Math.random() * 5.5 - 1.5
      data[i * 3 + 2] = (Math.random() - 0.5) * 12
    }
    return data
  }, [])

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.elapsedTime * 0.08
      pointsRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.11) * 0.08
    }

    if (ringRef.current) {
      ringRef.current.rotation.z = clock.elapsedTime * 0.35
      ringRef.current.position.y = Math.sin(clock.elapsedTime * 0.8) * 0.08 - 0.15
    }
  })

  return (
    <>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={240} array={particlePositions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial color="#6d8eff" size={0.06} sizeAttenuation transparent opacity={0.8} />
      </points>

      <mesh ref={ringRef} position={[0, -0.15, -0.7]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.6, 0.05, 12, 120]} />
        <meshStandardMaterial color="#2f66ff" emissive="#183f98" emissiveIntensity={0.7} />
      </mesh>
    </>
  )
}

function StageBeacon({ x, status, index }) {
  const glowRef = useRef(null)
  const style = STATUS_STYLE[status] || STATUS_STYLE.pending

  useFrame(({ clock }) => {
    if (!glowRef.current) return

    const base = status === 'running' ? 1.05 : status === 'completed' ? 0.65 : 0.28
    const pulse = status === 'running' ? Math.sin(clock.elapsedTime * 6 + index) * 0.32 : 0
    glowRef.current.material.emissiveIntensity = base + pulse
  })

  return (
    <group position={[x, -0.08, 0]}>
      <mesh position={[0, -0.18, 0]}>
        <cylinderGeometry args={[0.25, 0.32, 0.15, 20]} />
        <meshStandardMaterial color="#0b1228" metalness={0.45} roughness={0.5} />
      </mesh>

      <mesh ref={glowRef} position={[0, 0.02, 0]}>
        <sphereGeometry args={[0.19, 30, 30]} />
        <meshStandardMaterial color={style.color} emissive={style.emissive} emissiveIntensity={0.2} roughness={0.2} metalness={0.35} />
      </mesh>
    </group>
  )
}

function RobotCourier({ progressIndex }) {
  const robotRef = useRef(null)
  const leftArmRef = useRef(null)
  const rightArmRef = useRef(null)
  const leftLegRef = useRef(null)
  const rightLegRef = useRef(null)

  useFrame(({ clock }) => {
    if (!robotRef.current) return

    const safeIndex = Math.max(0, Math.min(progressIndex, NODE_X.length - 1))
    const prevX = NODE_X[Math.max(0, safeIndex - 1)]
    const nextX = NODE_X[safeIndex]
    const walkT = (Math.sin(clock.elapsedTime * 1.8) + 1) / 2

    robotRef.current.position.x = THREE.MathUtils.lerp(prevX, nextX, walkT)
    robotRef.current.position.y = 0.38 + Math.sin(clock.elapsedTime * 3.6) * 0.04
    robotRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.8) * 0.1

    const limbSwing = Math.sin(clock.elapsedTime * 5.2) * 0.45
    if (leftArmRef.current) leftArmRef.current.rotation.x = limbSwing
    if (rightArmRef.current) rightArmRef.current.rotation.x = -limbSwing
    if (leftLegRef.current) leftLegRef.current.rotation.x = -limbSwing * 0.7
    if (rightLegRef.current) rightLegRef.current.rotation.x = limbSwing * 0.7
  })

  return (
    <Float speed={2.2} rotationIntensity={0.08} floatIntensity={0.12}>
      <group ref={robotRef} position={[NODE_X[0], 0.38, 0.1]}>
        <mesh position={[0, 0.42, 0]}>
          <boxGeometry args={[0.52, 0.42, 0.36]} />
          <meshStandardMaterial color="#8fb1ff" emissive="#2d4c9b" emissiveIntensity={0.5} metalness={0.45} roughness={0.25} />
        </mesh>

        <mesh position={[0, 0.8, 0]}>
          <boxGeometry args={[0.44, 0.34, 0.32]} />
          <meshStandardMaterial color="#dce7ff" emissive="#3c5aa8" emissiveIntensity={0.25} metalness={0.3} roughness={0.2} />
        </mesh>

        <mesh position={[-0.09, 0.83, 0.17]}>
          <sphereGeometry args={[0.035, 18, 18]} />
          <meshStandardMaterial color="#ff8b47" emissive="#ff5d1f" emissiveIntensity={1.2} />
        </mesh>
        <mesh position={[0.09, 0.83, 0.17]}>
          <sphereGeometry args={[0.035, 18, 18]} />
          <meshStandardMaterial color="#ff8b47" emissive="#ff5d1f" emissiveIntensity={1.2} />
        </mesh>

        <group ref={leftArmRef} position={[-0.34, 0.45, 0]}>
          <mesh>
            <capsuleGeometry args={[0.06, 0.26, 4, 10]} />
            <meshStandardMaterial color="#6f90db" metalness={0.35} roughness={0.3} />
          </mesh>
        </group>
        <group ref={rightArmRef} position={[0.34, 0.45, 0]}>
          <mesh>
            <capsuleGeometry args={[0.06, 0.26, 4, 10]} />
            <meshStandardMaterial color="#6f90db" metalness={0.35} roughness={0.3} />
          </mesh>
        </group>

        <group ref={leftLegRef} position={[-0.13, 0.07, 0]}>
          <mesh>
            <capsuleGeometry args={[0.07, 0.23, 4, 10]} />
            <meshStandardMaterial color="#4f6fb8" metalness={0.35} roughness={0.35} />
          </mesh>
        </group>
        <group ref={rightLegRef} position={[0.13, 0.07, 0]}>
          <mesh>
            <capsuleGeometry args={[0.07, 0.23, 4, 10]} />
            <meshStandardMaterial color="#4f6fb8" metalness={0.35} roughness={0.35} />
          </mesh>
        </group>
      </group>
    </Float>
  )
}

function FlowPulse({ progressIndex }) {
  const pulseRef = useRef(null)

  useFrame(({ clock }) => {
    if (!pulseRef.current) return

    const safeIndex = Math.max(0, Math.min(progressIndex, NODE_X.length - 1))
    const startX = NODE_X[Math.max(0, safeIndex - 1)]
    const endX = NODE_X[safeIndex]
    const mix = (Math.sin(clock.elapsedTime * 2.2) + 1) / 2

    pulseRef.current.position.x = THREE.MathUtils.lerp(startX, endX, mix)
    pulseRef.current.position.y = 0.06 + Math.sin(clock.elapsedTime * 4.5) * 0.03
    pulseRef.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 5.8) * 0.08)
  })

  return (
    <mesh ref={pulseRef} position={[NODE_X[0], 0.06, 0]}>
      <sphereGeometry args={[0.12, 24, 24]} />
      <meshStandardMaterial color="#ffc992" emissive="#ff6b00" emissiveIntensity={1.4} roughness={0.2} metalness={0.25} />
    </mesh>
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
      <color attach="background" args={['#030713']} />
      <fog attach="fog" args={['#030713', 8, 24]} />

      <ambientLight intensity={0.45} />
      <directionalLight position={[6, 6, 5]} intensity={1.2} color="#ffe9d6" />
      <pointLight position={[-5, 2.4, 2]} intensity={1.0} color="#5f86ff" />
      <pointLight position={[5, 2.2, 2]} intensity={1.0} color="#ff7f3f" />

      <MovingBackground />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.92, 0]}>
        <planeGeometry args={[18, 4.8]} />
        <meshStandardMaterial color="#070d1d" metalness={0.3} roughness={0.85} />
      </mesh>

      <Line points={trackPoints} color="#29477d" lineWidth={2.6} transparent opacity={0.95} />
      <Line
        points={trackPoints.slice(0, Math.max(2, progressIndex + 1))}
        color="#ff9a55"
        lineWidth={3.7}
        transparent
        opacity={0.95}
      />

      {STAGES.map((stage, index) => (
        <StageBeacon
          key={stage.tool_name}
          x={NODE_X[index]}
          index={index}
          status={statusMap[stage.tool_name] || 'pending'}
        />
      ))}

      <RobotCourier progressIndex={progressIndex} />
      <FlowPulse progressIndex={progressIndex} />
    </>
  )
}

export default function Pipeline3D({ steps = [], message = '' }) {
  const statusMap = useMemo(() => getStageStatusMap(steps), [steps])
  const activeStage = useMemo(() => getActiveStage(statusMap), [statusMap])

  return (
    <div className="pipeline3d-wrap">
      <div className="pipeline3d-header-row">
        <span className="pipeline3d-kicker">Realtime Agent Robot</span>
        <span className="pipeline3d-meta">Serial Execution</span>
      </div>

      <div className="pipeline3d-live">
        <span className="pipeline3d-live-dot" />
        <span className="pipeline3d-live-title">Active Agent: {activeStage.label}</span>
      </div>

      <div className="pipeline3d-scene">
        <Canvas camera={{ position: [0, 3.2, 9.5], fov: 38 }} dpr={[1, 1.5]}>
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

      <p className="pipeline3d-message">{message || 'Robot courier syncing your 7-agent pipeline...'}</p>
    </div>
  )
}
