import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Dumbbell, Calendar, User, BarChart3, ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex items-center justify-between h-16 px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Dumbbell className="h-6 w-6" />
            <span>Zym Tracker</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Register</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Track Your Fitness Journey
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    Zym Tracker helps you plan workouts, track progress, and achieve your fitness goals.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/register">
                    <Button size="lg" className="gap-1.5">
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4 md:gap-8">
                  <div className="flex flex-col items-center gap-2 rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
                    <Dumbbell className="h-10 w-10 text-gray-500" />
                    <h3 className="text-xl font-bold">Workout Library</h3>
                    <p className="text-center text-gray-500 dark:text-gray-400">
                      Access hundreds of exercises with detailed instructions
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-2 rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
                    <Calendar className="h-10 w-10 text-gray-500" />
                    <h3 className="text-xl font-bold">Schedule</h3>
                    <p className="text-center text-gray-500 dark:text-gray-400">
                      Plan your weekly workouts and stay consistent
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-2 rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
                    <User className="h-10 w-10 text-gray-500" />
                    <h3 className="text-xl font-bold">Profile</h3>
                    <p className="text-center text-gray-500 dark:text-gray-400">
                      Track your body measurements and BMI over time
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-2 rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
                    <BarChart3 className="h-10 w-10 text-gray-500" />
                    <h3 className="text-xl font-bold">Progress</h3>
                    <p className="text-center text-gray-500 dark:text-gray-400">
                      Visualize your fitness journey with detailed analytics
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t">
        <div className="container flex flex-col gap-2 py-4 md:h-16 md:flex-row md:items-center md:justify-between md:py-0">
          <div className="text-center text-sm text-gray-500 md:text-left">
            © {new Date().getFullYear()} Zym Tracker. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

