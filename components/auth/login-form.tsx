"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { createClient } from "@/lib/supabase/client";

function sanitizeNext(next: string | null): string {
  // Prevent open redirects: only allow same-site, path-only values
  if (!next || !next.startsWith("/")) return "/calendar";
  if (next.startsWith("//")) return "/calendar";
  return next;
}
export function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sanitizeNext(sp.get("next"));
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const supabase = createClient();

  const signInWithOtp = async (email: string) => {
    console.log("🔐 signInWithOtp: Starting with email:", email);

    try {
      console.log("🔐 signInWithOtp: Calling Supabase auth.signInWithOtp...");

      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false, // Don't create new users automatically
        },
      });

      console.log("🔐 signInWithOtp: Supabase response:", {
        hasData: !!data,
        hasError: !!error,
        errorMessage: error?.message,
        errorStatus: error?.status,
        errorName: error?.name,
      });

      if (error) {
        console.error("🔐 signInWithOtp: Supabase OTP error:", {
          message: error.message,
          status: error.status,
          name: error.name,
          stack: error.stack,
        });

        // Provide more specific error messages
        if (
          error.message.includes("User not found") ||
          error.message.includes("Invalid login credentials")
        ) {
          console.error("🔐 signInWithOtp: User not found in database");
          return {
            error: {
              message: "User not in database. Contact support for access.",
            },
          };
        }

        if (
          error.message.includes("500") ||
          error.message.includes("Internal Server Error")
        ) {
          console.error(
            "🔐 signInWithOtp: 500 error detected - likely database issue"
          );
          return {
            error: {
              message:
                "Authentication service temporarily unavailable. Please try again in a few minutes.",
            },
          };
        }

        return { error };
      }

      console.log("🔐 signInWithOtp: Success - OTP sent to existing user");
      return { error: null };
    } catch (err) {
      console.error("🔐 signInWithOtp: Unexpected error:", {
        error: err,
        message: err instanceof Error ? err.message : "Unknown error",
        stack: err instanceof Error ? err.stack : undefined,
      });
      return {
        error: {
          message: "An unexpected error occurred. Please try again.",
        },
      };
    }
  };

  const verifyOtp = async (email: string, token: string) => {
    console.log(
      "🔐 verifyOtp: Starting with email:",
      email,
      "token length:",
      token.length
    );

    try {
      console.log("🔐 verifyOtp: Calling Supabase auth.verifyOtp...");

      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email",
      });

      console.log("🔐 verifyOtp: Supabase response:", {
        hasData: !!data,
        hasSession: !!data?.session,
        hasUser: !!data?.session?.user,
        hasError: !!error,
        errorMessage: error?.message,
      });

      if (!error && data.session) {
        console.log("🔐 verifyOtp: Session created successfully:", {
          userId: data.session.user.id,
          userEmail: data.session.user.email,
          sessionExpiresAt: data.session.expires_at,
        });
      }

      if (error) {
        console.error("🔐 verifyOtp: Supabase error:", {
          message: error.message,
          status: error.status,
          name: error.name,
        });
      }

      return { error, session: data.session };
    } catch (err) {
      console.error("🔐 verifyOtp: Unexpected error:", {
        error: err,
        message: err instanceof Error ? err.message : "Unknown error",
      });
      return { error: err, session: null };
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setMessage("Please enter your email address");
      setMessageType("error");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await signInWithOtp(normalizedEmail);
      if (error) {
        setMessage(error.message);
        setMessageType("error");
      } else {
        setMessage("Check your email for the 6-digit code.");
        setMessageType("success");
        setOtpSent(true);
        setEmail(normalizedEmail);
      }
    } catch {
      setMessage("An unexpected error occurred. Please try again.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    const code = otpCode.replace(/\D/g, "");
    if (code.length !== 6) {
      setMessage("Please enter the 6-digit verification code");
      setMessageType("error");
      setIsLoading(false);
      return;
    }

    const { error, session } = await verifyOtp(email.trim(), code);

    if (error) {
      setMessage(error instanceof Error ? error.message : "Verification failed");
      setMessageType("error");
    } else if (session) {
      // 🎉 Auth cookies are set; go to intended page from ?next=
      router.replace(next);
      // optional: router.refresh()
    } else {
      setMessage("Verification failed. Please try again.");
      setMessageType("error");
    }

    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (otpSent) await handleVerifyOtp(e);
    else await handleSendOtp(e);
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setMessage("");
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setMessage("Please enter your email address");
      setMessageType("error");
      setIsLoading(false);
      return;
    }
    try {
      const { error } = await signInWithOtp(normalizedEmail);
      if (error) {
        setMessage(error.message);
        setMessageType("error");
      } else {
        setMessage("New verification code sent.");
        setMessageType("success");
        setEmail(normalizedEmail);
      }
    } catch {
      setMessage("An unexpected error occurred. Please try again.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (value: string) => {
    setOtpCode(value.replace(/\D/g, "").slice(0, 6));
  };

  return (
    <form className={cn("flex flex-col gap-6")} onSubmit={handleSubmit}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">
          {otpSent ? "Enter verification code" : "Login to your account"}
        </h1>
        <p className="text-balance text-sm text-muted-foreground">
          {otpSent
            ? "We sent a 6-digit code to your email address"
            : "Enter your email below to login to your account"}
        </p>
      </div>

      <div className="grid gap-6">
        {!otpSent ? (
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="jane.doe@kellogg.northwestern.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
        ) : (
          <div className="grid gap-2">
            <Label htmlFor="otp">Verification Code</Label>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otpCode}
                onChange={handleOtpChange}
                disabled={isLoading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>
        )}

        {message && (
          <div
            className={`text-sm p-3 rounded-md ${
              messageType === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Loading..." : otpSent ? "Verify Code" : "Send Code"}
        </Button>

        {otpSent && (
          <div className="flex flex-col gap-2 text-center">
            <button
              type="button"
              onClick={handleResendOtp}
              className="text-sm text-primary hover:underline"
              disabled={isLoading}
            >
              Resend code
            </button>
            <button
              type="button"
              onClick={() => setOtpSent(false)}
              className="text-sm text-muted-foreground hover:underline"
              disabled={isLoading}
            >
              Back to email
            </button>
          </div>
        )}
      </div>
    </form>
  );
}
