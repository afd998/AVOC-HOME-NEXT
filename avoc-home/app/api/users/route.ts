import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { profiles, events } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    // Get all profiles
    const allProfiles = await db.select().from(profiles)
    return NextResponse.json(allProfiles)
  } catch (error) {
    console.error('Error fetching profiles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profiles' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, roles } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const newProfile = await db.insert(profiles).values({
      name,
      roles: roles || [],
    }).returning()

    return NextResponse.json(newProfile[0], { status: 201 })
  } catch (error) {
    console.error('Error creating profile:', error)
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    )
  }
}
