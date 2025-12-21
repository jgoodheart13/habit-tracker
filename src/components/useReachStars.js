// useReachStars.js
import { useCallback, useState } from "react"

/**
 * Simple hook to trigger Reach star spawns.
 *
 * Internally this just increments a key.
 * ReachStarsField listens for changes and spawns a star.
 *
 * Usage:
 * const { spawnKey, spawnStar } = useReachStars()
 *
 * <ReachStarsField spawnKey={spawnKey}>
 *   ...
 * </ReachStarsField>
 *
 * spawnStar() // call on each P2 completion
 */
export default function useReachStars() {
  const [spawnKey, setSpawnKey] = useState(0)

  const spawnStar = useCallback(() => {
    setSpawnKey((k) => k + 1)
  }, [])

  return {
    spawnKey,
    spawnStar,
  }
}
