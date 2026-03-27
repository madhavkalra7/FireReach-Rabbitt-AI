import { InteractiveRobotSpline } from './ui/interactive-3d-robot'

const ROBOT_SCENE_URL = 'https://prod.spline.design/PyzDhpQ9E5f1E3MT/scene.splinecode'

export default function RobotCutout() {
  return (
    <div className="robot-cutout" aria-hidden="true">
      <InteractiveRobotSpline scene={ROBOT_SCENE_URL} className="robot-cutout-scene" />
    </div>
  )
}
