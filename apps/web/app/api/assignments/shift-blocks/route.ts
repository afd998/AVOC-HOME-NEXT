import { NextRequest, NextResponse } from "next/server";
import {
  getAllShiftBlocks,
  getShiftBlocks,
  getRooms,
  replaceShiftBlocksForDate,
  copyScheduleFromPreviousWeek,
} from "@/lib/data/assignments";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get("date");
  const includeRooms = searchParams.get("includeRooms") === "true";
  const onlyRooms = searchParams.get("onlyRooms") === "true";

  try {
    const [shiftBlocks, rooms] = await Promise.all([
      onlyRooms ? Promise.resolve(undefined) : date ? getShiftBlocks(date) : getAllShiftBlocks(),
      includeRooms || onlyRooms ? getRooms() : Promise.resolve(undefined),
    ]);

    return NextResponse.json({
      shiftBlocks: shiftBlocks ?? [],
      rooms: rooms ?? [],
    });
  } catch (error) {
    console.error("[api] GET /api/assignments/shift-blocks", {
      date,
      error,
    });
    return NextResponse.json(
      { error: "Failed to fetch shift blocks" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const date = body?.date as string | undefined;
  const newBlocks = body?.newBlocks as
    | {
        date: string;
        startTime: string | null;
        endTime: string | null;
        assignments?: unknown;
      }[]
    | undefined;

  if (!date || !Array.isArray(newBlocks)) {
    return NextResponse.json(
      { error: "date and newBlocks are required" },
      { status: 400 }
    );
  }

  try {
    const shiftBlocks = await replaceShiftBlocksForDate(date, newBlocks);
    return NextResponse.json({ shiftBlocks });
  } catch (error) {
    console.error("[api] PUT /api/assignments/shift-blocks", {
      date,
      error,
    });
    return NextResponse.json(
      { error: "Failed to update shift blocks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const weekDates = body?.weekDates as string[] | undefined;
  const previousWeekStartDate = body?.previousWeekStartDate as
    | string
    | undefined;

  if (!Array.isArray(weekDates) || typeof previousWeekStartDate !== "string") {
    return NextResponse.json(
      { error: "weekDates (string[]) and previousWeekStartDate are required" },
      { status: 400 }
    );
  }

  try {
    await copyScheduleFromPreviousWeek(weekDates, previousWeekStartDate);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api] POST /api/assignments/shift-blocks", {
      weekDates,
      previousWeekStartDate,
      error,
    });
    return NextResponse.json(
      { error: "Failed to copy schedule" },
      { status: 500 }
    );
  }
}
