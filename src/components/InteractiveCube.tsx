import { Group } from "three"
import { useState, useRef, useEffect, useMemo } from "react"
import { ThreeEvent, useFrame } from "@react-three/fiber"

type InteractiveCubeProps = {
  setLock: (lock: boolean) => void
  cubeData: Array<[string, string, string]>
  setCubeData: (cubeData: Array<[string, string, string]>) => void
}

function InteractiveCube({ setLock, cubeData, setCubeData }: InteractiveCubeProps) {
  const [activeFace, setActiveFace] = useState<string>("none")
  const [activeCubie, setActiveCubie] = useState<string>("none")
  const [turnDir, setTurnDir] = useState<string>("none")

  const faceRef = useRef<Group>(null)

  const centerColors: Array<[string, string, string]> = [
    ["blue", "blue", "blue"],
    ["green", "green", "green"],
    ["yellow", "yellow", "yellow"],
    ["white", "white", "white"],
    ["red", "red", "red"],
    ["orange", "orange", "orange"],
  ]
  const solvedEdgeColors: Array<[string, string, string]> = [
    ["black", "blue", "yellow"],
    ["orange", "blue", "black"],
    ["black", "blue", "white"],
    ["red", "blue", "black"],
    ["black", "green", "yellow"],
    ["orange", "green", "black"],
    ["black", "green", "white"],
    ["red", "green", "black"],
    ["orange", "black", "yellow"],
    ["red", "black", "yellow"],
    ["orange", "black", "white"],
    ["red", "black", "white"],
  ]

  const solvedCornerColors: Array<[string, string, string]> = [
    ["orange", "blue", "yellow"],
    ["orange", "blue", "white"],
    ["red", "blue", "white"],
    ["red", "blue", "yellow"],
    ["orange", "green", "yellow"],
    ["red", "green", "yellow"],
    ["red", "green", "white"],
    ["orange", "green", "white"],
  ]
  const inputEdgeColors = useMemo(() => cubeData.slice(0, 12), [])
  const inputCornerColors = useMemo(() => cubeData.slice(12, 20), [])

  const [edgeColors, setEdgeColors] = useState<Array<[string, string, string]>>(
    cubeData.length === 0 ? solvedEdgeColors : inputEdgeColors
  )
  const [cornerColors, setCornerColors] = useState<Array<[string, string, string]>>(
    cubeData.length === 0 ? solvedCornerColors : inputCornerColors
  )

  useEffect(() => {
    if (cubeData.length === 0) {
      setEdgeColors(solvedEdgeColors)
      setCornerColors(solvedCornerColors)
    }
  }, [cubeData])

  const edgeCubies = useMemo(
    () =>
      Array(12)
        .fill(0)
        .map((_, i) => (
          <Cubie
            type="edge"
            positionId={i}
            colors={edgeColors[i]}
            key={"e" + i}
            setTurnDir={setTurnDir}
            setActiveCubie={setActiveCubie}
            setLock={setLock}
          />
        )),
    [edgeColors]
  )
  const cornerCubies = useMemo(
    () =>
      Array(8)
        .fill(0)
        .map((_, i) => (
          <Cubie
            type="corner"
            positionId={i}
            colors={cornerColors[i]}
            key={"c" + i}
            setTurnDir={setTurnDir}
            setActiveCubie={setActiveCubie}
            setLock={setLock}
          />
        )),
    [cornerColors]
  )
  const centerCubies = Array(6)
    .fill(0)
    .map((_, i) => (
      <Cubie
        type="center"
        positionId={i}
        colors={centerColors[i]}
        key={"c" + i}
        setTurnDir={setTurnDir}
        setActiveCubie={setActiveCubie}
        setLock={setLock}
      />
    ))

  // Set the active face when the active cubie changes
  useEffect(() => {
    const centerFaces = ["U", "D", "F", "B", "L", "R"]
    const edgeFaces = [
      "UF",
      "RU",
      "UB",
      "LU",
      "DF",
      "RD",
      "DB",
      "LD",
      "RF",
      "LF",
      "RB",
      "LB",
    ]
    const cornerFaces = ["RUF", "RUB", "LUB", "LUF", "RDF", "LDF", "LDB", "RDB"]

    if (activeCubie === "none") {
      return
    }
    const type = activeCubie[0]
    const orientation = activeCubie[1]
    const id = parseInt(activeCubie.substring(2))

    if (type === "e") {
      const face1 = edgeFaces[id][0]
      const face2 = edgeFaces[id][1]

      if (orientation === "x") {
        if (face1 === "R" || face1 == "L") {
          setActiveFace(face1)
        } else if (face2 === "R" || face2 == "L") {
          setActiveFace(face2)
        }
      } else if (orientation === "y") {
        if (face1 === "U" || face1 == "D") {
          setActiveFace(face1)
        } else if (face2 === "U" || face2 == "D") {
          setActiveFace(face2)
        }
      } else if (orientation === "z") {
        if (face1 === "F" || face1 == "B") {
          setActiveFace(face1)
        } else if (face2 === "F" || face2 == "B") {
          setActiveFace(face2)
        }
      }
    } else if (type === "c") {
      const face1 = cornerFaces[id][0]
      const face2 = cornerFaces[id][1]
      const face3 = cornerFaces[id][2]

      if (orientation === "x") {
        if (face1 === "R" || face1 == "L") {
          setActiveFace(face1)
        } else if (face2 === "R" || face2 == "L") {
          setActiveFace(face2)
        } else if (face3 === "R" || face3 == "L") {
          setActiveFace(face3)
        }
      } else if (orientation === "y") {
        if (face1 === "U" || face1 == "D") {
          setActiveFace(face1)
        } else if (face2 === "U" || face2 == "D") {
          setActiveFace(face2)
        } else if (face3 === "U" || face3 == "D") {
          setActiveFace(face3)
        }
      } else if (orientation === "z") {
        if (face1 === "F" || face1 == "B") {
          setActiveFace(face1)
        } else if (face2 === "F" || face2 == "B") {
          setActiveFace(face2)
        } else if (face3 === "F" || face3 == "B") {
          setActiveFace(face3)
        }
      }
    } else if (type === "m") {
      const face = centerFaces[id]
      setActiveFace(face)
    }
  }, [activeCubie])

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

  const faceInds = new Map([
    ["U", 0],
    ["D", 1],
    ["F", 2],
    ["B", 3],
    ["L", 4],
    ["R", 5],
  ])

  const edges = faceEdges.get(activeFace)!
  const corners = faceCorners.get(activeFace)!
  const faceInd = faceInds.get(activeFace)!

  // Actually change the position of colors if the turn goes beyond 45 degrees
  const handlePointerUp = (event: MouseEvent) => {
    event.stopPropagation()
    setActiveCubie("none")
    setActiveFace("none")
    setTurnDir("none")
    setLock(false)
    if (faceRef.current) {
      const rot =
        faceRef.current.userData.rotation > 0
          ? faceRef.current.userData.rotation % (2 * Math.PI)
          : 2 * Math.PI + (faceRef.current.userData.rotation % (2 * Math.PI))

      const rotInd = Math.floor(rot / (Math.PI / 4))
      const face = faceRef.current.name
      const faceReorientation = face === "U" || face === "F" || face === "R" ? -1 : 1
      const rotation =
        rotInd == 0 || rotInd == 7
          ? 0
          : rotInd == 1 || rotInd == 2
          ? 4 - faceReorientation
          : rotInd == 3 || rotInd == 4
          ? 2
          : 4 + faceReorientation

      if (rotation === 0) return

      const edges = faceEdges.get(face)!
      const corners = faceCorners.get(face)!

      const anchor =
        face === "U" || face === "D" ? 1 : face === "F" || face === "B" ? 2 : 0

      setEdgeColors((prev) => {
        const newColors = [...prev]
        for (let i = 0; i < 4; i++) {
          const colors = prev[edges[i]]
          const swap1 = (anchor + 1) % 3
          const swap2 = (anchor + 2) % 3
          const tmp = colors[swap1]
          if (rotation !== 2) {
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
  }

  useEffect(() => {
    const cubeData = edgeColors.concat(cornerColors)
    setCubeData(cubeData)
  }, [edgeColors, cornerColors])

  useEffect(() => {
    window.addEventListener("pointerup", handlePointerUp)
  }, [])

  useFrame(() => {
    const dir = turnDir === "clockwise" ? 1 : turnDir === "counterclockwise" ? -1 : 0
    if (dir === 0) return
    if (faceRef.current) {
      if (activeFace === "U") {
        faceRef.current.rotation.y -= 0.01 * dir
        faceRef.current.userData.rotation = faceRef.current.rotation.y
      } else if (activeFace === "D") {
        faceRef.current.rotation.y += 0.01 * dir
        faceRef.current.userData.rotation = faceRef.current.rotation.y
      } else if (activeFace === "F") {
        faceRef.current.rotation.z -= 0.01 * dir
        faceRef.current.userData.rotation = faceRef.current.rotation.z
      } else if (activeFace === "B") {
        faceRef.current.rotation.z += 0.01 * dir
        faceRef.current.userData.rotation = faceRef.current.rotation.z
      } else if (activeFace === "L") {
        faceRef.current.rotation.x += 0.01 * dir
        faceRef.current.userData.rotation = faceRef.current.rotation.x
      } else if (activeFace === "R") {
        faceRef.current.rotation.x -= 0.01 * dir
        faceRef.current.userData.rotation = faceRef.current.rotation.x
      }
    }
  })

  return (
    <>
      {activeFace !== "none" && (
        <group ref={faceRef} name={activeFace}>
          {edgeCubies.filter((_, i) => edges.includes(i))}
          {cornerCubies.filter((_, i) => corners.includes(i))}
          {centerCubies.filter((_, i) => i === faceInd)}
        </group>
      )}
      {edgeCubies.filter((_, i) => !edges.includes(i))}
      {cornerCubies.filter((_, i) => !corners.includes(i))}
      {centerCubies.filter((_, i) => i !== faceInd)}
    </>
  )
}

type CubieProps = {
  positionId: number
  type: string
  setActiveCubie: (cubie: string) => void
  setTurnDir: (dir: string) => void
  setLock: (lock: boolean) => void
  colors: [string, string, string]
}

function Cubie({
  positionId,
  type,
  setActiveCubie,
  setTurnDir,
  setLock,
  colors,
}: CubieProps) {
  const isCenter = type === "center"
  const isCorner = type === "corner"
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

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    if (event.buttons === 1) {
      setTurnDir("clockwise")
    } else if (event.buttons === 2) {
      setTurnDir("counterclockwise")
    } else {
      return
    }
    const type = isCorner && !isCenter ? "c" : isCenter ? "m" : "e"
    const orientation = event.object.name
    const name = `${type}${orientation}${positionId}`
    setActiveCubie(name)
    setLock(true)
  }

  return (
    <group position={[x, y, z]}>
      <mesh onPointerDown={handlePointerDown} name="x" position={[xc1, yc1, zc1]}>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshStandardMaterial color={colors[0]} />
      </mesh>
      <mesh onPointerDown={handlePointerDown} name="y" position={[xc2, yc2, zc2]}>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshStandardMaterial color={colors[1]} />
      </mesh>
      <mesh onPointerDown={handlePointerDown} name="z" position={[xc3, yc3, zc3]}>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshStandardMaterial color={colors[2]} />
      </mesh>
      <mesh onPointerDown={(event) => event.stopPropagation()} position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="black" />
      </mesh>
    </group>
  )
}

export default InteractiveCube
