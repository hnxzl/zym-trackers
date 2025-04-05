"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/dashboard-layout";
import { createClient } from "@/lib/supabase/client";
import {
  getAllExercises,
  getExercisesByBodyPart,
  getFallbackExercises,
} from "@/lib/exercise-api";
import { Search, Plus, Trash2, Save, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Define the Exercise interface consistently for the entire component
interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  target: string;
  gifUrl: string;
  secondaryMuscles: string[]; // Make this required, not optional
  instructions: string[]; // Make this required, not optional
}

// Define the sets structure separately for clarity
interface ExerciseSet {
  reps: number;
  weight: number;
  rest: number;
}

// Use the Exercise interface as a base for ExerciseWithSets
interface ExerciseWithSets extends Exercise {
  sets: ExerciseSet[];
}

export default function CreateWorkout() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<
    ExerciseWithSets[]
  >([]);
  const [workoutName, setWorkoutName] = useState("");
  const [user, setUser] = useState<any>(null);
  const [loadingExercises, setLoadingExercises] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.getUser();

        if (error) throw error;

        if (!data.user) {
          router.push("/login");
          return;
        }

        setUser(data.user);
      } catch (error) {
        console.error("Error checking user:", error);
        router.push("/login");
      } finally {
        setInitialLoading(false);
      }
    };

    checkUser();
    fetchExercises();
  }, [router]);

  useEffect(() => {
    if (exercises.length > 0 && searchTerm) {
      const filtered = exercises.filter(
        (exercise) =>
          exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exercise.bodyPart.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exercise.equipment.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exercise.target.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredExercises(filtered);
    } else {
      setFilteredExercises(exercises);
    }
  }, [searchTerm, exercises]);

  const fetchExercises = async () => {
    try {
      setLoadingExercises(true);

      // Try to fetch from the API
      let exercisesData = await getAllExercises();

      // If API fails or returns empty, use fallback data
      if (!exercisesData || exercisesData.length === 0) {
        exercisesData = getFallbackExercises();
      }

      // Ensure the data conforms to our Exercise interface
      const typedExercises: Exercise[] = exercisesData.map((ex) => ({
        ...ex,
        // Ensure these properties are always arrays, even if they're undefined in the source data
        secondaryMuscles: ex.secondaryMuscles || [],
        instructions: ex.instructions || [],
      }));

      setExercises(typedExercises);
      setFilteredExercises(typedExercises);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      // Use fallback data if API fails
      const fallbackData = getFallbackExercises();

      // Ensure the fallback data conforms to our Exercise interface
      const typedFallbackData: Exercise[] = fallbackData.map((ex) => ({
        ...ex,
        secondaryMuscles: ex.secondaryMuscles || [],
        instructions: ex.instructions || [],
      }));

      setExercises(typedFallbackData);
      setFilteredExercises(typedFallbackData);
    } finally {
      setLoadingExercises(false);
    }
  };

  const fetchExercisesByBodyPart = async (bodyPart: string) => {
    try {
      setLoadingExercises(true);

      if (bodyPart === "all") {
        // For "all" tab, show all exercises
        setFilteredExercises(exercises);
      } else {
        // Try to fetch from the API
        let exercisesData = await getExercisesByBodyPart(bodyPart);

        // If API fails or returns empty, filter from existing exercises
        if (!exercisesData || exercisesData.length === 0) {
          exercisesData = exercises.filter((ex) => ex.bodyPart === bodyPart);
        }

        // Ensure the data conforms to our Exercise interface
        const typedExercises: Exercise[] = exercisesData.map((ex) => ({
          ...ex,
          secondaryMuscles: ex.secondaryMuscles || [],
          instructions: ex.instructions || [],
        }));

        setFilteredExercises(typedExercises);
      }
    } catch (error) {
      console.error(`Error fetching exercises for ${bodyPart}:`, error);
      // Filter from existing exercises if API fails
      const filtered = exercises.filter((ex) => ex.bodyPart === bodyPart);
      setFilteredExercises(filtered);
    } finally {
      setLoadingExercises(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "all") {
      setFilteredExercises(exercises);
    } else {
      fetchExercisesByBodyPart(value);
    }
  };

  const addExercise = (exercise: Exercise) => {
    const exerciseWithSets: ExerciseWithSets = {
      ...exercise,
      sets: [{ reps: 10, weight: 0, rest: 60 }],
    };
    setSelectedExercises([...selectedExercises, exerciseWithSets]);
  };

  const removeExercise = (index: number) => {
    const updated = [...selectedExercises];
    updated.splice(index, 1);
    setSelectedExercises(updated);
  };

  const addSet = (exerciseIndex: number) => {
    const updated = [...selectedExercises];
    const lastSet =
      updated[exerciseIndex].sets[updated[exerciseIndex].sets.length - 1];
    updated[exerciseIndex].sets.push({ ...lastSet });
    setSelectedExercises(updated);
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const updated = [...selectedExercises];
    if (updated[exerciseIndex].sets.length > 1) {
      updated[exerciseIndex].sets.splice(setIndex, 1);
      setSelectedExercises(updated);
    }
  };

  const updateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: "reps" | "weight" | "rest",
    value: number
  ) => {
    const updated = [...selectedExercises];
    updated[exerciseIndex].sets[setIndex][field] = value;
    setSelectedExercises(updated);
  };

  const calculateDuration = () => {
    let totalSeconds = 0;

    selectedExercises.forEach((exercise) => {
      // Estimate time for each set (including rest)
      exercise.sets.forEach((set) => {
        // Assume 30 seconds per set for the exercise
        totalSeconds += 30;

        // Add rest time
        totalSeconds += set.rest;
      });
    });

    // Convert to minutes and round up
    return Math.ceil(totalSeconds / 60);
  };

  const saveWorkout = async () => {
    if (!workoutName.trim()) {
      toast({
        title: "Missing workout name",
        description: "Please enter a name for your workout",
        variant: "destructive",
      });
      return;
    }

    if (selectedExercises.length === 0) {
      toast({
        title: "No exercises selected",
        description: "Please add at least one exercise to your workout",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to save a workout",
        variant: "destructive",
      });
      return;
    }

    // Updated catch block for the saveWorkout function with improved error logging
    try {
      setLoading(true);
      const supabase = createClient();

      const duration = calculateDuration();

      const { data, error } = await supabase
        .from("workouts")
        .insert([
          {
            user_id: user.id,
            name: workoutName,
            date: new Date().toISOString(),
            duration: duration,
            exercises: JSON.stringify(selectedExercises),
            created_at: new Date().toISOString(),
            is_favorite: false,
          },
        ])
        .select();

      if (error) {
        console.error("Supabase raw error:", error);
        console.error(
          "Supabase full error string:",
          JSON.stringify(error, null, 2)
        );

        throw new Error(error.message || "Unknown Supabase error");
      }

      toast({
        title: "Workout saved",
        description: "Your workout has been saved successfully",
      });

      router.push("/workouts");
    } catch (error: unknown) {
      // Type-safe error logging with better object handling
      console.error("Error saving workout:", error);

      // For toast notification, ensure we have a proper error description
      let errorMessage: string;

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "object" && error !== null) {
        try {
          // Try to convert the error object to a meaningful string
          errorMessage = JSON.stringify(error);
        } catch {
          errorMessage = "Unknown error occurred";
        }
      } else {
        errorMessage = String(error);
      }

      toast({
        title: "Error saving workout",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/workouts")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h2 className="ml-4 text-3xl font-bold tracking-tight">
            Create Workout
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Workout Details</CardTitle>
                <CardDescription>
                  Name your workout and add exercises
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="workout-name">Workout Name</Label>
                    <Input
                      id="workout-name"
                      placeholder="e.g., Upper Body Strength"
                      value={workoutName}
                      onChange={(e) => setWorkoutName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Selected Exercises ({selectedExercises.length})
                    </Label>
                    {selectedExercises.length > 0 ? (
                      <div className="space-y-4">
                        {selectedExercises.map((exercise, exerciseIndex) => (
                          <Card key={`${exercise.id}-${exerciseIndex}`}>
                            <CardHeader className="p-4">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">
                                  {exercise.name}
                                </CardTitle>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeExercise(exerciseIndex)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <CardDescription>
                                {exercise.bodyPart} | {exercise.equipment} |{" "}
                                {exercise.target}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                              <div className="space-y-2">
                                <Label>Sets</Label>
                                {exercise.sets.map((set, setIndex) => (
                                  <div
                                    key={setIndex}
                                    className="flex items-center gap-2"
                                  >
                                    <div className="w-8 text-center font-medium">
                                      {setIndex + 1}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                      <div className="grid grid-cols-3 gap-2">
                                        <div>
                                          <Label
                                            htmlFor={`reps-${exerciseIndex}-${setIndex}`}
                                            className="text-xs"
                                          >
                                            Reps
                                          </Label>
                                          <Input
                                            id={`reps-${exerciseIndex}-${setIndex}`}
                                            type="number"
                                            min="1"
                                            value={set.reps}
                                            onChange={(e) =>
                                              updateSet(
                                                exerciseIndex,
                                                setIndex,
                                                "reps",
                                                Number.parseInt(
                                                  e.target.value
                                                ) || 0
                                              )
                                            }
                                            className="h-8"
                                          />
                                        </div>
                                        <div>
                                          <Label
                                            htmlFor={`weight-${exerciseIndex}-${setIndex}`}
                                            className="text-xs"
                                          >
                                            Weight
                                          </Label>
                                          <Input
                                            id={`weight-${exerciseIndex}-${setIndex}`}
                                            type="number"
                                            min="0"
                                            value={set.weight}
                                            onChange={(e) =>
                                              updateSet(
                                                exerciseIndex,
                                                setIndex,
                                                "weight",
                                                Number.parseInt(
                                                  e.target.value
                                                ) || 0
                                              )
                                            }
                                            className="h-8"
                                          />
                                        </div>
                                        <div>
                                          <Label
                                            htmlFor={`rest-${exerciseIndex}-${setIndex}`}
                                            className="text-xs"
                                          >
                                            Rest (sec)
                                          </Label>
                                          <Input
                                            id={`rest-${exerciseIndex}-${setIndex}`}
                                            type="number"
                                            min="0"
                                            value={set.rest}
                                            onChange={(e) =>
                                              updateSet(
                                                exerciseIndex,
                                                setIndex,
                                                "rest",
                                                Number.parseInt(
                                                  e.target.value
                                                ) || 0
                                              )
                                            }
                                            className="h-8"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        removeSet(exerciseIndex, setIndex)
                                      }
                                      disabled={exercise.sets.length <= 1}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addSet(exerciseIndex)}
                                  className="mt-2"
                                >
                                  <Plus className="mr-2 h-4 w-4" />
                                  Add Set
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-md border border-dashed p-6 text-center">
                        <p className="text-sm text-muted-foreground">
                          No exercises selected. Search and add exercises from
                          the right panel.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={saveWorkout}
                  disabled={
                    loading ||
                    !workoutName.trim() ||
                    selectedExercises.length === 0
                  }
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Workout
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Exercise Library</CardTitle>
                <CardDescription>
                  Search and add exercises to your workout
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search exercises..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <Tabs
                    value={activeTab}
                    onValueChange={handleTabChange}
                    className="w-full"
                  >
                    <TabsList className="w-full">
                      <TabsTrigger value="all" className="flex-1">
                        All
                      </TabsTrigger>
                      <TabsTrigger value="chest" className="flex-1">
                        Chest
                      </TabsTrigger>
                      <TabsTrigger value="back" className="flex-1">
                        Back
                      </TabsTrigger>
                      <TabsTrigger value="legs" className="flex-1">
                        Legs
                      </TabsTrigger>
                      <TabsTrigger value="arms" className="flex-1">
                        Arms
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="space-y-4 mt-4">
                      {loadingExercises ? (
                        <div className="text-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                          <p>Loading exercises...</p>
                        </div>
                      ) : filteredExercises.length > 0 ? (
                        <div className="space-y-4">
                          {filteredExercises.slice(0, 10).map((exercise) => (
                            <Card key={exercise.id}>
                              <CardHeader className="p-4">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-lg">
                                    {exercise.name}
                                  </CardTitle>
                                  <Button
                                    size="sm"
                                    onClick={() => addExercise(exercise)}
                                    disabled={selectedExercises.some(
                                      (e) => e.id === exercise.id
                                    )}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                                <CardDescription>
                                  {exercise.bodyPart} | {exercise.equipment} |{" "}
                                  {exercise.target}
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="p-4 pt-0">
                                <div className="flex justify-center">
                                  <img
                                    src={
                                      exercise.gifUrl ||
                                      "/placeholder.svg?height=200&width=200"
                                    }
                                    alt={exercise.name}
                                    className="h-40 w-40 object-cover rounded-md"
                                  />
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                          {filteredExercises.length > 10 && (
                            <div className="text-center py-2 text-sm text-muted-foreground">
                              Showing 10 of {filteredExercises.length}{" "}
                              exercises. Use search to find more.
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">
                            No exercises found. Try a different search term.
                          </p>
                        </div>
                      )}
                    </TabsContent>

                    {["chest", "back", "legs", "arms"].map((bodyPart) => (
                      <TabsContent
                        key={bodyPart}
                        value={bodyPart}
                        className="space-y-4 mt-4"
                      >
                        {loadingExercises ? (
                          <div className="text-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                            <p>Loading exercises...</p>
                          </div>
                        ) : filteredExercises.length > 0 ? (
                          <div className="space-y-4">
                            {filteredExercises.slice(0, 10).map((exercise) => (
                              <Card key={exercise.id}>
                                <CardHeader className="p-4">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">
                                      {exercise.name}
                                    </CardTitle>
                                    <Button
                                      size="sm"
                                      onClick={() => addExercise(exercise)}
                                      disabled={selectedExercises.some(
                                        (e) => e.id === exercise.id
                                      )}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <CardDescription>
                                    {exercise.bodyPart} | {exercise.equipment} |{" "}
                                    {exercise.target}
                                  </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                  <div className="flex justify-center">
                                    <img
                                      src={
                                        exercise.gifUrl ||
                                        "/placeholder.svg?height=200&width=200"
                                      }
                                      alt={exercise.name}
                                      className="h-40 w-40 object-cover rounded-md"
                                    />
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-muted-foreground">
                              No {bodyPart} exercises found.
                            </p>
                          </div>
                        )}
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
