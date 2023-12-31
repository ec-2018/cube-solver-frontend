import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { OrbitControls as OC } from "three-stdlib"
import { useRef, useState, useEffect } from "react"

import BlankCube from "./components/BlankCube"
import InteractiveCube from "./components/InteractiveCube"
import AnimatedCube, { AnimRef } from "./components/AnimatedCube"

import ResetIcon from "./assets/reset.svg?react"
import InputIcon from "./assets/input.svg?react"
import ScrambleIcon from "./assets/scramble.svg?react"

import ReplayIcon from "./assets/replay.svg?react"
import BackIcon from "./assets/back.svg?react"
import NextIcon from "./assets/next.svg?react"

function App() {
  const animRef = useRef<AnimRef>(null)
  const controlRef = useRef<OC>(null)

  const [lock, setLock] = useState(false)
  const [mode, setMode] = useState("interactive")
  const [cubeData, setCubeData] = useState<Array<[string, string, string]>>([])
  const [sequence, setSequence] = useState<Array<string>>([])
  const [step, setStep] = useState(0)
  const [animateForward, setAnimateForward] = useState(false)
  const [animateBackward, setAnimateBackward] = useState(false)

  const [activeColor, setActiveColor] = useState("blue")

  useEffect(() => {
    if (controlRef.current) {
      controlRef.current.enabled = !lock
    }
  }, [lock])

  const reset = () => {
    setCubeData([])
    setSequence([])
    setMode("interactive")
    setStep(0)
    setBackDisable(true)
    setForDisable(sequence.length === 0)
  }

  const repeat = () => {
    if (animRef.current) {
      animRef.current.repeatAnimation()
    }
  }

  const [forDisable, setForDisable] = useState(sequence.length === 0)
  const stepForward = () => {
    if (animRef.current) {
      animRef.current.stepforward()
      setStep(animRef.current.step + 1)
      if (animRef.current.step + 1 === sequence.length) {
        setForDisable(true)
      } else {
        setBackDisable(false)
      }
    }
    setAnimateForward(true)
    setAnimateBackward(false)

    setTimeout(() => {
      setAnimateForward(false)
    }, 1000)
  }

  const [backDisable, setBackDisable] = useState(true)
  const stepBackward = () => {
    if (animRef.current) {
      animRef.current.rollback()
      setStep(animRef.current.step - 1)
      if (animRef.current.step - 1 === 0) {
        setBackDisable(true)
      } else {
        setForDisable(false)
      }
    }
    setAnimateBackward(true)
    setAnimateForward(false)

    setTimeout(() => {
      setAnimateBackward(false)
    }, 1000)
  }

  const solve = async () => {
    setMode("loading")
    const data = await fetch("https://cube-solver-backend.fly.dev/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cubeData),
    })
    const res = await data.json()

    if (typeof res === "string") {
      alert(res)
      setMode("input")
      return
    }
    setSequence(res)
    setMode("animation")
  }

  useEffect(() => {
    setForDisable(sequence.length === 0)
  }, [sequence])

  const scramble = () => {
    const moves = ["F", "B", "R", "L", "U", "D"]
    const scramble = []
    for (let i = 0; i < 20; i++) {
      const move = moves[Math.floor(Math.random() * moves.length)]
      const dir = Math.random() > 0.5 ? "" : "'"
      scramble.push(move + dir)
    }
    setSequence(scramble)
    setMode("scramble")
  }

  const finishScramble = () => {
    setMode("interactive")
  }

  return (
    <div className="relative h-screen w-screen bg-gray-100 dark:bg-zinc-800">
      <div className="flex h-20 flex-row items-center justify-evenly pt-2 sm:h-24 sm:pt-4 md:h-28">
        {mode === "interactive" && (
          <button
            className="h-full transition duration-200 hover:scale-110 active:scale-105"
            title="Input Mode"
            onClick={() => setMode("input")}
          >
            <InputIcon className="h-full" />
          </button>
        )}
        {mode === "interactive" && (
          <button
            className="h-full transition duration-200 hover:scale-110 active:scale-105"
            title="Scramble"
            onClick={scramble}
          >
            <ScrambleIcon className="h-full" />
          </button>
        )}

        <button
          className="h-full transition duration-200 hover:scale-110 active:scale-105"
          title="Reset"
          onClick={reset}
        >
          <ResetIcon className="h-full" />
        </button>
      </div>

      {mode === "input" && (
        <div className="absolute right-2 top-1/4 z-10 flex flex-col justify-evenly sm:right-8 md:right-16 lg:right-32 xl:right-1/4 2xl:right-1/3">
          <button
            title="red"
            className={`shadow-m m-1 transition duration-200 hover:scale-110 active:scale-105 ${
              activeColor === "red" ? "scale-110 shadow-xl" : "scale-100"
            }`}
            onClick={() => setActiveColor("red")}
          >
            <div className="h-10 w-10 rounded-lg bg-red-600" />
          </button>
          <button
            title="green"
            className={`shadow-m m-1 transition duration-200 hover:scale-110 active:scale-105 ${
              activeColor === "green" ? "scale-110 shadow-xl" : "scale-100"
            }`}
            onClick={() => setActiveColor("green")}
          >
            <div className="h-10 w-10 rounded-lg bg-green-600" />
          </button>
          <button
            title="orange"
            className={`shadow-m m-1 transition duration-200 hover:scale-110 active:scale-105 ${
              activeColor === "orange" ? "scale-110 shadow-xl" : "scale-100"
            }`}
            onClick={() => setActiveColor("orange")}
          >
            <div className="h-10 w-10 rounded-lg bg-orange-600" />
          </button>
          <button
            title="white"
            className={`shadow-m m-1 transition duration-200 hover:scale-110 active:scale-105 ${
              activeColor === "white" ? "scale-110 shadow-xl" : "scale-100"
            }`}
            onClick={() => setActiveColor("white")}
          >
            <div className="h-10 w-10 rounded-lg bg-white" />
          </button>
          <button
            title="blue"
            className={`shadow-m m-1 transition duration-200 hover:scale-110 active:scale-105 ${
              activeColor === "blue" ? "scale-110 shadow-xl" : "scale-100"
            }`}
            onClick={() => setActiveColor("blue")}
          >
            <div className="h-10 w-10 rounded-lg bg-blue-600" />
          </button>
          <button
            title="yellow"
            className={`shadow-m m-1 transition duration-200 hover:scale-110 active:scale-105 ${
              activeColor === "yellow" ? "scale-110 shadow-xl" : "scale-100"
            }`}
            onClick={() => setActiveColor("yellow")}
          >
            <div className="h-10 w-10 rounded-lg bg-yellow-400" />
          </button>
        </div>
      )}

      <div className="w-min-[30rem] m-auto h-3/5 w-full cursor-pointer">
        <Canvas camera={{ position: [3, 3, 3] }}>
          <OrbitControls
            minPolarAngle={0}
            maxPolarAngle={Math.PI}
            ref={controlRef}
            enablePan={false}
            enableZoom={false}
          />
          <ambientLight intensity={0.5} />
          {mode === "interactive" && (
            <InteractiveCube cubeData={cubeData} setLock={setLock} setCubeData={setCubeData} />
          )}
          {(mode === "animation" || mode === "loading") && (
            <AnimatedCube
              cubeData={cubeData}
              sequence={sequence}
              playFull={false}
              ref={animRef}
              setCubeData={setCubeData}
            />
          )}
          {mode === "input" && (
            <BlankCube setCubeData={setCubeData} activeColor={activeColor} />
          )}
          {mode === "scramble" && (
            <AnimatedCube
              cubeData={cubeData}
              sequence={sequence}
              playFull={true}
              finishSequence={finishScramble}
              ref={animRef}
              setCubeData={setCubeData}
            />
          )}
        </Canvas>
      </div>
      {(mode === "interactive" || mode === "input") && (
        <div className="mx-auto w-fit">
          <button
            className="rounded-md bg-white px-8 py-3 font-semibold shadow-lg transition duration-200 hover:scale-110 active:scale-105 active:bg-gray-200"
            onClick={solve}
          >
            Solve
          </button>
        </div>
      )}

      {mode === "animation" && (
        <div className="h-fit">
          <div className="flex h-20 flex-row justify-center">
            <div className="relative flex h-full w-5/6 max-w-lg select-none flex-row overflow-hidden rounded-lg bg-white shadow-lg">
              <div className="absolute left-0 top-0 z-10 flex h-full w-1/5 justify-center bg-white">
                <button
                  className=" fill-black transition duration-200 hover:scale-110 active:scale-105 disabled:scale-100 disabled:fill-gray-400"
                  onClick={stepBackward}
                  disabled={backDisable}
                >
                  <BackIcon className="fill-inherit" />
                </button>
              </div>
              <div className="absolute right-0 top-0 z-10 flex h-full w-1/5 justify-center bg-white ">
                <button
                  className="fill-black transition duration-200 hover:scale-110 active:scale-105 disabled:scale-100 disabled:fill-gray-400"
                  onClick={stepForward}
                  disabled={forDisable}
                >
                  <NextIcon className="fill-inherit" />
                </button>
              </div>
              <div
                title={sequence.toString()}
                className="absolute left-[20%] top-0 z-10 h-full w-1/5 bg-gradient-to-r from-white"
              />
              <div
                title={sequence.toString()}
                className="absolute right-[20%] top-0 z-10 h-full w-1/5 bg-gradient-to-l from-white"
              />
              {step < 1 && (
                <div
                  className={`flex h-full w-1/5 items-center 
              ${animateForward ? "animate-[slide_1s_ease]" : ""}
              ${animateBackward ? "animate-[slideback_1s_ease]" : ""}
              bg-white`}
                >
                  <div className="flex w-full justify-center font-bold text-black" />
                </div>
              )}
              {step < 2 && (
                <div
                  className={`flex h-full w-1/5 items-center 
              ${animateForward ? "animate-[slide_1s_ease]" : ""}
              ${animateBackward ? "animate-[slideback_1s_ease]" : ""}
              bg-white`}
                >
                  <p className="flex w-full justify-center font-bold text-black"></p>
                </div>
              )}
              {sequence.map(
                (move, i) =>
                  i >= step - 2 &&
                  i <= step + 2 && (
                    <div
                      key={i}
                      className={`flex h-full w-1/5 items-center 
                  ${animateForward ? "animate-[slide_1s_ease]" : ""}
                  ${animateBackward ? "animate-[slideback_1s_ease]" : ""}
                  bg-white`}
                      title={sequence.toString()}
                    >
                      <p className="flex w-full justify-center text-3xl font-bold text-black">
                        {move}
                      </p>
                    </div>
                  )
              )}
            </div>
          </div>
          <div className="m-auto my-6 w-fit">
            <button
              className="transition duration-200 hover:scale-110 active:scale-105"
              onClick={repeat}
            >
              <ReplayIcon className="h-8 fill-black drop-shadow-lg dark:fill-white sm:h-10 md:h-12" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
