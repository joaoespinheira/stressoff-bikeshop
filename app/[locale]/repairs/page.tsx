import { Wrench, Shield, Clock, CheckCircle } from 'lucide-react'
import { getSession } from '@/lib/session'
import RepairRequestForm from '@/components/repairs/RepairRequestForm'

type Props = { params: Promise<{ locale: string }> }

export default async function RepairsPage({ params }: Props) {
  const { locale } = await params
  const session = await getSession()

  const features = [
    {
      icon: Shield,
      title: locale === 'pt' ? 'Mecânicos certificados' : 'Certified mechanics',
      desc: locale === 'pt' ? 'Todos os mecânicos têm formação e certificação técnica.' : 'All mechanics are trained and technically certified.',
    },
    {
      icon: CheckCircle,
      title: locale === 'pt' ? 'Orçamento transparente' : 'Transparent quotes',
      desc: locale === 'pt' ? 'Recebes orçamento antes de qualquer intervenção.' : 'You receive a quote before any work starts.',
    },
    {
      icon: Clock,
      title: locale === 'pt' ? 'Prazo estimado' : 'Estimated timeframe',
      desc: locale === 'pt' ? 'Informamos sempre o prazo esperado de reparação.' : 'We always inform you of the expected repair time.',
    },
  ]

  return (
    <div>
      {/* Hero */}
      <section className="bg-[#1a1a2e] py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="rounded-xl bg-[#e94560]/20 p-3">
              <Wrench className="h-8 w-8 text-[#e94560]" />
            </div>
          </div>
          <h1 className="text-4xl font-bold">
            {locale === 'pt' ? 'Reparações' : 'Repairs'}
          </h1>
          <p className="mt-3 text-gray-300 max-w-xl">
            {locale === 'pt'
              ? 'A tua bicicleta em boas mãos. Diagnóstico honesto pelo Chico e a equipa.'
              : 'Your bike in good hands. Honest diagnosis from Chico and the team.'}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Features + Form */}
          <div>
            <div className="space-y-6 mb-10">
              {features.map((f) => (
                <div key={f.title} className="flex gap-4">
                  <div className="flex-shrink-0 rounded-lg bg-[#e94560]/10 p-2">
                    <f.icon className="h-5 w-5 text-[#e94560]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1a1a2e]">{f.title}</p>
                    <p className="text-sm text-gray-500">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chico card */}
            <div className="rounded-2xl bg-[#1a1a2e] p-6 text-white">
              <div className="mb-2 inline-block rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-medium text-yellow-300">
                {locale === 'pt' ? 'Mecânico Chefe' : 'Head Mechanic'}
              </div>
              <p className="font-bold text-lg">Chico</p>
              <p className="text-sm text-gray-300 mt-1">
                {locale === 'pt'
                  ? '+15 anos de experiência. Diagnóstico certeiro, sem complicações.'
                  : '+15 years experience. Accurate diagnosis, no hassle.'}
              </p>
            </div>
          </div>

          {/* Request form */}
          <div>
            <RepairRequestForm locale={locale} userId={session?.userId} />
          </div>
        </div>
      </div>
    </div>
  )
}
