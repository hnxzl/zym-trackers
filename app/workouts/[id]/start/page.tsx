"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { DashboardLayout } from "@/components/dashboard-layout"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, ArrowRight, Check, Clock, Pause, Play, X } from "lucide-react"

export default function StartWorkout({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [workout, setWorkout] = useState<any>(null)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [currentSetIndex, setCurrentSetIndex] = useState(0)
  const [completedSets, setCompletedSets] = useState<Record<string, boolean[][]>>({})
  const [restTimer, setRestTimer] = useState(0)
  const [isResting, setIsResting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        const supabase = createClient()

        // Get authenticated user
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) {
          router.push("/login")
          return
        }

        // Get workout by ID
        const { data, error } = await supabase.from("workouts").select("*").eq("id", params.id).single()

        if (error) throw error

        // Parse exercises JSON
        if (data.exercises) {
          const exercises = JSON.parse(data.exercises)
          data.exercises = exercises

          // Initialize completed sets tracking
          const initialCompletedSets: Record<string, boolean[][]> = {}
          exercises.forEach((exercise: any, exerciseIndex: number) => {
            initialCompletedSets[exerciseIndex] = exercise.sets.map(() => false)
          })
          setCompletedSets(initialCompletedSets)
        } else {
          data.exercises = []
        }

        setWorkout(data)
      } catch (error) {
        console.error("Error fetching workout:", error)
        router.push("/workouts")
      } finally {
        setLoading(false)
      }
    }

    fetchWorkout()

    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [params.id, router])

  useEffect(() => {
    if (isResting && !isPaused) {
      timerRef.current = setInterval(() => {
        setRestTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current as NodeJS.Timeout)
            setIsResting(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isResting, isPaused])

  const startRest = (duration: number) => {
    setRestTimer(duration)
    setIsResting(true)
    setIsPaused(false)
  }

  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  const markSetCompleted = (completed: boolean) => {
    const updatedCompletedSets = { ...completedSets }
    updatedCompletedSets[currentExerciseIndex][currentSetIndex] = completed
    setCompletedSets(updatedCompletedSets)

    // If there are more sets, start rest timer and move to next set
    const currentExercise = workout.exercises[currentExerciseIndex]
    if (currentSetIndex < currentExercise.sets.length - 1) {
      startRest(currentExercise.sets[currentSetIndex].rest)
      setCurrentSetIndex(currentSetIndex + 1)
    } else {
      // If there are more exercises, move to the next exercise
      if (currentExerciseIndex < workout.exercises.length - 1) {
        setCurrentExerciseIndex(currentExerciseIndex + 1)
        setCurrentSetIndex(0)
      } else {
        // Workout completed
        alert("Workout completed!")
        router.push(`/workouts/${params.id}`)
      }
    }
  }

  const nextExercise = () => {
    if (currentExerciseIndex < workout.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1)
      setCurrentSetIndex(0)
    }
  }

  const previousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1)
      setCurrentSetIndex(0)
    }
  }

  const endWorkout = () => {
    if (confirm("Are you sure you want to end this workout?")) {
      router.push(`/workouts/${params.id}`)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">Loading workout...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (!workout || !workout.exercises || workout.exercises.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">Workout not found or has no exercises</div>
        </div>
      </DashboardLayout>
    )
  }

  const currentExercise = workout.exercises[currentExerciseIndex]
  const currentSet = currentExercise.sets[currentSetIndex]
  const exerciseProgress = (currentExerciseIndex / workout.exercises.length) * 100
  const setProgress = (currentSetIndex / currentExercise.sets.length) * 100

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">{workout.name}</h2>
          <Button variant="outline" onClick={endWorkout}>
            <X className="mr-2 h-4 w-4" />
            End Workout
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    Exercise {currentExerciseIndex + 1} of {workout.exercises.length}
                  </CardTitle>
                  <CardDescription>
                    Set {currentSetIndex + 1} of {currentExercise.sets.length}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={previousExercise} disabled={currentExerciseIndex === 0}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextExercise}
                    disabled={currentExerciseIndex === workout.exercises.length - 1}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <h3 className="text-2xl font-bold">{currentExercise.name}</h3>
                <p className="text-muted-foreground">
                  {currentExercise.bodyPart} | {currentExercise.equipment}
                </p>
              </div>

              <div className="flex justify-center">
                <img
                  src={currentExercise.gifUrl || "/placeholder.svg?height=200&width=200"}
                  alt={currentExercise.name}
                  className="h-48 w-48 object-cover rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="rounded-lg bg-muted p-3">
                  <div className="text-sm font-medium text-muted-foreground">Reps</div>
                  <div className="text-2xl font-bold">{currentSet.reps}</div>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <div className="text-sm font-medium text-muted-foreground">Weight</div>
                  <div className="text-2xl font-bold">{currentSet.weight} kg</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Exercise Progress</span>
                  <span>
                    {currentExerciseIndex + 1}/{workout.exercises.length}
                  </span>
                </div>
                <Progress value={exerciseProgress} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Set Progress</span>
                  <span>
                    {currentSetIndex + 1}/{currentExercise.sets.length}
                  </span>
                </div>
                <Progress value={setProgress} className="h-2" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => markSetCompleted(false)}>
                <X className="mr-2 h-4 w-4" />
                Skip
              </Button>
              <Button onClick={() => markSetCompleted(true)}>
                <Check className="mr-2 h-4 w-4" />
                Complete
              </Button>
            </CardFooter>
          </Card>

          <div className="space-y-4">
            <Card className={isResting ? "border-primary" : ""}>
              <CardHeader>
                <CardTitle>Rest Timer</CardTitle>
                <CardDescription>
                  {isResting ? "Time until next set" : "Complete a set to start the timer"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isResting ? (
                  <>
                    <div className="flex items-center justify-center">
                      <div className="text-5xl font-bold">
                        {Math.floor(restTimer / 60)}:{(restTimer % 60).toString().padStart(2, "0")}
                      </div>
                    </div>
                    <Progress value={(restTimer / currentSet.rest) * 100} className="h-2" />
                    <div className="flex justify-center">
                      <Button variant="outline" onClick={togglePause}>
                        {isPaused ? (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Resume
                          </>
                        ) : (
                          <>
                            <Pause className="mr-2 h-4 w-4" />
                            Pause
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center text-muted-foreground">
                      <Clock className="mx-auto h-12 w-12 mb-2" />
                      <p>Rest timer will start after completing a set</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Workout Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {workout.exercises.map((exercise: any, exerciseIndex: number) => (
                    <div key={exerciseIndex} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{exercise.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {completedSets[exerciseIndex]?.filter(Boolean).length || 0}/{exercise.sets.length} sets
                        </div>
                      </div>
                      <Progress
                        value={
                          ((completedSets[exerciseIndex]?.filter(Boolean).length || 0) / exercise.sets.length) * 100
                        }
                        className="h-1"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

