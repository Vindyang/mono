import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getValidPendingInvitation,
  completeInvitationAcceptance,
} from "@/lib/invitations";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const invitationResult = await getValidPendingInvitation(token);
  if (!invitationResult.ok) {
    const errorUrl = new URL(`/invite/${token}`, request.url);
    errorUrl.searchParams.set("error", invitationResult.code);
    return NextResponse.redirect(errorUrl);
  }
  const { invitation } = invitationResult;

  const session = await auth.api.getSession({ headers: request.headers });

  if (session?.user) {
    if (session.user.email !== invitation.email) {
      const errorUrl = new URL(`/invite/${token}`, request.url);
      errorUrl.searchParams.set("error", "EMAIL_MISMATCH");
      return NextResponse.redirect(errorUrl);
    }

    const result = await completeInvitationAcceptance(
      invitation,
      session.user.id
    );
    if (!result.success) {
      const errorUrl = new URL(`/invite/${token}`, request.url);
      errorUrl.searchParams.set("error", "ALREADY_MEMBER");
      return NextResponse.redirect(errorUrl);
    }

    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: invitation.email },
  });

  if (existingUser) {
    // Returning user with no live session in this browser - still needs to
    // prove identity via the normal login flow.
    return NextResponse.redirect(
      new URL(`/login?inviteId=${token}`, request.url)
    );
  }

  // Brand-new user: clicking this emailed invite link already proves ownership
  // of the invitation's email address the same way a magic link does, so we
  // provision the account and sign them in without a second email round trip.
  // The random password is never surfaced - all future logins go through the
  // existing magic-link flow.
  const signUpUrl = new URL("/api/auth/sign-up/email", request.url);
  const signUpResponse = await fetch(signUpUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      origin: process.env.BETTER_AUTH_URL || request.nextUrl.origin,
    },
    body: JSON.stringify({
      email: invitation.email,
      password: crypto.randomBytes(32).toString("hex"),
      name: "",
    }),
  });

  if (!signUpResponse.ok) {
    const errorUrl = new URL(`/invite/${token}`, request.url);
    errorUrl.searchParams.set("error", "SIGNUP_FAILED");
    return NextResponse.redirect(errorUrl);
  }

  const { user: newUser } = await signUpResponse.json();

  const result = await completeInvitationAcceptance(invitation, newUser.id);
  if (!result.success) {
    const errorUrl = new URL(`/invite/${token}`, request.url);
    errorUrl.searchParams.set("error", "ALREADY_MEMBER");
    return NextResponse.redirect(errorUrl);
  }

  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  signUpResponse.headers.getSetCookie().forEach((cookie) => {
    response.headers.append("Set-Cookie", cookie);
  });

  return response;
}
