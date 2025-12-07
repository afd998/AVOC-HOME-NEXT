import { NextResponse } from "next/server";
import { db, sql } from "shared";

import type {
  SeriesSearchResponse,
  SeriesSearchRow,
} from "@/lib/types/series";

const DEFAULT_SIZE = 25;
const MAX_SIZE = 100;
const MIN_QUERY_LENGTH = 2;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const qRaw = (url.searchParams.get("q") ?? "").trim();
  const pageParam = Number.parseInt(url.searchParams.get("page") ?? "0", 10);
  const sizeParam = Number.parseInt(
    url.searchParams.get("size") ?? `${DEFAULT_SIZE}`,
    10
  );

  const page = Number.isFinite(pageParam) && pageParam >= 0 ? pageParam : 0;
  const sizeWithinBounds = Number.isFinite(sizeParam)
    ? sizeParam
    : DEFAULT_SIZE;
  const size = Math.min(Math.max(sizeWithinBounds, 1), MAX_SIZE);

  if (qRaw.length < MIN_QUERY_LENGTH) {
    return NextResponse.json<SeriesSearchResponse>({
      rows: [],
      total: 0,
      page,
      size,
    });
  }

  const offset = page * size;
  const likeValue = `%${escapeLikePattern(qRaw)}%`;

  try {
    const rowsRes = await db.execute(sql`
      SELECT
        s.id,
        s.series_name AS "seriesName",
        s.series_type AS "seriesType",
        s.total_events AS "totalEvents",
        s.first_date AS "firstDate",
        s.last_date AS "lastDate",
        s.quarter,
        s.year,
        COALESCE(
          json_agg(
            json_build_object(
              'id', f.id,
              'kelloggdirectoryName', f.kelloggdirectory_name,
              'twentyfiveliveName', f.twentyfivelive_name,
              'email', f.email,
              'kelloggdirectoryTitle', f.kelloggdirectory_title,
              'kelloggdirectorySubtitle', f.kelloggdirectory_subtitle,
              'kelloggdirectoryImageUrl', f.kelloggdirectory_image_url,
              'cutoutImage', f.cutout_image
            )
          ) FILTER (WHERE f.id IS NOT NULL),
          '[]'::json
        ) AS faculty
      FROM series AS s
      LEFT JOIN series_faculty AS sf ON sf.series = s.id
      LEFT JOIN faculty AS f ON f.id = sf.faculty
      WHERE s.series_name ILIKE ${likeValue} ESCAPE '\\'
      GROUP BY s.id
      ORDER BY s.first_date DESC, s.total_events DESC
      LIMIT ${size} OFFSET ${offset};
    `);

    const totalRes = await db.execute(sql`
      SELECT count(*)::int AS count
      FROM series
      WHERE series_name ILIKE ${likeValue} ESCAPE '\\';
    `);

    const rows = (rowsRes.rows as Array<
      Omit<SeriesSearchRow, "faculty"> & { faculty: unknown }
    >).map((row) => {
      const rawFaculty = row.faculty;
      let faculty: SeriesSearchRow["faculty"] = [];

      if (typeof rawFaculty === "string") {
        try {
          faculty = JSON.parse(rawFaculty) as SeriesSearchRow["faculty"];
        } catch {
          faculty = [];
        }
      } else if (Array.isArray(rawFaculty)) {
        faculty = rawFaculty as SeriesSearchRow["faculty"];
      }

      return {
        ...row,
        faculty,
      };
    });
    const total =
      Number((totalRes.rows[0] as { count?: number } | undefined)?.count) || 0;

    const payload: SeriesSearchResponse = {
      rows,
      total,
      page,
      size,
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error("[api] series.search", { query: qRaw, error });

    return NextResponse.json<SeriesSearchResponse>(
      {
        rows: [],
        total: 0,
        page,
        size,
      },
      { status: 500 }
    );
  }
}

function escapeLikePattern(value: string): string {
  return value.replace(/[%_]/g, (match) => `\\${match}`);
}
