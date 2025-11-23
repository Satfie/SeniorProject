import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getDb } from "@/lib/db";
import {
  AuthServiceError,
  normalizeAuthServiceError,
  requireAuthUser,
} from "@/lib/auth-service";
import {
  buildIdFilter,
  findTeamById,
  normalizeId,
  type TeamDoc,
  type UserDoc,
} from "@/lib/team-service";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string; userId: string }> }
) {
  const { id, userId } = await context.params;
  try {
    const { user } = await requireAuthUser(req);
    const db = await getDb();
    const team = await findTeamById(db, id);
    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }
    const managerId = String(team.managerId || "");
    if (userId === managerId) {
      return NextResponse.json({ message: "Cannot remove manager" }, { status: 400 });
    }
    if (user.id !== managerId && user.role !== "admin") {
      return NextResponse.json({ message: "forbidden" }, { status: 403 });
    }
    await req.json().catch(() => ({})); // Accept optional reason payload for future use
    const teamId = normalizeId(team._id);
    const teamsCol = db.collection<TeamDoc>("teams");
    const pullValue = userId;
    const update = await teamsCol.updateOne(buildIdFilter(teamId), {
      $pull: {
        members: pullValue,
        captainIds: pullValue,
      },
    });
    if (!update.modifiedCount) {
      return NextResponse.json({ message: "Member not found" }, { status: 404 });
    }
    await db.collection<UserDoc>("users").updateOne(
      { ...buildIdFilter(userId), teamId },
      { $unset: { teamId: "" } }
    );
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error instanceof AuthServiceError) {
      const { status, payload } = normalizeAuthServiceError(error);
      return NextResponse.json(payload, { status });
    }
    console.error("[teams.members.remove] unexpected error", error);
    return NextResponse.json(
      { message: error?.message || "Failed to remove member" },
      { status: 500 }
    );
  }
}
