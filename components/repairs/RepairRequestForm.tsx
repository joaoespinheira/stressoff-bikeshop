'use client'

import { useActionState, useState, useRef } from 'react'
import { Upload, X, Send, LogIn, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { submitRepair, RepairState } from '@/app/actions/repairs'

type Props = {
  locale: string
  userId?: string
}

type UploadedPhoto = { url: string; cloudinaryId: string; previewUrl: string }

async function uploadToCloudinary(file: File): Promise<{ url: string; cloudinaryId: string }> {
  const { timestamp, signature, apiKey, cloudName, folder } = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder: 'repairs' }),
  }).then((r) => r.json())

  const formData = new FormData()
  formData.append('file', file)
  formData.append('api_key', apiKey)
  formData.append('timestamp', timestamp)
  formData.append('signature', signature)
  formData.append('folder', folder)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  })

  const data = await res.json()
  return { url: data.secure_url, cloudinaryId: data.public_id }
}

export default function RepairRequestForm({ locale, userId }: Props) {
  const [state, action, pending] = useActionState<RepairState, FormData>(submitRepair, undefined)
  const [photos, setPhotos] = useState<UploadedPhoto[]>([])
  const [uploading, setUploading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  if (!userId) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 p-10 text-center">
        <LogIn className="mx-auto mb-4 h-10 w-10 text-gray-300" />
        <p className="text-gray-500 mb-4">
          {locale === 'pt'
            ? 'Para pedir uma reparação precisas de entrar na tua conta.'
            : 'To request a repair you need to sign in.'}
        </p>
        <Link
          href={`/${locale}/login`}
          className="inline-flex items-center gap-2 rounded-full bg-[#e94560] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#c73652]"
        >
          {locale === 'pt' ? 'Entrar' : 'Sign in'}
        </Link>
      </div>
    )
  }

  if (state?.success) {
    return (
      <div className="rounded-2xl bg-green-50 p-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <Send className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-[#1a1a2e]">
          {locale === 'pt' ? 'Pedido enviado!' : 'Request submitted!'}
        </h3>
        <p className="mt-2 text-gray-500">
          {locale === 'pt'
            ? `Número de reparação: ${state.repairNumber}`
            : `Repair number: ${state.repairNumber}`}
        </p>
        <p className="mt-1 text-sm text-gray-400">
          {locale === 'pt'
            ? 'Entraremos em contacto em breve.'
            : "We'll be in touch shortly."}
        </p>
      </div>
    )
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return

    setUploading(true)
    try {
      const uploaded = await Promise.all(
        files.map(async (file) => {
          const previewUrl = URL.createObjectURL(file)
          const { url, cloudinaryId } = await uploadToCloudinary(file)
          return { url, cloudinaryId, previewUrl }
        })
      )
      setPhotos((prev) => [...prev, ...uploaded])
    } catch {
      // silently ignore upload errors — photos are optional
    } finally {
      setUploading(false)
      // reset file input
      if (e.target) e.target.value = ''
    }
  }

  return (
    <form ref={formRef} action={action} className="space-y-5">
      <h2 className="text-xl font-bold text-[#1a1a2e]">
        {locale === 'pt' ? 'Pedir reparação' : 'Request repair'}
      </h2>

      {state?.message && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{state.message}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">
          {locale === 'pt' ? 'Descreve a tua bicicleta *' : 'Describe your bike *'}
        </label>
        <input
          name="bikeDescription"
          type="text"
          required
          placeholder={locale === 'pt' ? 'ex: Mountain bike Trek Marlin 7, azul, 2022' : 'e.g. Trek Marlin 7 MTB, blue, 2022'}
          className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#1a1a2e] focus:ring-1 focus:ring-[#1a1a2e]"
        />
        {state?.errors?.bikeDescription && (
          <p className="mt-1 text-xs text-red-500">{state.errors.bikeDescription[0]}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          {locale === 'pt' ? 'Descreve o problema *' : 'Describe the problem *'}
        </label>
        <textarea
          name="problemDesc"
          required
          rows={4}
          placeholder={
            locale === 'pt'
              ? 'Descreve o problema com o máximo de detalhe possível...'
              : 'Describe the problem in as much detail as possible...'
          }
          className="mt-1 block w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#1a1a2e] focus:ring-1 focus:ring-[#1a1a2e]"
        />
        {state?.errors?.problemDesc && (
          <p className="mt-1 text-xs text-red-500">{state.errors.problemDesc[0]}</p>
        )}
      </div>

      {/* Hidden field with serialized photo URLs */}
      <input
        type="hidden"
        name="photoUrls"
        value={JSON.stringify(photos.map(({ url, cloudinaryId }) => ({ url, cloudinaryId })))}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700">
          {locale === 'pt' ? 'Fotos (opcional)' : 'Photos (optional)'}
        </label>
        <label className="mt-1 flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-gray-300 px-4 py-4 hover:border-[#1a1a2e]">
          <Upload className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-500">
            {uploading
              ? (locale === 'pt' ? 'A carregar...' : 'Uploading...')
              : (locale === 'pt' ? 'Clica para adicionar fotos' : 'Click to add photos')}
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={uploading}
            className="sr-only"
            onChange={handleFileChange}
          />
        </label>

        {photos.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {photos.map((photo, i) => (
              <div key={i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.previewUrl}
                  alt=""
                  className="h-16 w-16 rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {uploading && (
          <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
            <ImageIcon className="h-3 w-3" />
            {locale === 'pt' ? 'A carregar imagens...' : 'Uploading images...'}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending || uploading}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[#e94560] py-3 text-sm font-semibold text-white hover:bg-[#c73652] disabled:opacity-60"
      >
        <Send className="h-4 w-4" />
        {pending
          ? (locale === 'pt' ? 'A enviar...' : 'Submitting...')
          : (locale === 'pt' ? 'Enviar pedido' : 'Submit request')}
      </button>
    </form>
  )
}
