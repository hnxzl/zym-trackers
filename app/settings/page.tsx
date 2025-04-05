"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { DashboardLayout } from "@/components/dashboard-layout"
import { createClient } from "@/lib/supabase/client"
import { createBackup, restoreBackup } from "@/lib/google-drive"
import { Save, Download, Upload, Trash2 } from "lucide-react"

export default function Settings() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [settings, setSettings] = useState({
    enableNotifications: true,
    darkMode: false,
    autoBackup: false,
  })
  const [backups, setBackups] = useState<any[]>([])

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const supabase = createClient()

        // Get authenticated user
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) {
          router.push("/login")
          return
        }

        setUser(userData.user)

        // Get user backups
        const { data: backupsData, error: backupsError } = await supabase
          .from("backups")
          .select("*")
          .eq("user_id", userData.user.id)
          .order("created_at", { ascending: false })

        if (backupsError) throw backupsError
        setBackups(backupsData || [])

        // In a real app, we would fetch user settings from the database
        // For now, we'll use default values
      } catch (error) {
        console.error("Error fetching settings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [router])

  const handleSettingChange = (setting: string, value: boolean) => {
    setSettings({
      ...settings,
      [setting]: value,
    })
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      // In a real app, we would save settings to the database
      alert("Settings saved successfully")
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("Failed to save settings. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleCreateBackup = async () => {
    if (!user) {
      alert("You must be logged in to create a backup")
      return
    }

    try {
      setSaving(true)
      const supabase = createClient()

      // Fetch user data
      const { data: profileData, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single()

      if (profileError) throw profileError

      // Fetch workouts
      const { data: workoutsData, error: workoutsError } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", user.id)

      if (workoutsError) throw workoutsError

      // Fetch schedule
      const { data: scheduleData, error: scheduleError } = await supabase
        .from("schedules")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (scheduleError && scheduleError.code !== "PGRST116") throw scheduleError

      // Create backup data object
      const backupData = {
        userId: user.id,
        profile: profileData,
        workouts: workoutsData || [],
        schedules: scheduleData || null,
      }

      // Send to Google Drive
      const result = await createBackup(backupData)

      if (!result.success) {
        throw new Error(result.error || "Backup failed")
      }

      // Save backup reference to Supabase
      const { error: insertError } = await supabase.from("backups").insert([
        {
          user_id: user.id,
          file_id: result.fileId,
          file_name: result.fileName,
        },
      ])

      if (insertError) throw insertError

      // Refresh backups list
      const { data: backupsData, error: backupsError } = await supabase
        .from("backups")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (backupsError) throw backupsError
      setBackups(backupsData || [])

      alert(result.message || "Backup created successfully")
    } catch (error) {
      console.error("Error creating backup:", error)
      alert("Failed to create backup. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleRestoreBackup = async (fileId: string) => {
    if (!user) {
      alert("You must be logged in to restore a backup")
      return
    }

    if (!confirm("Are you sure you want to restore this backup? This will overwrite your current data.")) {
      return
    }

    try {
      setSaving(true)
      const supabase = createClient()

      // Fetch backup from Google Drive
      const result = await restoreBackup(fileId)

      if (!result.success || !result.data) {
        throw new Error(result.error || "Restore failed")
      }

      const backupData = result.data

      // Delete existing user data
      // 1. Delete workouts
      const { error: deleteWorkoutsError } = await supabase.from("workouts").delete().eq("user_id", user.id)

      if (deleteWorkoutsError) throw deleteWorkoutsError

      // 2. Delete schedule
      const { error: deleteScheduleError } = await supabase.from("schedules").delete().eq("user_id", user.id)

      if (deleteScheduleError) throw deleteScheduleError

      // Restore profile data
      if (backupData.profile) {
        const { error: updateProfileError } = await supabase.from("users").update(backupData.profile).eq("id", user.id)

        if (updateProfileError) throw updateProfileError
      }

      // Restore workouts
      if (backupData.workouts && backupData.workouts.length > 0) {
        // Remove IDs to avoid conflicts
        const workoutsToInsert = backupData.workouts.map((workout: any) => {
          const { id, ...rest } = workout
          return rest
        })

        const { error: insertWorkoutsError } = await supabase.from("workouts").insert(workoutsToInsert)

        if (insertWorkoutsError) throw insertWorkoutsError
      }

      // Restore schedule
      if (backupData.schedules) {
        const { id, ...scheduleToInsert } = backupData.schedules

        const { error: insertScheduleError } = await supabase.from("schedules").insert([scheduleToInsert])

        if (insertScheduleError) throw insertScheduleError
      }

      alert(result.message || "Backup restored successfully")

      // Refresh the page to show restored data
      window.location.href = "/dashboard"
    } catch (error) {
      console.error("Error restoring backup:", error)
      alert("Failed to restore backup. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const deleteBackup = async (id: string) => {
    if (!user) {
      alert("You must be logged in to delete a backup")
      return
    }

    if (!confirm("Are you sure you want to delete this backup?")) {
      return
    }

    try {
      setSaving(true)
      const supabase = createClient()

      const { error } = await supabase.from("backups").delete().eq("id", id).eq("user_id", user.id)

      if (error) throw error

      // Update backups list
      setBackups(backups.filter((backup) => backup.id !== id))

      alert("Backup deleted successfully")
    } catch (error) {
      console.error("Error deleting backup:", error)
      alert("Failed to delete backup. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">Loading settings...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Application Settings</CardTitle>
              <CardDescription>Customize your app experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications for workout reminders</p>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.enableNotifications}
                  onCheckedChange={(checked) => handleSettingChange("enableNotifications", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="darkMode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Use dark theme for the application</p>
                </div>
                <Switch
                  id="darkMode"
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => handleSettingChange("darkMode", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoBackup">Automatic Backup</Label>
                  <p className="text-sm text-muted-foreground">Automatically backup your data weekly</p>
                </div>
                <Switch
                  id="autoBackup"
                  checked={settings.autoBackup}
                  onCheckedChange={(checked) => handleSettingChange("autoBackup", checked)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveSettings} disabled={saving} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Backup and restore your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Supabase free tier data is retained for 7 days. Create regular backups to prevent data loss.
              </p>
              <div className="flex flex-col gap-2">
                <Button onClick={handleCreateBackup} disabled={saving} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Create Backup
                </Button>
                <Button
                  variant="outline"
                  disabled={saving || backups.length === 0}
                  className="w-full"
                  onClick={() => backups.length > 0 && handleRestoreBackup(backups[0].file_id)}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Restore Latest Backup
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Backup History</CardTitle>
              <CardDescription>View and manage your backup files</CardDescription>
            </CardHeader>
            <CardContent>
              {backups.length > 0 ? (
                <div className="space-y-2">
                  {backups.map((backup) => (
                    <div key={backup.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <div className="font-medium">{backup.file_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(backup.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestoreBackup(backup.file_id)}
                          disabled={saving}
                        >
                          Restore
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteBackup(backup.id)} disabled={saving}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No backups found</p>
                  <Button onClick={handleCreateBackup} className="mt-2" disabled={saving}>
                    Create your first backup
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

