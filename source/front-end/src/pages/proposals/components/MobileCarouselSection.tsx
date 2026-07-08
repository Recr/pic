import { useEffect, useRef, useState } from 'react'
import type { ProposalStatus, ProposalWithSuggestions } from '../types'

type MobileCarouselSectionProps = {
  status: ProposalStatus
  proposals: ProposalWithSuggestions[]
  renderProposalCard: (proposal: ProposalWithSuggestions) => React.ReactNode
}

export const MobileCarouselSection: React.FC<MobileCarouselSectionProps> = ({
  status,
  proposals,
  renderProposalCard,
}) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [cardWidth, setCardWidth] = useState<number | null>(null)
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const cardRefs = useRef<Array<HTMLDivElement | null>>([])

  useEffect(() => {
    setActiveIndex(0)
  }, [status, proposals.length])

  useEffect(() => {
    const viewport = viewportRef.current
    const cards = cardRefs.current.filter((card): card is HTMLDivElement => card !== null)

    if (!viewport || cards.length <= 1) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting)

        if (visibleEntries.length === 0) return

        const mostVisibleEntry = visibleEntries.reduce((currentBest, entry) =>
          entry.intersectionRatio > currentBest.intersectionRatio ? entry : currentBest,
        )

        const nextIndex = cards.findIndex((card) => card === mostVisibleEntry.target)
        if (nextIndex >= 0) setActiveIndex(nextIndex)
      },
      {
        root: viewport,
        threshold: [0.55, 0.7, 0.85],
      },
    )

    cards.forEach((card) => observer.observe(card))

    return () => observer.disconnect()
  }, [proposals.length, status])

  useEffect(() => {
    const viewport = viewportRef.current

    if (!viewport) return

    const updateCardWidth = () => {
      const availableWidth = viewport.clientWidth
      const nextWidth = Math.min(Math.max(availableWidth - 48, 0), 336)
      setCardWidth(nextWidth > 0 ? nextWidth : null)
    }

    updateCardWidth()

    const resizeObserver = new ResizeObserver(updateCardWidth)
    resizeObserver.observe(viewport)

    return () => resizeObserver.disconnect()
  }, [status, proposals.length])

  if (proposals.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white/70 px-4 py-8 text-center text-sm text-gray-500">
        Nenhuma proposta encontrada.
      </div>
    )
  }

  return (
    <>
      <div
        ref={viewportRef}
        className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-3 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {proposals.map((proposal, index) => (
          <div
            key={proposal.id}
            ref={(element) => {
              cardRefs.current[index] = element
            }}
            className="shrink-0 snap-center"
            style={cardWidth ? { width: `${cardWidth}px` } : undefined}
          >
            {renderProposalCard(proposal)}
          </div>
        ))}
      </div>
      {proposals.length > 1 && (
        <div className="flex items-center justify-center gap-2 pb-1 pt-1">
          {proposals.map((proposal, index) => {
            const isActive = index === activeIndex

            return (
              <span
                key={proposal.id}
                className={`h-2 rounded-full transition-all ${
                  isActive ? 'w-6 bg-gray-900' : 'w-2 bg-gray-300'
                }`}
              />
            )
          })}
        </div>
      )}
    </>
  )
}
