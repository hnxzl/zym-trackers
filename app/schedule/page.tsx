"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardLayout } from "@/components/dashboard-layout"
import { createClient } from "@/lib/supabase/client"
import { Save } from "lucide-react"

export default function Schedule() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [workouts, setWorkouts] = useState<any[]>([])
  const [schedule, setSchedule] = useState<any>({
    monday: null,
    tuesday: null,
    wednesday: null,
    thursday: null,
    friday: null,
    saturday: null,
    sunday: null,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()

        // Get authenticated user
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) {
          router.push("/login")
          return
        }

        setUser(userData.user)

        // Get user workouts
        const { data: workoutsData, error: workoutsError } = await supabase
          .from("workouts")
          .select("id, name")
          .eq("user_id", userData.user.id)

        if (workoutsError) throw workoutsError
        setWorkouts(workoutsData || [])

        // Get schedule
        const { data: scheduleData, error: scheduleError } = await supabase
          .from("schedules")
          .select("*")
          .eq("user_id", userData.user.id)
          .single()

        if (scheduleData) {
          setSchedule({
            monday: scheduleData.monday,
            tuesday: scheduleData.tuesday,
            wednesday: scheduleData.wednesday,
            thursday: scheduleData.thursday,
            friday: scheduleData.friday,
            saturday: scheduleData.saturday,
            sunday: scheduleData.sunday,
          })
        } else if (scheduleError && scheduleError.code !== "PGRST116") {
          throw scheduleError
        }
      } catch (error) {
        console.error("Error fetching schedule data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleDayChange = (day: string, value: string | null) => {
    setSchedule({
      ...schedule,
      [day]: value,
    })
  }

  const saveSchedule = async () => {
    if (!user) {
      alert("You must be logged in to save a schedule")
      return
    }

    try {
      setSaving(true)
      const supabase = createClient()

      // Check if schedule exists
      const { data: existingSchedule, error: checkError } = await supabase
        .from("schedules")
        .select("id")
        .eq("user_id", user.id)
        .single()

      if (checkError && checkError.code !== "PGRST116") throw checkError

      if (existingSchedule) {
        // Update existing schedule
        const { error: updateError } = await supabase
          .from("schedules")
          .update({
            monday: schedule.monday,
            tuesday: schedule.tuesday,
            wednesday: schedule.wednesday,
            thursday: schedule.thursday,
            friday: schedule.friday,
            saturday: schedule.saturday,
            sunday: schedule.sunday,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingSchedule.id)

        if (updateError) throw updateError
      } else {
        // Create new schedule
        const { error: insertError } = await supabase.from("schedules").insert([
          {
            user_id: user.id,
            monday: schedule.monday,
            tuesday: schedule.tuesday,
            wednesday: schedule.wednesday,
            thursday: schedule.thursday,
            friday: schedule.friday,
            saturday: schedule.saturday,
            sunday: schedule.sunday,
          },
        ])

        if (insertError) throw insertError
      }

      router.push("/dashboard")
    } catch (error) {
      console.error("Error saving schedule:", error)
      alert("Failed to save schedule. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">Loading schedule...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Weekly Schedule</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Plan Your Week</CardTitle>
            <CardDescription>Assign workouts to specific days of the week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
                <div key={day} className="flex items-center gap-4">
                  <div className="w-24 font-medium capitalize">{day}</div>
                  <Select
                    value={schedule[day] || ""}
                    onValueChange={(value) => handleDayChange(day, value === "" ? null : value)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Rest Day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rest">Rest Day</SelectItem>
                      {workouts.map((workout) => (
                        <SelectItem key={workout.id} value={workout.name}>
                          {workout.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={saveSchedule} disabled={saving} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Schedule"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Overview</CardTitle>
            <CardDescription>Visual representation of your workout week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => {
                const fullDay = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"][index]
                const hasWorkout = schedule[fullDay] !== null

                return (
                  <div key={day} className="text-center">
                    <div className="font-medium mb-2">{day}</div>
                    <div
                      className={`rounded-md p-2 h-24 flex items-center justify-center ${hasWorkout ? "bg-primary/10" : "bg-muted"}`}
                    >
                      {hasWorkout ? (
                        <div className="text-sm font-medium">{schedule[fullDay]}</div>
                      ) : (
                        <div className="text-sm text-muted-foreground">Rest</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

