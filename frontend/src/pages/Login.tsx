import { useEffect, useMemo, useState } from "react"
import { Button } from "../components/ui/button"
import { Checkbox } from "../components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form"
import { Input } from "../components/ui/input"
import heatspotLogo from "../assets/logo.png"
import GlobeVisualization from "../components/custom/globe/Globe"
import { LanguageToggle } from "../components/custom/LanguageToggle"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  useForm,
  type ControllerRenderProps,
  type FieldPath,
} from "react-hook-form"
import { z } from "zod"
import { useNavigate, useSearchParams } from "react-router-dom"
import {
  login,
  register as registerUser,
  getGoogleAuthUrl,
  handleGoogleCallback,
  storeTokens,
  resetPassword,
  updatePassword,
  logout,
  isAuthenticated,
  getRememberedEmail,
  wasRememberMeEnabled,
} from "../lib/auth"
import { useTranslation } from "react-i18next"

type AuthMode = "signin" | "signup" | "forgotpassword" | "resetpassword"

const buildSchema = (mode: AuthMode) => {
  if (mode === "forgotpassword") {
    return z.object({
      email: z.string().email({
        message: "login.errors.invalidEmail",
      }),
    })
  }

  if (mode === "resetpassword") {
    return z
      .object({
        password: z.string().min(6, {
          message: "login.errors.passwordMin",
        }),
        confirmPassword: z.string().min(6, {
          message: "login.errors.passwordMin",
        }),
      })
      .superRefine((data, ctx) => {
        if (data.password !== data.confirmPassword) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["confirmPassword"],
            message: "login.errors.passwordsMismatch",
          })
        }
      })
  }

  const baseSchema = z.object({
    email: z.string().email({
      message: "login.errors.invalidEmail",
    }),
    password: z.string().min(6, {
      message: "login.errors.passwordMin",
    }),
    remember: z.boolean(),
  })

  if (mode === "signup") {
    return baseSchema
      .extend({
        confirmPassword: z.string().min(6, {
          message: "login.errors.passwordMin",
        }),
      })
      .superRefine((data, ctx) => {
        if (data.password !== data.confirmPassword) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["confirmPassword"],
            message: "login.errors.passwordsMismatch",
          })
        }
      })
  }

  return baseSchema
}

type FormValues = {
  email: string
  password?: string
  confirmPassword?: string
  remember?: boolean
}

type FieldRenderProps<TName extends FieldPath<FormValues>> = {
  field: ControllerRenderProps<FormValues, TName>
}

