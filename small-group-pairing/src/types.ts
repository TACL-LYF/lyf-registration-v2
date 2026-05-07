export type CamperId = string
export type GroupId = string

export interface Camper<T> {
  id: CamperId
  name: string
  groupId?: GroupId
  metadata?: T
}

export interface Group<T> {
  id: GroupId
  minSize: number
  maxSize: number
  members: Set<Camper<T>>
}

// All edges are undirected. The multiplier category can be any type but ideally an enum.
// A clique is a set of campers that are all adjacent to each other. We'll use this
// to represent various types of connections between campers.
export interface Clique<T> {
  // Every camperId will have an edge to every other camperId in this list.
  camperIds: CamperId[]
  weight: number
  multiplerCategory: T
}
