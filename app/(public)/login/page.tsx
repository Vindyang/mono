import { LoginForm } from "@/components/auth/login-form"

interface LoginPageProps {
  searchParams: Promise<{
    inviteId?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { inviteId } = await searchParams;

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm inviteId={inviteId} />
      </div>
    </div>
  )
}
