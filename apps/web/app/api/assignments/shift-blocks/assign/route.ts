import { NextRequest, NextResponse } from "next/server";
import { assignRoomsToShiftBlock } from "@/lib/data/assignments";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const rawId = body?.shiftBlockId;
  const shiftBlockId =
    typeof rawId === "number"
      ? rawId
      : typeof rawId === "string"
      ? parseInt(rawId, 10)
      : NaN;

  const rawRoomNames = Array.isArray(body?.roomNames) ? body.roomNames : [];
  const roomNames = rawRoomNames.filter(
    (name: unknown): name is string =>
      typeof name === "string" && name.trim().length > 0
  );
  const targetUserId =
    typeof body?.targetUserId === "string" && body.targetUserId.trim().length > 0
      ? body.targetUserId
      : null;

  console.log("[api] POST /api/assignments/shift-blocks/assign incoming", {
    rawId,
    shiftBlockId,
    roomNames,
    targetUserId,
  });

  if (!rawId || Number.isNaN(shiftBlockId)) {
    return NextResponse.json(
      { error: "Invalid shift block id", rawId, parsed: shiftBlockId },
      { status: 400 }
    );
  }

  if (roomNames.length === 0) {
    return NextResponse.json(
      { error: "roomNames must be a non-empty array of strings" },
      { status: 400 }
    );
  }

  try {
    const shiftBlock = await assignRoomsToShiftBlock(
      shiftBlockId,
      roomNames,
      targetUserId
    );

    if (!shiftBlock) {
      return NextResponse.json(
        { error: "Shift block not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ shiftBlock });
  } catch (error) {
    const message = (error as Error)?.message ?? "Failed to assign rooms";
    if (message.startsWith("ROOMS_NOT_FOUND")) {
      return NextResponse.json(
        { error: "Rooms not found for provided names", details: message },
        { status: 400 }
      );
    }
    if (message.startsWith("PROFILE_NOT_FOUND")) {
      return NextResponse.json(
        { error: "Profile not found for provided id", details: message },
        { status: 404 }
      );
    }
    console.error("[api] POST /api/assignments/shift-blocks/assign", {
      shiftBlockId,
      roomNames,
      targetUserId,
      error,
    });
    return NextResponse.json(
      { error: "Failed to assign rooms", details: message },
      { status: 500 }
    );
  }
}
