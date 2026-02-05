import { lazy, Suspense, useCallback } from 'react'
import type { Property } from '../types/property'
import FloatingStats from './FloatingStats'

const PropertyMap = lazy(() => import('./Map/PropertyMap'))
const PropertyTable = lazy(() => import('./PropertyTable'))

type Props = {
  properties: Property[]
}

function LoadingSpinner() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
    </div>
  )
}

export default function BoligView({ properties }: Props) {
  const handleSelectProperty = useCallback((_id: string) => {}, [])

  return (
    <div className="h-full flex flex-col">
      <div className="h-1/2 relative">
        <Suspense fallback={<LoadingSpinner />}>
          <FloatingStats properties={properties} />
          <PropertyMap properties={properties} />
        </Suspense>
      </div>
      <div className="h-1/2 overflow-auto">
        <Suspense fallback={<LoadingSpinner />}>
          <PropertyTable
            properties={properties}
            onSelectProperty={handleSelectProperty}
          />
        </Suspense>
      </div>
    </div>
  )
}
