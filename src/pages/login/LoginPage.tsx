import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { signInService } from "@/services/authService"
import logo from "@/assets/icon.png"
import ganeshaBg from "@/assets/ganesha.jpg"

const loginSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().trim().min(1, "Password is required"),
})

type LoginValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  })

  const onSubmit = async (values: LoginValues) => {
    setLoading(true)
    try {
      // No need to touch auth state here — Firebase's onAuthStateChanged
      // listener in AppRouter picks up the new session reactively.
      await signInService(values)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Incorrect username or password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-cover bg-center p-4"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(25,10,1,0.87), rgba(51,2,2,0.92)), url(${ganeshaBg})`,
      }}
    >
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 rounded-2xl bg-card p-8 shadow-2xl ring-1 ring-primary/10 duration-500">
        <div className="flex flex-col items-center gap-2 text-center">
          <img
            src={logo}
            alt="logo"
            className="h-20 w-20 rounded-full object-cover shadow-lg ring-4 ring-primary/15"
          />
          <h1 className="font-display mt-2 text-2xl font-semibold">Welcome back!</h1>
          <p className="text-sm text-muted-foreground">Sign in to your account to continue</p>
        </div>

        <Form {...form}>
          <form className="mt-6 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input autoComplete="username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type={showPassword ? "text" : "password"} autoComplete="current-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword((prev) => !prev)}
                className="size-4 rounded border-input"
              />
              Show password
            </label>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>

            <p className="text-center text-sm font-medium text-primary">
              For any assistance reach out to TGM
            </p>
          </form>
        </Form>
      </div>
    </div>
  )
}
