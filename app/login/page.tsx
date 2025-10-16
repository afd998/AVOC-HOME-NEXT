import React from "react";
import { LoginForm } from "@/components/auth/login-form";
import LandingPageNavBar from "@/app/components/LandingPageNavBar";
import Image from "next/image";
import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // ✅ Immediately redirect signed-in users
    redirect("/calendar");
  }

  return (
    <div className="w-full">
      <LandingPageNavBar />
      <div className=" grid min-h-svh bg-background text-foreground lg:grid-cols-2 w-full">
        <div className="w-full">
          <div className="w-full h-full">
            <div className="h-full flex flex-col gap-6 p-6 md:p-10">
              <div className="flex flex-1 items-center justify-center">
                <div className="w-full max-w-md space-y-8">
                  <div className="space-y-6 rounded-3xl border border-border/40 bg-card p-8 shadow-xl shadow-primary/10">
                    <div className="text-center md:text-left">
                      <p className="text-base text-muted-foreground">
                        Sign in with your Northwestern email to receive a
                        one-time verification code.
                      </p>
                    </div>

                    <LoginForm />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="relative hidden items-center justify-center overflow-hidden lg:flex">
          <Image
            src="/images/auth.png"
            alt="AVOC auditorium"
            width={1000}
            height={1000}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/45 to-black/70 dark:from-black/70 dark:via-black/60 dark:to-black/85" />
          <div className="relative z-10 max-w-md space-y-4 p-10 text-white">
            <h2 className="text-4xl font-semibold leading-tight">
              Every session, every room, always within reach.
            </h2>
            <p className="text-lg text-white/80">
              AVOC keeps the team aligned on room schedules, task assignments,
              and faculty data so the Hub is always ready.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
