import { SignupForm } from "@/components/auth/signup-form"

interface SignupPageProps {
  searchParams: Promise<{
    inviteId?: string;
  }>;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const { inviteId } = await searchParams;

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignupForm inviteId={inviteId} />
      </div>
    </div>
  )
}
