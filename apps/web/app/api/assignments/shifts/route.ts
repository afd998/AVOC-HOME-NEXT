import { NextRequest, NextResponse } from "next/server";
import {
  getShifts,
  getShiftsForDates,
  deleteShiftsForDate,
  copyShiftsForDate,
  upsertShiftForProfileDate,
  rebuildShiftBlocksForDate,
} from "@/lib/data/assignments";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get("date");
  const dateList = searchParams.getAll("date");
  const dates = dateList.length > 0 ? dateList : date ? [date] : [];

  if (dates.length === 0) {
    return NextResponse.json(
      { error: "Date parameter is required" },
      { status: 400 }
    );
  }

  try {
    const shifts =
      dates.length === 1
        ? await getShifts(dates[0])
        : await getShiftsForDates(dates);
    return NextResponse.json({ shifts });
  } catch (error) {
    console.error("[api] GET /api/assignments/shifts", { date, error });
    return NextResponse.json(
      { error: "Failed to fetch shifts" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json(
      { error: "Date parameter is required" },
      { status: 400 }
    );
  }

  try {
    await deleteShiftsForDate(date);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api] DELETE /api/assignments/shifts", { date, error });
    return NextResponse.json(
      { error: "Failed to delete shifts" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const profileId = body?.profileId as string | undefined;
  const date = body?.date as string | undefined;
  const startTime = (body?.startTime ?? null) as string | null;
  const endTime = (body?.endTime ?? null) as string | null;

  if (!profileId || !date) {
    return NextResponse.json(
      { error: "profileId and date are required" },
      { status: 400 }
    );
  }

  try {
    const shifts = await upsertShiftForProfileDate({
      profileId,
      date,
      startTime,
      endTime,
    });
    const shiftBlocks = await rebuildShiftBlocksForDate(date);
    return NextResponse.json({ shifts, shiftBlocks });
  } catch (error) {
    console.error("[api] PUT /api/assignments/shifts", {
      profileId,
      date,
      error,
    });
    return NextResponse.json(
      { error: "Failed to save shift" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const sourceDate = body?.sourceDate as string | undefined;
  const targetDate = body?.targetDate as string | undefined;

  if (!sourceDate || !targetDate) {
    return NextResponse.json(
      { error: "sourceDate and targetDate are required" },
      { status: 400 }
    );
  }

  try {
    await copyShiftsForDate(sourceDate, targetDate);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api] POST /api/assignments/shifts", {
      sourceDate,
      targetDate,
      error,
    });
    return NextResponse.json(
      { error: "Failed to copy shifts" },
      { status: 500 }
    );
  }
}
