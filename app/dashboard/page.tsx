"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Dumbbell, Calendar, Clock, ArrowRight, Plus } from "lucide-react"

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [workouts, setWorkouts] = useState<any[]>([])
  const [schedule, setSchedule] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()

        // Get authenticated user
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) {
          window.location.href = "/login"
          return
        }

        setUser(userData.user)

        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", userData.user.id)
          .single()

        if (profileError) throw profileError
        setProfile(profileData)

        // Get recent workouts
        const { data: workoutsData, error: workoutsError } = await supabase
          .from("workouts")
          .select("*")
          .eq("user_id", userData.user.id)
          .order("created_at", { ascending: false })
          .limit(5)

        if (workoutsError) throw workoutsError
        setWorkouts(workoutsData || [])

        // Get schedule
        const { data: scheduleData, error: scheduleError } = await supabase
          .from("schedules")
          .select("*")
          .eq("user_id", userData.user.id)
          .single()

        if (scheduleError && scheduleError.code !== "PGRST116") throw scheduleError
        setSchedule(scheduleData)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return { category: "Underweight", color: "bg-blue-500" }
    if (bmi < 25) return { category: "Normal weight", color: "bg-green-500" }
    if (bmi < 30) return { category: "Overweight", color: "bg-yellow-500" }
    return { category: "Obese", color: "bg-red-500" }
  }

  const getDayName = (dayIndex: number) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    return days[dayIndex]
  }

  const today = new Date()
  const dayOfWeek = today.getDay()
  const todayName = getDayName(dayOfWeek).toLowerCase()

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">Loading dashboard...</div>
        </div>
      </DashboardLayout>
    )
  }

  const bmiInfo = profile?.bmi ? getBmiCategory(profile.bmi) : { category: "Not calculated", color: "bg-gray-500" }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex items-center gap-2">
            <Link href="/workouts/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" /> New Workout
              </Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Workout</CardTitle>
                  <Dumbbell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {schedule && schedule[todayName] ? (
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">{schedule[todayName]}</div>
                      <Link href={`/workouts/${schedule[todayName]}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          Start Workout <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">Rest Day</div>
                      <p className="text-xs text-muted-foreground">No workout scheduled for today</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">BMI</CardTitle>
                  <div className={`h-2 w-2 rounded-full ${bmiInfo.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{profile?.bmi ? profile.bmi.toFixed(1) : "N/A"}</div>
                  <p className="text-xs text-muted-foreground">{bmiInfo.category}</p>
                  <div className="mt-3">
                    <Progress value={profile?.bmi ? Math.min((profile.bmi / 40) * 100, 100) : 0} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Weight</CardTitle>
                  <div className="text-muted-foreground text-sm">kg</div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{profile?.weight || "N/A"}</div>
                  <p className="text-xs text-muted-foreground">
                    Last updated: {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : "Never"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Workouts Completed</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{workouts.length}</div>
                  <p className="text-xs text-muted-foreground">Total tracked workouts</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Recent Workouts</CardTitle>
                </CardHeader>
                <CardContent>
                  {workouts.length > 0 ? (
                    <div className="space-y-2">
                      {workouts.map((workout) => (
                        <div key={workout.id} className="flex items-center justify-between border-b pb-2">
                          <div>
                            <div className="font-medium">{workout.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(workout.date).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="mr-1 h-4 w-4" />
                              {workout.duration} min
                            </div>
                            <Link href={`/workouts/${workout.id}`}>
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">No workouts recorded yet</p>
                      <Link href="/workouts/create">
                        <Button variant="outline" className="mt-2">
                          Create your first workout
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Weekly Schedule</CardTitle>
                  <CardDescription>Your planned workouts for the week</CardDescription>
                </CardHeader>
                <CardContent>
                  {schedule ? (
                    <div className="space-y-2">
                      {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
                        <div key={day} className="flex items-center justify-between">
                          <div className="font-medium capitalize">{day}</div>
                          <div className="text-sm">
                            {schedule[day] ? (
                              <span className="font-medium">{schedule[day]}</span>
                            ) : (
                              <span className="text-muted-foreground">Rest Day</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">No schedule set up yet</p>
                      <Link href="/schedule">
                        <Button variant="outline" className="mt-2">
                          Create schedule
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Body Measurements</CardTitle>
                <CardDescription>Track your progress over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Weight</div>
                      <div className="text-2xl font-bold">{profile?.weight || "N/A"} kg</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Height</div>
                      <div className="text-2xl font-bold">{profile?.height || "N/A"} cm</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">BMI</div>
                      <div className="text-2xl font-bold">{profile?.bmi ? profile.bmi.toFixed(1) : "N/A"}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Age</div>
                      <div className="text-2xl font-bold">{profile?.age || "N/A"}</div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Link href="/profile">
                      <Button variant="outline">Update Measurements</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Workout Schedule</CardTitle>
                <CardDescription>Plan your workouts for the week</CardDescription>
              </CardHeader>
              <CardContent>
                {schedule ? (
                  <div className="space-y-4">
                    {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
                      <div key={day} className="flex items-center justify-between border-b pb-2">
                        <div className="font-medium capitalize">{day}</div>
                        <div className="flex items-center gap-2">
                          <div>
                            {schedule[day] ? (
                              <span className="font-medium">{schedule[day]}</span>
                            ) : (
                              <span className="text-muted-foreground">Rest Day</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="pt-4">
                      <Link href="/schedule">
                        <Button>Edit Schedule</Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No schedule set up yet</p>
                    <Link href="/schedule">
                      <Button className="mt-2">Create schedule</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

