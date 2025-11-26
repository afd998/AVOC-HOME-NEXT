// app/api/faculty/search/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'


export async function GET(req: Request) {
  const url = new URL(req.url)
  const qRaw = (url.searchParams.get('q') ?? '').trim()
  const page = Math.max(0, Number(url.searchParams.get('page') ?? 0))
  const size = Math.min(Math.max(1, Number(url.searchParams.get('size') ?? 50)), 100)

  if (!qRaw) return NextResponse.json({ rows: [], total: 0, page, size })

  const offset = page * size
  const short = qRaw.length < 3

  if (!short) {
    // ---------- FTS path ----------
    const rowsRes = await db.execute(sql`
      SELECT
        id,
        kelloggdirectory_name   AS name,
        kelloggdirectory_title  AS title,
        kelloggdirectory_bio    AS bio,
        cutout_image as cutoutImageUrl,
        kelloggdirectory_image_url AS imageUrl,
        ts_rank(search, websearch_to_tsquery('english', ${qRaw})) AS rank
      FROM faculty
      WHERE search @@ websearch_to_tsquery('english', ${qRaw})
      ORDER BY rank DESC, name ASC
      LIMIT ${size} OFFSET ${offset};
    `)

    const totalRes = await db.execute(sql`
      SELECT count(*)::int AS count
      FROM faculty
      WHERE search @@ websearch_to_tsquery('english', ${qRaw});
    `)

    return NextResponse.json({
      rows: rowsRes.rows,
      total: (totalRes.rows[0] as any)?.count ?? 0,
      page,
      size,
    })
  } else {
    // ---------- Trigram fallback for very short queries ----------
    const like = `%${qRaw}%`

    const rowsRes = await db.execute(sql`
      SELECT
        id,
        kelloggdirectory_name   AS name,
        kelloggdirectory_title  AS title,
        kelloggdirectory_bio    AS bio,
        cutout_image       AS cutoutImageUrl,
        kelloggdirectory_image_url AS imageUrl,
      FROM faculty
      WHERE kelloggdirectory_name  ILIKE ${like}
         OR kelloggdirectory_title ILIKE ${like}
         OR kelloggdirectory_bio   ILIKE ${like}
      ORDER BY name ASC
      LIMIT ${size} OFFSET ${offset};
    `)

    const totalRes = await db.execute(sql`
      SELECT count(*)::int AS count
      FROM faculty
      WHERE kelloggdirectory_name  ILIKE ${like}
         OR kelloggdirectory_title ILIKE ${like}
         OR kelloggdirectory_bio   ILIKE ${like};
    `)

    return NextResponse.json({
      rows: rowsRes.rows,
      total: (totalRes.rows[0] as any)?.count ?? 0,
      page,
      size,
    })
  }
}
