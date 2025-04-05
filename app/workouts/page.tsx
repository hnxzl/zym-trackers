"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardLayout } from "@/components/dashboard-layout"
import { createClient } from "@/lib/supabase/client"
import { Dumbbell, Plus, Search, Clock, Calendar } from "lucide-react"

export default function Workouts() {
  const [workouts, setWorkouts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const supabase = createClient()

        // Get authenticated user
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) {
          window.location.href = "/login"
          return
        }

        // Get user workouts
        const { data, error } = await supabase
          .from("workouts")
          .select("*")
          .eq("user_id", userData.user.id)
          .order("created_at", { ascending: false })

        if (error) throw error
        setWorkouts(data || [])
      } catch (error) {
        console.error("Error fetching workouts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchWorkouts()
  }, [])

  const filteredWorkouts = workouts.filter((workout) => workout.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Workouts</h2>
          <Link href="/workouts/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Workout
            </Button>
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search workouts..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Workouts</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">Loading workouts...</div>
            ) : filteredWorkouts.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredWorkouts.map((workout) => (
                  <Card key={workout.id}>
                    <CardHeader>
                      <CardTitle>{workout.name}</CardTitle>
                      <CardDescription>
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-1 h-4 w-4" />
                          {new Date(workout.date).toLocaleDateString()}
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm">
                        <Clock className="mr-1 h-4 w-4" />
                        {workout.duration} minutes
                      </div>
                      <div className="mt-2 text-sm">
                        {workout.exercises ? `${JSON.parse(workout.exercises).length} exercises` : "No exercises"}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Link href={`/workouts/${workout.id}`}>
                        <Button variant="outline">View Details</Button>
                      </Link>
                      <Link href={`/workouts/${workout.id}/start`}>
                        <Button>
                          <Dumbbell className="mr-2 h-4 w-4" />
                          Start
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Dumbbell className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No workouts found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {searchTerm ? "Try a different search term" : "Create your first workout to get started"}
                </p>
                {!searchTerm && (
                  <Link href="/workouts/create">
                    <Button className="mt-4">
                      <Plus className="mr-2 h-4 w-4" /> Create Workout
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">Loading workouts...</div>
            ) : workouts.slice(0, 5).length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {workouts.slice(0, 5).map((workout) => (
                  <Card key={workout.id}>
                    <CardHeader>
                      <CardTitle>{workout.name}</CardTitle>
                      <CardDescription>
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-1 h-4 w-4" />
                          {new Date(workout.date).toLocaleDateString()}
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm">
                        <Clock className="mr-1 h-4 w-4" />
                        {workout.duration} minutes
                      </div>
                      <div className="mt-2 text-sm">
                        {workout.exercises ? `${JSON.parse(workout.exercises).length} exercises` : "No exercises"}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Link href={`/workouts/${workout.id}`}>
                        <Button variant="outline">View Details</Button>
                      </Link>
                      <Link href={`/workouts/${workout.id}/start`}>
                        <Button>
                          <Dumbbell className="mr-2 h-4 w-4" />
                          Start
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Dumbbell className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No recent workouts</h3>
                <p className="mt-2 text-sm text-muted-foreground">Create your first workout to get started</p>
                <Link href="/workouts/create">
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" /> Create Workout
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites" className="space-y-4">
            <div className="text-center py-8">
              <Dumbbell className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No favorite workouts yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">Mark workouts as favorites to see them here</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

