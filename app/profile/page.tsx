"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { DashboardLayout } from "@/components/dashboard-layout"
import { createClient } from "@/lib/supabase/client"
import { Save } from "lucide-react"

export default function Profile() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    weight: "",
    height: "",
    age: "",
    gender: "",
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const supabase = createClient()

        // Get authenticated user
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) {
          router.push("/login")
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
        setFormData({
          name: profileData.name || "",
          email: profileData.email || "",
          weight: profileData.weight?.toString() || "",
          height: profileData.height?.toString() || "",
          age: profileData.age?.toString() || "",
          gender: profileData.gender || "",
        })
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleGenderChange = (value: string) => {
    setFormData({
      ...formData,
      gender: value,
    })
  }

  const calculateBMI = (weight: number, height: number) => {
    // BMI = weight(kg) / (height(m))^2
    const heightInMeters = height / 100
    return weight / (heightInMeters * heightInMeters)
  }

  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return { category: "Underweight", color: "bg-blue-500" }
    if (bmi < 25) return { category: "Normal weight", color: "bg-green-500" }
    if (bmi < 30) return { category: "Overweight", color: "bg-yellow-500" }
    return { category: "Obese", color: "bg-red-500" }
  }

  const saveProfile = async () => {
    if (!user) {
      alert("You must be logged in to update your profile")
      return
    }

    try {
      setSaving(true)
      const supabase = createClient()

      const weight = Number.parseFloat(formData.weight)
      const height = Number.parseFloat(formData.height)
      const age = Number.parseInt(formData.age)

      if (isNaN(weight) || isNaN(height) || isNaN(age)) {
        throw new Error("Please enter valid numbers for weight, height, and age")
      }

      const bmi = calculateBMI(weight, height)

      const { error } = await supabase
        .from("users")
        .update({
          name: formData.name,
          weight,
          height,
          age,
          gender: formData.gender,
          bmi,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

      // Update profile state with new values
      setProfile({
        ...profile,
        name: formData.name,
        weight,
        height,
        age,
        gender: formData.gender,
        bmi,
        updated_at: new Date().toISOString(),
      })

      alert("Profile updated successfully")
    } catch (error: any) {
      console.error("Error updating profile:", error)
      alert(error.message || "Failed to update profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">Loading profile...</div>
        </div>
      </DashboardLayout>
    )
  }

  const bmiInfo = profile?.bmi ? getBmiCategory(profile.bmi) : { category: "Not calculated", color: "bg-gray-500" }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">Profile</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} disabled />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Body Measurements</CardTitle>
              <CardDescription>Update your body measurements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input id="weight" name="weight" type="number" value={formData.weight} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input id="height" name="height" type="number" value={formData.height} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" name="age" type="number" value={formData.age} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select onValueChange={handleGenderChange} value={formData.gender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>BMI Information</CardTitle>
              <CardDescription>Your body mass index</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{profile?.bmi ? profile.bmi.toFixed(1) : "N/A"}</div>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${bmiInfo.color.replace("bg-", "text-")} bg-opacity-20`}
                >
                  {bmiInfo.category}
                </div>
              </div>
              <Progress value={profile?.bmi ? Math.min((profile.bmi / 40) * 100, 100) : 0} className="h-2" />
              <div className="grid grid-cols-4 text-xs text-center mt-1">
                <div>Underweight</div>
                <div>Normal</div>
                <div>Overweight</div>
                <div>Obese</div>
              </div>
              <div className="text-sm text-muted-foreground mt-4">
                <p>BMI is calculated using your weight and height.</p>
                <p className="mt-1">
                  Last updated: {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : "Never"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Save Changes</CardTitle>
              <CardDescription>Update your profile information</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Click the button below to save all changes to your profile. Your BMI will be automatically recalculated.
              </p>
            </CardContent>
            <CardFooter>
              <Button onClick={saveProfile} disabled={saving} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

