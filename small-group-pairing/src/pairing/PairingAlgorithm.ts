/**
 * All of the various pairing algorithms used to match campers to groups.
 *
 * Regardless of implementation, all pairing algorithms should take a Pairings class, a list of Cliques, and multiplier category weights
 * All should return a modified deep copy of Pairings.
 *
 * A single implementation will be called in the final PairingEditor class.
 */

import {Pairings} from "./Pairings"
import {Clique} from "../types"

interface PairingAlgorithm<T, B> {
  (
    pairings: Pairings<T>,
    cliques: Clique<B>[],
    categoryWeights: Map<B, number>,
  ): Pairings<T>
}

const dummyAlgorithm: PairingAlgorithm<any, string> = (
  pairings,
  cliques,
  categoryWeights,
) => {
  return pairings.copy()
}
