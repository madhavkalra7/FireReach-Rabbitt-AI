import { Suspense, lazy } from 'react'

const Spline = lazy(() => import('@splinetool/react-spline'))

export function InteractiveRobotSpline({ scene, className = '' }) {
  return (
    <Suspense
      fallback={
        <div className={`robot-spline-fallback ${className}`}>
          <span className="spinner" />
          Loading robot...
        </div>
      }
    >
      <Spline scene={scene} className={className} />
    </Suspense>
  )
}
