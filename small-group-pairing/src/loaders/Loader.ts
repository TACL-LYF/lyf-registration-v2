/**
 * Abstract class for loading data from a source.
 * Designed such that the implementing class could do all the loading in one go in the constructor or piece by piece in the methods.
 *
 * B represents an abstract type for whatever multipler category we use.
 */

import {Camper, Clique, Group} from "../types"

export abstract class Loader<T, B> {
  /**
   * Load the group data from a source.
   * @returns A list of groups.
   */
  abstract loadGroups(): Promise<Group<T>[]>

  /**
   * Load the camper data from a source.
   * @returns A list of campers. Metadata is any type since the loader won't provide metadata. Should use a MetadataProvider to get metadata
   */
  abstract loadCampers(): Promise<Camper<T>[]>

  /**
   * Load the cliques between campers.
   * @returns A list of Cliques.
   */
  abstract loadCliques(): Promise<Clique<B>[]>
}
