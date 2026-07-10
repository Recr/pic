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
  const [trailingSpace, setTrailingSpace] = useState(0)
  const [maxVisibleDots, setMaxVisibleDots] = useState(7)
  const viewportRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setActiveIndex(0)
    viewportRef.current?.scrollTo({ left: 0 })
  }, [status, proposals.length])

  useEffect(() => {
    const viewport = viewportRef.current

    if (!viewport || proposals.length <= 1 || !cardWidth) return

    let frameId = 0
    let settleTimer: ReturnType<typeof setTimeout> | null = null

    const getNextActiveIndex = () => {
      const gap = Number.parseFloat(getComputedStyle(viewport).columnGap || '0') || 0
      const step = cardWidth + gap

      if (step <= 0) return 0

      const nextIndex = Math.floor((viewport.scrollLeft + step * 0.1) / step)
      return Math.min(Math.max(nextIndex, 0), proposals.length - 1)
    }

    const commitActiveIndex = () => {
      const nextIndex = getNextActiveIndex()
      setActiveIndex((current) => (current === nextIndex ? current : nextIndex))
    }

    const queueActiveIndexUpdate = () => {
      if (frameId) cancelAnimationFrame(frameId)

      frameId = requestAnimationFrame(() => {
        const nextIndex = getNextActiveIndex()

        if (settleTimer) {
          clearTimeout(settleTimer)
        }

        settleTimer = setTimeout(() => {
          setActiveIndex((current) => (current === nextIndex ? current : nextIndex))
        }, 90)
      })
    }

    commitActiveIndex()

    viewport.addEventListener('scroll', queueActiveIndexUpdate, { passive: true })
    const resizeObserver = new ResizeObserver(commitActiveIndex)
    resizeObserver.observe(viewport)

    return () => {
      viewport.removeEventListener('scroll', queueActiveIndexUpdate)
      resizeObserver.disconnect()

      if (settleTimer) {
        clearTimeout(settleTimer)
      }

      if (frameId) {
        cancelAnimationFrame(frameId)
      }
    }
  }, [cardWidth, proposals.length, status])

  useEffect(() => {
    const viewport = viewportRef.current

    if (!viewport) return

    const updateCardWidth = () => {
      const availableWidth = viewport.clientWidth
      const nextWidth = Math.min(Math.max(availableWidth - 48, 0), 336)

      const nextMaxVisibleDots =
        availableWidth >= 768 ? 11 : availableWidth >= 520 ? 9 : availableWidth >= 380 ? 7 : 5
      setMaxVisibleDots(nextMaxVisibleDots)

      if (nextWidth > 0) {
        setCardWidth(nextWidth)
        setTrailingSpace(Math.max(availableWidth - nextWidth, 0))
        return
      }

      setCardWidth(null)
      setTrailingSpace(0)
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

  const visibleDotsCount = Math.min(proposals.length, maxVisibleDots)
  const maxWindowStart = proposals.length - visibleDotsCount
  const rawWindowStart = activeIndex - Math.floor(visibleDotsCount / 2)
  const windowStart = Math.min(Math.max(rawWindowStart, 0), maxWindowStart)
  const visibleDotProposals = proposals.slice(windowStart, windowStart + visibleDotsCount)

  return (
    <>
      <div
        ref={viewportRef}
        className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-3 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {proposals.map((proposal) => (
          <div
            key={proposal.id}
            className="shrink-0 snap-start"
            style={cardWidth ? { width: `${cardWidth}px` } : undefined}
          >
            {renderProposalCard(proposal)}
          </div>
        ))}
        <div aria-hidden className="shrink-0" style={{ width: `${trailingSpace}px` }} />
      </div>
      {proposals.length > 1 && (
        <div className="flex items-center justify-center gap-2 pb-1 pt-1">
          {visibleDotProposals.map((proposal, offset) => {
            const index = windowStart + offset
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
