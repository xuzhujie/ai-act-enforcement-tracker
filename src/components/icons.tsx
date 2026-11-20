import type { SVGProps } from 'react'

export type IconName =
  | 'arrow-right'
  | 'building'
  | 'check'
  | 'close'
  | 'download'
  | 'external-link'
  | 'file'
  | 'gavel'
  | 'grid'
  | 'guide'
  | 'home'
  | 'info'
  | 'layers'
  | 'menu'
  | 'search'
  | 'shield'
  | 'sliders'
  | 'spark'
  | 'wrench'

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName
  size?: number
}

export default function Icon({ name, size = 18, ...props }: IconProps) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" {...props}>
      {name === 'arrow-right' && <><path {...common} d="M5 12h13" /><path {...common} d="m13 6 6 6-6 6" /></>}
      {name === 'building' && <><path {...common} d="M4 21h16" /><path {...common} d="M6 21V5l6-2 6 2v16" /><path {...common} d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1" /></>}
      {name === 'check' && <path {...common} d="m5 12 4 4L19 6" />}
      {name === 'close' && <><path {...common} d="m6 6 12 12" /><path {...common} d="M18 6 6 18" /></>}
      {name === 'download' && <><path {...common} d="M12 4v11" /><path {...common} d="m7 11 5 5 5-5" /><path {...common} d="M5 20h14" /></>}
      {name === 'external-link' && <><path {...common} d="M14 5h5v5" /><path {...common} d="m19 5-8 8" /><path {...common} d="M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></>}
      {name === 'file' && <><path {...common} d="M6 3h8l4 4v14H6z" /><path {...common} d="M14 3v5h4M9 13h6M9 17h6" /></>}
      {name === 'gavel' && <><path {...common} d="m14 4 6 6" /><path {...common} d="m12 6 6 6" /><path {...common} d="m3 21 9-9" /><path {...common} d="m5 14 5 5" /><path {...common} d="M3 21h8" /></>}
      {name === 'grid' && <><rect {...common} x="4" y="4" width="6" height="6" rx="1" /><rect {...common} x="14" y="4" width="6" height="6" rx="1" /><rect {...common} x="4" y="14" width="6" height="6" rx="1" /><rect {...common} x="14" y="14" width="6" height="6" rx="1" /></>}
      {name === 'guide' && <><path {...common} d="M5 4.5A2.5 2.5 0 0 1 7.5 2H19v17H7.5A2.5 2.5 0 0 0 5 21.5z" /><path {...common} d="M5 4.5v17M9 7h6M9 11h6" /></>}
      {name === 'home' && <><path {...common} d="m3 11 9-8 9 8" /><path {...common} d="M5 10v10h14V10M9 20v-6h6v6" /></>}
      {name === 'info' && <><circle {...common} cx="12" cy="12" r="9" /><path {...common} d="M12 11v5M12 8h.01" /></>}
      {name === 'layers' && <><path {...common} d="m12 3 9 5-9 5-9-5z" /><path {...common} d="m3 12 9 5 9-5" /><path {...common} d="m3 16 9 5 9-5" /></>}
      {name === 'menu' && <><path {...common} d="M5 7h14M5 12h14M5 17h14" /></>}
      {name === 'search' && <><circle {...common} cx="11" cy="11" r="6.5" /><path {...common} d="m16 16 4 4" /></>}
      {name === 'shield' && <><path {...common} d="M12 3 19 6v5c0 4.5-2.7 8-7 10-4.3-2-7-5.5-7-10V6z" /><path {...common} d="m9 12 2 2 4-4" /></>}
      {name === 'sliders' && <><path {...common} d="M4 7h16M4 17h16" /><circle {...common} cx="9" cy="7" r="2" /><circle {...common} cx="15" cy="17" r="2" /></>}
      {name === 'spark' && <><path {...common} d="m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4z" /><path {...common} d="M19 16v5M21.5 18.5h-5" /></>}
      {name === 'wrench' && <><path {...common} d="M14.7 6.3a4 4 0 0 0-5 5L4 17a2.1 2.1 0 1 0 3 3l5.7-5.7a4 4 0 0 0 5-5l-3 3-3-3z" /></>}
    </svg>
  )
}
