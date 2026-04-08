import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getSignedUploadParams } from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { folder = 'repairs' } = body

  const params = await getSignedUploadParams(folder)
  return NextResponse.json(params)
}
