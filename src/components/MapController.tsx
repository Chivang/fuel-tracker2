'use client'

import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

interface MapControllerProps {
  center?: [number, number]
  zoom?: number
}

/**
 * MapController is a helper component that allows us to move the map
 * programmatically from within a MapContainer.
 */
export default function MapController({ center, zoom }: MapControllerProps) {
  const map = useMap()

  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || map.getZoom(), {
        duration: 1.5,
      })
    }
  }, [center, zoom, map])

  return null
}
