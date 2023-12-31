import { Group } from "three"
import {
  useState,
  useRef,
  forwardRef,
  useMemo,
  useImperativeHandle,
  useEffect,
} from "react"
import { useFrame } from "@react-three/fiber"

export type AnimRef = {
  repeatAnimation: () => void
  rollback: () => void
  stepforward: () => void
  step: number
}

type AnimatedCubeProps = {
  cubeData: Array<[string, string, string]>
  setCubeData: (cubeData: Array<[string, string, string]>) => void
  sequence: Array<string>
  playFull: boolean
  finishSequence?: () => void
}

const AnimatedCube = forwardRef<AnimRef, AnimatedCubeProps>(function AnimatedCube(
  { cubeData, setCubeData, sequence, playFull, finishSequence },
  ref
) {
  const [activeFace, setActiveFace] = useState<string>("none")
  const [turnDir, setTurnDir] = useState<number>(0)
  const [repeat, setRepeat] = useState<boolean>(false)
  const [proceed, setProceed] = useState<boolean>(false)
  const [step, setStep] = useState<number>(0)

  const faceRef = useRef<Group>(null)

  const turnSpeed = playFull ? 6 : 1.5

  const iEdgeColors: Array<[string, string, string]> = useMemo(
    () => cubeData.slice(0, 12),
    []
  )
  const iCornerColors: Array<[string, string, string]> = useMemo(
    () => cubeData.slice(12, 20),
    []
  )
  const centerColors: Array<[string, string, string]> = [
    ["blue", "blue", "blue"],
    ["green", "green", "green"],
    ["yellow", "yellow", "yellow"],
    ["white", "white", "white"],
    ["red", "red", "red"],
    ["orange", "orange", "orange"],
  ]

  const [edgeColors, setEdgeColors] =
    useState<Array<[string, string, string]>>(iEdgeColors)
  const [cornerColors, setCornerColors] =
    useState<Array<[string, string, string]>>(iCornerColors)

  const edgeCubies = useMemo(
    () =>
      Array(12)
        .fill(0)
        .map((_, i) => (
          <Cubie type="edge" positionId={i} colors={edgeColors[i]} key={"e" + i} />
        )),
    [edgeColors]
  )
  const cornerCubies = useMemo(
    () =>
      Array(8)
        .fill(0)
        .map((_, i) => (
          <Cubie type="corner" positionId={i} colors={cornerColors[i]} key={"c" + i} />
        )),
    [cornerColors]
  )
  const centerCubies = Array(6)
    .fill(0)
    .map((_, i) => (
      <Cubie type="center" positionId={i} colors={centerColors[i]} key={"c" + i} />
    ))

  const faceEdges = new Map([
    ["U", [0, 1, 2, 3]],
    ["D", [4, 7, 6, 5]],
    ["F", [0, 9, 4, 8]],
    ["B", [2, 10, 6, 11]],
    ["L", [3, 11, 7, 9]],
    ["R", [1, 8, 5, 10]],
    ["none", []],
  ])

  const faceCorners = new Map([
    ["U", [0, 1, 2, 3]],
    ["D", [4, 5, 6, 7]],
    ["F", [0, 3, 5, 4]],
    ["B", [2, 1, 7, 6]],
    ["L", [3, 2, 6, 5]],
    ["R", [1, 0, 4, 7]],
    ["none", []],
  ])
  const faceCenters = new Map([
    ["U", 0],
    ["D", 1],
    ["F", 2],
    ["B", 3],
    ["L", 4],
    ["R", 5],
    ["none", -1],
  ])

  const edges = faceEdges.get(activeFace)!
  const corners = faceCorners.get(activeFace)!
  const center = faceCenters.get(activeFace)!

  const completeAnimation = () => {
    if (activeFace === "none") return
    if (faceRef.current) {
      const rotation = 4 - turnDir

      const anchor =
        activeFace === "U" || activeFace === "D"
          ? 1
          : activeFace === "F" || activeFace === "B"
          ? 2
          : 0

      setEdgeColors((prev) => {
        const newColors = [...prev]
        for (let i = 0; i < 4; i++) {
          const colors = prev[edges[i]]
          const swap1 = (anchor + 1) % 3
          const swap2 = (anchor + 2) % 3
          const tmp = colors[swap1]
          if (rotation !== 2 && rotation !== 4) {
            colors[swap1] = colors[swap2]
            colors[swap2] = tmp
          }
          newColors[edges[(i + rotation) % 4]] = colors
        }
        return newColors
      })
      setCornerColors((prev) => {
        const newColors = [...prev]
        for (let i = 0; i < 4; i++) {
          const colors = prev[corners[i]]
          const swap1 = (anchor + 1) % 3
          const swap2 = (anchor + 2) % 3
          const tmp = colors[swap1]
          if (rotation !== 2) {
            colors[swap1] = colors[swap2]
            colors[swap2] = tmp
          }
          newColors[corners[(i + rotation) % 4]] = colors
        }
        return newColors
      })
    }
    setActiveFace("none")
    setTurnDir(0)
    if (faceRef.current) {
      faceRef.current.userData.rotation = 0
      faceRef.current.rotation.set(0, 0, 0)
    }
  }

  const rollback = () => {
    completeAnimation()
    if (step === 0) return
    const move = sequence[step - 1]

    setProceed(true)
    setActiveFace(move[0])
    setTurnDir(move.length === 1 ? -1 : move[1] === "'" ? 1 : 2)
    setStep(step - 1)
  }

  const stepforward = () => {
    completeAnimation()
    if (step === sequence.length) return
    const move = sequence[step]

    setProceed(true)
    setActiveFace(move[0])
    setTurnDir(move.length === 1 ? 1 : move[1] === "'" ? -1 : 2)
    setStep(step + 1)
  }

  useImperativeHandle(
    ref,
    () => {
      return {
        repeatAnimation() {
          if (activeFace === "none") return
          setRepeat(true)
        },
        rollback,
        stepforward,
        step: step,
      }
    },
    [step, completeAnimation, rollback, stepforward]
  )

  useFrame(() => {
    if (turnDir === 0) return
    if (faceRef.current) {
      if (
        Math.abs(faceRef.current.userData.rotation) >=
        (Math.abs(turnDir) * Math.PI) / 2
      ) {
        if (playFull) {
          if (step !== sequence.length) {
            stepforward()
            return
          } else {
            completeAnimation()
            return
          }
        }
        if (repeat) {
          faceRef.current.userData.rotation = 0
          faceRef.current.rotation.set(0, 0, 0)
          setRepeat(false)
        }
        return
      }
      if (!repeat && !proceed) return
      if (activeFace === "U") {
        faceRef.current.rotation.y -= 0.01 * turnDir * turnSpeed
        faceRef.current.userData.rotation = faceRef.current.rotation.y
      } else if (activeFace === "D") {
        faceRef.current.rotation.y += 0.01 * turnDir * turnSpeed
        faceRef.current.userData.rotation = faceRef.current.rotation.y
      } else if (activeFace === "F") {
        faceRef.current.rotation.z -= 0.01 * turnDir * turnSpeed
        faceRef.current.userData.rotation = faceRef.current.rotation.z
      } else if (activeFace === "B") {
        faceRef.current.rotation.z += 0.01 * turnDir * turnSpeed
        faceRef.current.userData.rotation = faceRef.current.rotation.z
      } else if (activeFace === "L") {
        faceRef.current.rotation.x += 0.01 * turnDir * turnSpeed
        faceRef.current.userData.rotation = faceRef.current.rotation.x
      } else if (activeFace === "R") {
        faceRef.current.rotation.x -= 0.01 * turnDir * turnSpeed
        faceRef.current.userData.rotation = faceRef.current.rotation.x
      }
    }
  })

  useEffect(() => {
    if (playFull) {
      stepforward()
    }
  }, [sequence])

  useEffect(() => {
    if (playFull && step === sequence.length) {
      const cubeData = edgeColors.concat(cornerColors)
      setCubeData(cubeData)
      finishSequence ? finishSequence() : console.log("finishSequence not defined")
    }
  }, [edgeColors, cornerColors])

  return (
    <>
      {
        <group ref={faceRef} name={activeFace}>
          {edgeCubies.filter((_, i) => edges.includes(i))}
          {cornerCubies.filter((_, i) => corners.includes(i))}
          {centerCubies.filter((_, i) => i === center)}
        </group>
      }
      {edgeCubies.filter((_, i) => !edges.includes(i))}
      {cornerCubies.filter((_, i) => !corners.includes(i))}
      {centerCubies.filter((_, i) => i !== center)}
    </>
  )
})

