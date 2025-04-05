"use client";

import type React from "react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProfileSetup() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    weight: "",
    height: "",
    age: "",
    gender: "",
  });
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
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
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleGenderChange = (value: string) => {
    setFormData({
      ...formData,
      gender: value,
    });
  };

  const calculateBMI = (weight: number, height: number) => {
    // BMI = weight(kg) / (height(m))^2
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!user) {
      setError("User not authenticated");
      return;
    }

    // Validate form
    if (
      !formData.weight ||
      !formData.height ||
      !formData.age ||
      !formData.gender
    ) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const supabase = createClient();

      const weight = Number.parseFloat(formData.weight);
      const height = Number.parseFloat(formData.height);
      const age = Number.parseInt(formData.age);

      if (isNaN(weight) || isNaN(height) || isNaN(age)) {
        throw new Error(
          "Please enter valid numbers for weight, height, and age"
        );
      }

      const bmi = calculateBMI(weight, height);

      // Update user profile
      const { error: updateError } = await supabase
        .from("users")
        .update({
          weight,
          height,
          age,
          gender: formData.gender,
          bmi,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Create default schedule
      const { error: scheduleError } = await supabase.from("schedules").insert([
        {
          user_id: user.id,
          monday: null,
          tuesday: null,
          wednesday: null,
          thursday: null,
          friday: null,
          saturday: null,
          sunday: null,
          created_at: new Date().toISOString(),
        },
      ]);

      if (scheduleError && scheduleError.code !== "23505") throw scheduleError;

      toast({
        title: "Profile setup complete",
        description: "Your profile has been set up successfully.",
      });

      router.push("/dashboard");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p>You need to be logged in to set up your profile.</p>
          <Button className="mt-4" onClick={() => router.push("/login")}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            Complete your profile
          </CardTitle>
          <CardDescription>
            Enter your body measurements to get started
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-500 px-4 py-2 rounded-md text-sm dark:bg-red-900/30">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                placeholder="70"
                required
                value={formData.weight}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                name="height"
                type="number"
                placeholder="175"
                required
                value={formData.height}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                name="age"
                type="number"
                placeholder="30"
                required
                value={formData.age}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                onValueChange={handleGenderChange}
                value={formData.gender}
                disabled={loading}
              >
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
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save and continue"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
