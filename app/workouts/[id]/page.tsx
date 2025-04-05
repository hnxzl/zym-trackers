"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard-layout"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, Dumbbell, Clock, Calendar, Play, Trash2 } from "lucide-react"

export default function WorkoutDetails({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [workout, setWorkout] = useState<any>(null)

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
          data.exercises = JSON.parse(data.exercises)
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
  }, [params.id, router])

  const deleteWorkout = async () => {
    if (!confirm("Are you sure you want to delete this workout?")) {
      return
    }

    try {
      setLoading(true)
      const supabase = createClient()

      const { error } = await supabase.from("workouts").delete().eq("id", params.id)

      if (error) throw error

      router.push("/workouts")
    } catch (error) {
      console.error("Error deleting workout:", error)
      alert("Failed to delete workout. Please try again.")
    } finally {
      setLoading(false)
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

  if (!workout) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">Workout not found</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={() => router.push("/workouts")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h2 className="ml-4 text-3xl font-bold tracking-tight">{workout.name}</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Workout Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Created: {new Date(workout.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Duration: {workout.duration} minutes</span>
              </div>
              <div className="flex items-center">
                <Dumbbell className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Exercises: {workout.exercises.length}</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={deleteWorkout}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
              <Link href={`/workouts/${params.id}/start`}>
                <Button>
                  <Play className="mr-2 h-4 w-4" />
                  Start Workout
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Exercises</CardTitle>
              <CardDescription>List of exercises in this workout</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workout.exercises.map((exercise: any, index: number) => (
                  <Card key={`${exercise.id}-${index}`}>
                    <CardHeader className="p-4">
                      <CardTitle className="text-lg">{exercise.name}</CardTitle>
                      <CardDescription>
                        {exercise.bodyPart} | {exercise.equipment} | {exercise.target}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="font-medium">Sets</div>
                        <div className="font-medium">Reps</div>
                        <div className="font-medium">Rest</div>
                      </div>
                      {exercise.sets.map((set: any, setIndex: number) => (
                        <div key={setIndex} className="grid grid-cols-3 gap-2 text-sm border-b py-2">
                          <div>{setIndex + 1}</div>
                          <div>{set.reps}</div>
                          <div>{set.rest} sec</div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