function Cubie({
  positionId,
  type,
  colors,
}: {
  positionId: number
  type: string
  colors: [string, string, string]
}) {
  const isCorner = type === "corner"
  const isCenter = type === "center"
  const centerPos: Array<[number, number, number]> = [
    [0, 1, 0],
    [0, -1, 0],
    [0, 0, 1],
    [0, 0, -1],
    [-1, 0, 0],
    [1, 0, 0],
  ]
  const edgePos: Array<[number, number, number]> = [
    [0, 1, 1],
    [1, 1, 0],
    [0, 1, -1],
    [-1, 1, 0],
    [0, -1, 1],
    [1, -1, 0],
    [0, -1, -1],
    [-1, -1, 0],
    [1, 0, 1],
    [-1, 0, 1],
    [1, 0, -1],
    [-1, 0, -1],
  ]
  const cornerPos: Array<[number, number, number]> = [
    [1, 1, 1],
    [1, 1, -1],
    [-1, 1, -1],
    [-1, 1, 1],
    [1, -1, 1],
    [-1, -1, 1],
    [-1, -1, -1],
    [1, -1, -1],
  ]

  const x =
    isCorner && !isCenter
      ? cornerPos[positionId][0]
      : isCenter
      ? centerPos[positionId][0]
      : edgePos[positionId][0]
  const y =
    isCorner && !isCenter
      ? cornerPos[positionId][1]
      : isCenter
      ? centerPos[positionId][1]
      : edgePos[positionId][1]
  const z =
    isCorner && !isCenter
      ? cornerPos[positionId][2]
      : isCenter
      ? centerPos[positionId][2]
      : edgePos[positionId][2]

  const xc1 = 0.06 * x
  const yc1 = 0
  const zc1 = 0

  const xc2 = 0
  const yc2 = 0.06 * y
  const zc2 = 0

  const xc3 = 0
  const yc3 = 0
  const zc3 = 0.06 * z

  return (
    <group position={[x, y, z]}>
      <mesh name="x" position={[xc1, yc1, zc1]}>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshStandardMaterial color={colors[0]} />
      </mesh>
      <mesh name="y" position={[xc2, yc2, zc2]}>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshStandardMaterial color={colors[1]} />
      </mesh>
      <mesh name="z" position={[xc3, yc3, zc3]}>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshStandardMaterial color={colors[2]} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="black" />
      </mesh>
    </group>
  )
}

export default AnimatedCube