function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { t, i18n } = useTranslation()
  const [activeLang, setActiveLang] = useState<string>(
    i18n.language.toUpperCase() === "SK" ? "SK" : "EN"
  )
  const [mode, setMode] = useState<AuthMode>("signin")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [resetToken, setResetToken] = useState<string | null>(null)

  const formSchema = useMemo<ReturnType<typeof buildSchema>>(
    () => buildSchema(mode),
    [mode]
  )

  // Load remembered email and "remember me" preference on mount
  const rememberedEmail = getRememberedEmail();
  const wasRemembered = wasRememberMeEnabled();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      email: rememberedEmail || "",
      password: "",
      confirmPassword: "",
      remember: wasRemembered,
    },
  })

  useEffect(() => {
    if (mode === "signin") {
      form.unregister("confirmPassword")
      form.setValue("confirmPassword", "")
      form.clearErrors("confirmPassword")
    } else if (mode === "forgotpassword") {
      form.unregister("password")
      form.unregister("confirmPassword")
      form.unregister("remember")
      form.setValue("password", "")
      form.setValue("confirmPassword", "")
      form.setValue("remember", false)
      form.clearErrors("password")
      form.clearErrors("confirmPassword")
      form.clearErrors("remember")
    } else if (mode === "resetpassword") {
      form.unregister("email")
      form.unregister("remember")
      form.setValue("email", "")
      form.setValue("remember", false)
      form.clearErrors("email")
      form.clearErrors("remember")
    }
  }, [mode, form])

  // Logout if user is already authenticated when visiting login page
  // But skip this if we're in the middle of a Google OAuth flow
  useEffect(() => {
    const oauthCode = searchParams.get("code")
    const hasHashToken = window.location.hash.includes("access_token")
    
    // Don't logout if we're processing an OAuth callback
    if (!oauthCode && !hasHashToken && isAuthenticated()) {
      logout().catch(() => {
        // Ignore errors during logout
      })
    }
  }, [searchParams])

  useEffect(() => {
    const oauthCode = searchParams.get("code")
    if (oauthCode && !isGoogleLoading) {
      setIsGoogleLoading(true)
      handleGoogleCallback(oauthCode, window.location.origin + "/login")
        .then(() => {
          // Small delay to ensure tokens are stored and React state is updated
          // This prevents race condition with ProtectedRoute authentication check
          setTimeout(() => {
            navigate("/", { replace: true })
          }, 0)
        })
        .catch((err) => {
          setError(
            err.message || t("login.errors.googleFailure", { defaultValue: "Google authentication failed" })
          )
          setIsGoogleLoading(false)
        })
    }
  }, [searchParams, navigate, isGoogleLoading, t])

  useEffect(() => {
    if (window.location.hash.includes("access_token")) {
      const hashParams = new URLSearchParams(window.location.hash.slice(1))
      const accessToken = hashParams.get("access_token")
      const refreshToken = hashParams.get("refresh_token")
      const type = hashParams.get("type")

      // Check if this is a password reset flow
      if (type === "recovery" && accessToken) {
        setResetToken(accessToken)
        setMode("resetpassword")
        window.location.hash = ""
        return
      }

      // Regular OAuth/login flow
      if (accessToken && refreshToken) {
        // Store tokens with remember=true for OAuth flows (default to persistent session)
        storeTokens(accessToken, refreshToken, true)
        // Small delay to ensure tokens are stored and React state is updated
        // This prevents race condition with ProtectedRoute authentication check
        setTimeout(() => {
          window.location.hash = ""
          navigate("/", { replace: true })
        }, 0)
      } else if (accessToken) {
        // If only access token is present, still try to navigate
        window.location.hash = ""
        setTimeout(() => {
          navigate("/", { replace: true })
        }, 0)
      }
    }
  }, [navigate])

  const handleLanguageChange = (lang: string) => {
    setActiveLang(lang)
    i18n.changeLanguage(lang.toLowerCase())
  }

  const isSignUp = mode === "signup"
  const isForgotPassword = mode === "forgotpassword"
  const isResetPassword = mode === "resetpassword"

  async function onSubmit(values: FormValues) {
    setIsLoading(true)
    setError(null)
    setNotice(null)

    try {
      if (isResetPassword) {
        if (!resetToken) {
          setError(t("login.errors.invalidResetToken", { defaultValue: "Invalid or expired reset link" }))
          return
        }
        if (!values.password || !values.confirmPassword) {
          setError(t("login.errors.passwordMin", { defaultValue: "Password is required" }))
          return
        }

        await updatePassword({
          password: values.password,
          access_token: resetToken,
        })

        setNotice(
          t("login.passwordUpdated", {
            defaultValue:
              "Password updated successfully! You can now sign in with your new password.",
          })
        )
        setMode("signin")
        setResetToken(null)
        form.reset({
          email: "",
          password: "",
          confirmPassword: "",
          remember: false,
        })
        return
      }

      if (isForgotPassword) {
        await resetPassword({
          email: values.email,
          redirect_to: window.location.origin + "/login",
        })

        setNotice(
          t("login.passwordResetSent", {
            defaultValue:
              "Password reset email sent! Please check your inbox and follow the instructions.",
          })
        )
        setMode("signin")
        form.reset({
          email: values.email,
          password: "",
          confirmPassword: "",
          remember: false,
        })
        return
      }

      if (isSignUp) {
        if (!values.password) {
          setError(t("login.errors.passwordMin", { defaultValue: "Password is required" }))
          return
        }
        const response = await registerUser({
          email: values.email,
          password: values.password,
        })

        if (response.tokens.access_token) {
          navigate("/", { replace: true })
          return
        }

        setNotice(
          t("login.verifyEmailNotice", {
            defaultValue:
              "Registration successful. Please confirm your email before signing in.",
          })
        )
        setMode("signin")
        form.reset({
          email: values.email,
          password: "",
          confirmPassword: "",
          remember: false,
        })
        return
      }

      if (!values.password) {
        setError(t("login.errors.passwordMin", { defaultValue: "Password is required" }))
        return
      }
      await login({
        email: values.email,
        password: values.password,
        remember: values.remember ?? false,
      })

      navigate("/", { replace: true })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("login.errors.genericLogin", {
              defaultValue: "Login failed. Please try again.",
            })
      )
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true)
    setError(null)

    try {
      const { authorization_url } = await getGoogleAuthUrl(
        window.location.origin + "/login"
      )
      window.location.href = authorization_url
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("login.errors.googleInit", {
              defaultValue: "Failed to initiate Google sign in.",
            })
      )
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f7fb] px-6 py-12 sm:px-10 lg:px-16 overflow-y-auto">
      <div className="flex w-full max-w-5xl flex-col items-center gap-8 rounded-3xl bg-white py-8 px-8 shadow-lg m-0 lg:max-w-7xl lg:flex-row lg:items-stretch lg:py-12 lg:px-12 lg:overflow-hidden">
        <div className="flex w-full max-w-xl flex-[3_2_0%] flex-col justify-start gap-6 px-0 pt-0 pb-0 relative lg:max-w-none lg:overflow-y-auto lg:h-full lg:self-stretch">
          <div className="absolute top-0 right-0 sm:right-6">
            <LanguageToggle
              activeLang={activeLang}
              onLanguageChange={handleLanguageChange}
            />
          </div>

          <div className="flex flex-col items-center gap-5 text-center lg:flex-row lg:text-left lg:items-center">
            <img
              src={heatspotLogo}
              alt="HeatSpot"
              className="h-18 w-18 rounded-3xl object-contain sm:h-22 sm:w-22"
            />
            <span className="text-[2.25rem] font-semibold text-slate-900 sm:text-[2.75rem]">
              HeatSpot
            </span>
          </div>

          <div className="flex flex-col gap-8 w-full items-center text-center pt-0 pb-0 px-6 m-0 h-[725px] sm:h-auto lg:items-start lg:text-left">
            <div className="flex flex-col gap-3 w-full max-w-md">
              <h1 className="text-4xl font-bold text-slate-900">
                {t(
                  isSignUp
                    ? "login.registerTitle"
                    : isForgotPassword
                      ? "login.resetPasswordTitle"
                      : isResetPassword
                        ? "login.setNewPasswordTitle"
                        : "login.welcomeBack"
                )}
              </h1>
              <p className="text-sm text-slate-500">
                {t(
                  isSignUp
                    ? "login.registerSubtitle"
                    : isForgotPassword
                      ? "login.resetPasswordSubtitle"
                      : isResetPassword
                        ? "login.setNewPasswordSubtitle"
                        : "login.loginSubtitle"
                )}
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex w-full max-w-md flex-col gap-2 mx-auto lg:mx-0"
              >
                {!isResetPassword && (
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }: FieldRenderProps<"email">) => (
                      <FormItem className="w-full max-w-md">
                        <FormControl className="w-full">
                          <Input
                            type="email"
                            autoComplete="email"
                            placeholder={t("login.emailPlaceholder")}
                            className="h-12 w-full max-w-md rounded-xl border-slate-200 focus-visible:ring-slate-900"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {!isForgotPassword && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }: FieldRenderProps<"password">) => (
                      <FormItem className="w-full max-w-md">
                        <FormControl className="w-full">
                          <Input
                            type="password"
                            autoComplete={isSignUp ? "new-password" : "current-password"}
                            placeholder={t("login.passwordPlaceholder")}
                            className="h-12 w-full max-w-md rounded-xl border-slate-200 focus-visible:ring-slate-900"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {(isSignUp || isResetPassword) && (
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }: FieldRenderProps<"confirmPassword">) => (
                      <FormItem className="w-full max-w-md">
                        <FormControl className="w-full">
                          <Input
                            type="password"
                            autoComplete="new-password"
                            placeholder={t("login.confirmPasswordPlaceholder")}
                            className="h-12 w-full max-w-md rounded-xl border-slate-200 focus-visible:ring-slate-900"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}


                {!isSignUp && !isResetPassword && !isForgotPassword && (
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pl-6 pr-6">
                    <FormField
                      control={form.control}
                      name="remember"
                      render={({ field }: FieldRenderProps<"remember">) => (
                        <FormItem className="flex flex-row items-center gap-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:text-white"
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-medium text-slate-600">
                            {t("login.rememberMe")}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setMode("forgotpassword")
                        setError(null)
                        setNotice(null)
                        form.reset({
                          email: form.getValues("email"),
                          password: "",
                          confirmPassword: "",
                          remember: false,
                        })
                      }}
                      className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
                    >
                      {t("login.forgotPassword")}
                    </button>
                  </div>
                )}

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                    {error}
                  </div>
                )}

                {notice && (
                  <div className="text-sm text-slate-600 bg-slate-100 p-3 rounded-lg border border-slate-200">
                    {notice}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading || isGoogleLoading}
                  className="h-12 mt-8 self-center sm:self-start rounded-xl bg-slate-900 px-6 text-white hover:bg-slate-700 sm:min-w-24 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading
                    ? t("login.signingIn", { defaultValue: "Signing in..." })
                    : isForgotPassword
                      ? t("login.sendResetLink", { defaultValue: "Send Reset Link" })
                      : isResetPassword
                        ? t("login.updatePassword", { defaultValue: "Update Password" })
                        : t(isSignUp ? "login.signUp" : "login.signIn")}
                </Button>
              </form>
            </Form>

            {!isForgotPassword && (
              <>
                <div className="flex items-center gap-4 w-full max-w-md my-0">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-sm text-slate-400">
                    {t("login.or", { defaultValue: "or" })}
                  </span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                <Button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading || isGoogleLoading}
                  className="h-12 w-full max-w-md rounded-xl border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isGoogleLoading
                    ? t("login.googleConnecting", { defaultValue: "Connecting..." })
                    : t("login.googleButton", {
                        defaultValue: "Sign in with Google",
                      })}
                </Button>
              </>
            )}

            <p className="text-sm text-slate-500">
              {isForgotPassword ? (
                <>
                  {t("login.rememberPassword", { defaultValue: "Remember your password?" })}{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signin")
                      setError(null)
                      setNotice(null)
                    }}
                    className="font-semibold text-slate-900 transition hover:text-slate-700"
                  >
                    {t("login.signIn")}
                  </button>
                </>
              ) : isResetPassword ? (
                <>
                  {t("login.backToSignIn", { defaultValue: "Back to" })}{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signin")
                      setError(null)
                      setNotice(null)
                      setResetToken(null)
                    }}
                    className="font-semibold text-slate-900 transition hover:text-slate-700"
                  >
                    {t("login.signIn")}
                  </button>
                </>
              ) : (
                <>
                  {t(isSignUp ? "login.alreadyHaveAccount" : "login.noAccount")}{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode(isSignUp ? "signin" : "signup")
                      setError(null)
                      setNotice(null)
                    }}
                    className="font-semibold text-slate-900 transition hover:text-slate-700"
                  >
                    {t(isSignUp ? "login.signIn" : "login.signUp")}
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="relative hidden flex-[2_1_0%] w-full items-center justify-center overflow-hidden rounded-3xl bg-[#f6e9f7] border border-[#CBD5E1] h-[652px] min-h-[652px] lg:flex lg:h-[652px] lg:self-stretch">
          <GlobeVisualization />
        </div>
      </div>
    </div>
  )
}

export default Login