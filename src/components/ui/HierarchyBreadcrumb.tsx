import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface HierarchySegment {
  label: string
  count?: string   // e.g. "2 versions", "3 batches", "12 scenarios"
  href?: string    // omit for the current (last) segment
}

export function HierarchyBreadcrumb({ segments }: { segments: HierarchySegment[] }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {segments.map((seg, i) => {
        const isLast = i === segments.length - 1
        const pill = (
          <div className={cn(
            'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition-colors',
            isLast
              ? 'bg-vz-gray-100 border border-border'
              : 'hover:bg-vz-gray-100'
          )}>
            <span className={cn(
              'text-xs font-semibold',
              isLast ? 'text-vz-gray-900' : 'text-vz-gray-400'
            )}>
              {seg.label}
            </span>
            {seg.count && (
              <span className={cn(
                'rounded px-1.5 py-0.5 text-[10px] font-semibold tabular-nums',
                isLast
                  ? 'bg-vz-red/10 text-vz-red'
                  : 'bg-vz-gray-100 text-vz-gray-400'
              )}>
                {seg.count}
              </span>
            )}
          </div>
        )
        return (
          <div key={i} className="flex items-center gap-1">
            {seg.href && !isLast
              ? <Link to={seg.href}>{pill}</Link>
              : pill
            }
            {!isLast && <ChevronRight size={13} className="shrink-0 text-vz-gray-300" />}
          </div>
        )
      })}
    </div>
  )
}
