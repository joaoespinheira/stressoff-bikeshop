'use server'

import { z } from 'zod'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'
import { generateOrderNumber } from '@/lib/utils'
import { revalidatePath } from 'next/cache'

const RepairSchema = z.object({
  bikeDescription: z.string().min(5),
  problemDesc: z.string().min(10),
  photoUrls: z.string().optional(), // JSON array of {url, cloudinaryId}
})

export type RepairState = {
  errors?: Record<string, string[]>
  message?: string
  success?: boolean
  repairNumber?: string
} | undefined

export async function submitRepair(state: RepairState, formData: FormData): Promise<RepairState> {
  const session = await getSession()
  if (!session?.userId) {
    return { message: 'Precisas de entrar na conta.' }
  }

  const validated = RepairSchema.safeParse({
    bikeDescription: formData.get('bikeDescription'),
    problemDesc: formData.get('problemDesc'),
    photoUrls: formData.get('photoUrls'),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const repairNumber = generateOrderNumber('SP')

  type PhotoEntry = { url: string; cloudinaryId: string }
  const photos: PhotoEntry[] = validated.data.photoUrls
    ? (JSON.parse(validated.data.photoUrls) as PhotoEntry[])
    : []

  await db.repair.create({
    data: {
      repairNumber,
      userId: session.userId,
      bikeDescription: validated.data.bikeDescription,
      problemDesc: validated.data.problemDesc,
      photos: photos.length > 0
        ? {
            create: photos.map((p) => ({
              cloudinaryId: p.cloudinaryId,
              url: p.url,
            })),
          }
        : undefined,
    },
  })

  revalidatePath('/pt/account/repairs')
  revalidatePath('/en/account/repairs')

  return { success: true, repairNumber }
}

export async function updateRepairStatus(
  repairId: string,
  status: string,
  notes?: string
): Promise<{ success: boolean }> {
  const session = await getSession()
  if (!session?.userId || (session.role !== 'ADMIN' && session.role !== 'MECHANIC')) {
    return { success: false }
  }

  await db.repair.update({
    where: { id: repairId },
    data: {
      status: status as never,
      ...(notes && { customerNotes: notes }),
    },
  })

  revalidatePath('/pt/admin/repairs')

  return { success: true }
}
