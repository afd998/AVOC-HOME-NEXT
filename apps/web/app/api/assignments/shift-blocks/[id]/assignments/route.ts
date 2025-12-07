import { NextRequest, NextResponse } from "next/server";
import { assignRoomsToShiftBlock } from "@/lib/data/assignments";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const rawId = params?.id;
  const shiftBlockId = rawId ? parseInt(rawId, 10) : NaN;
  console.log(
    "[api] PATCH /api/assignments/shift-blocks/[id]/assignments incoming",
    {
      params,
      rawId,
      shiftBlockId,
      path: request.nextUrl.pathname,
      search: request.nextUrl.search,
    }
  );
  if (!rawId || Number.isNaN(shiftBlockId)) {
    return NextResponse.json(
      {
        error: "Invalid shift block id",
        rawId,
        parsed: shiftBlockId,
        path: request.nextUrl.pathname,
      },
      { status: 400 }
    );
  }

  const body = await request.json().catch(() => null);
  const rawRoomNames = Array.isArray(body?.roomNames) ? body.roomNames : [];
  const roomNames = rawRoomNames.filter(
    (name: unknown): name is string =>
      typeof name === "string" && name.trim().length > 0
  );
  const targetUserId =
    typeof body?.targetUserId === "string" && body.targetUserId.trim().length > 0
      ? body.targetUserId
      : null;

  if (roomNames.length === 0) {
    return NextResponse.json(
      { error: "roomNames must be a non-empty array of strings" },
      { status: 400 }
    );
  }

  try {
    console.log(
      "[api] PATCH /api/assignments/shift-blocks/[id]/assignments request",
      {
        shiftBlockId,
        roomNames,
        targetUserId,
      }
    );
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

    console.log(
      "[api] PATCH /api/assignments/shift-blocks/[id]/assignments success",
      {
        shiftBlockId,
        roomNamesCount: roomNames.length,
        targetUserId,
      }
    );
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
    console.error(
      "[api] PATCH /api/assignments/shift-blocks/[id]/assignments",
      {
        shiftBlockId,
        roomNames,
        targetUserId,
        error,
      }
    );
    return NextResponse.json(
      { error: "Failed to assign rooms", details: message },
      { status: 500 }
    );
  }
}
