import { cache } from "react"

const API_KEY = "f204423d88mshdbced4db103d5e9p188363jsn7ee0495c084d"
const API_HOST = "exercisedb.p.rapidapi.com"

interface Exercise {
  id: string
  name: string
  bodyPart: string
  equipment: string
  target: string
  gifUrl: string
  secondaryMuscles: string[]
  instructions: string[]
}

const options = {
  method: "GET",
  headers: {
    "X-RapidAPI-Key": API_KEY,
    "X-RapidAPI-Host": API_HOST,
  },
  next: { revalidate: 86400 }, // Cache for 24 hours
}

export const getAllExercises = cache(async (): Promise<Exercise[]> => {
  try {
    const response = await fetch(`https://${API_HOST}/exercises`, options)

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching exercises:", error)
    return []
  }
})

export const getExercisesByBodyPart = cache(async (bodyPart: string): Promise<Exercise[]> => {
  try {
    const response = await fetch(`https://${API_HOST}/exercises/bodyPart/${bodyPart}`, options)

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error fetching exercises for body part ${bodyPart}:`, error)
    return []
  }
})

export const getExerciseById = cache(async (id: string): Promise<Exercise | null> => {
  try {
    const response = await fetch(`https://${API_HOST}/exercises/exercise/${id}`, options)

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error fetching exercise with ID ${id}:`, error)
    return null
  }
})

export const getBodyParts = cache(async (): Promise<string[]> => {
  try {
    const response = await fetch(`https://${API_HOST}/exercises/bodyPartList`, options)

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching body parts:", error)
    return []
  }
})

// Fallback function to use when API is unavailable or rate-limited
export const getFallbackExercises = (): Exercise[] => {
  return [
    {
      id: "0001",
      name: "Barbell Bench Press",
      bodyPart: "chest",
      equipment: "barbell",
      target: "pectorals",
      gifUrl: "/placeholder.svg?height=200&width=200",
      secondaryMuscles: ["triceps", "shoulders"],
      instructions: [
        "Lie on a flat bench",
        "Grip the barbell with hands slightly wider than shoulder-width",
        "Lower the bar to your chest",
        "Press the bar back up to starting position",
      ],
    },
    {
      id: "0002",
      name: "Dumbbell Bicep Curl",
      bodyPart: "arms",
      equipment: "dumbbell",
      target: "biceps",
      gifUrl: "/placeholder.svg?height=200&width=200",
      secondaryMuscles: ["forearms"],
      instructions: [
        "Stand with a dumbbell in each hand",
        "Keep elbows close to your torso",
        "Curl the weights up to shoulder level",
        "Lower back down with control",
      ],
    },
    {
      id: "0003",
      name: "Squat",
      bodyPart: "legs",
      equipment: "bodyweight",
      target: "quadriceps",
      gifUrl: "/placeholder.svg?height=200&width=200",
      secondaryMuscles: ["glutes", "hamstrings", "calves"],
      instructions: [
        "Stand with feet shoulder-width apart",
        "Lower your body by bending knees",
        "Keep back straight and chest up",
        "Return to starting position",
      ],
    },
    {
      id: "0004",
      name: "Deadlift",
      bodyPart: "back",
      equipment: "barbell",
      target: "lower back",
      gifUrl: "/placeholder.svg?height=200&width=200",
      secondaryMuscles: ["glutes", "hamstrings", "traps"],
      instructions: [
        "Stand with feet hip-width apart",
        "Bend at hips and knees to grip barbell",
        "Lift the bar by extending hips and knees",
        "Lower the bar by hinging at the hips",
      ],
    },
    {
      id: "0005",
      name: "Pull-up",
      bodyPart: "back",
      equipment: "bodyweight",
      target: "lats",
      gifUrl: "/placeholder.svg?height=200&width=200",
      secondaryMuscles: ["biceps", "shoulders"],
      instructions: [
        "Hang from a pull-up bar with hands wider than shoulder-width",
        "Pull your body up until chin is over the bar",
        "Lower back down with control",
      ],
    },
    {
      id: "0006",
      name: "Shoulder Press",
      bodyPart: "shoulders",
      equipment: "dumbbell",
      target: "deltoids",
      gifUrl: "/placeholder.svg?height=200&width=200",
      secondaryMuscles: ["triceps", "traps"],
      instructions: [
        "Sit or stand with a dumbbell in each hand at shoulder height",
        "Press the weights overhead",
        "Lower back to shoulder height with control",
      ],
    },
    {
      id: "0007",
      name: "Leg Press",
      bodyPart: "legs",
      equipment: "machine",
      target: "quadriceps",
      gifUrl: "/placeholder.svg?height=200&width=200",
      secondaryMuscles: ["glutes", "hamstrings", "calves"],
      instructions: [
        "Sit on the leg press machine",
        "Place feet on the platform shoulder-width apart",
        "Lower the platform by bending knees",
        "Push back to starting position",
      ],
    },
    {
      id: "0008",
      name: "Tricep Pushdown",
      bodyPart: "arms",
      equipment: "cable",
      target: "triceps",
      gifUrl: "/placeholder.svg?height=200&width=200",
      secondaryMuscles: ["forearms"],
      instructions: [
        "Stand facing a cable machine with high pulley",
        "Grab the bar with overhand grip",
        "Keep elbows close to body and push down",
        "Return to starting position with control",
      ],
    },
  ]
}

