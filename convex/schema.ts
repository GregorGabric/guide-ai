import { StreamIdValidator } from '@convex-dev/persistent-text-streaming';
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
export const placesSchema = v.object({
  places: v.optional(
    v.array(
      v.object({
        name: v.optional(v.string()),
        id: v.optional(v.string()),
        types: v.optional(v.array(v.string())),
        formattedAddress: v.optional(v.string()),
        location: v.optional(
          v.object({
            latitude: v.optional(v.number()),
            longitude: v.optional(v.number()),
          })
        ),
        rating: v.optional(v.number()),
        userRatingCount: v.optional(v.number()),
        priceLevel: v.optional(v.string()),
        displayName: v.optional(
          v.object({
            text: v.optional(v.string()),
            languageCode: v.optional(v.string()),
          })
        ),
        editorialSummary: v.optional(
          v.object({
            text: v.optional(v.string()),
            languageCode: v.optional(v.string()),
          })
        ),
        photos: v.optional(
          v.array(
            v.object({
              name: v.optional(v.string()),
              widthPx: v.optional(v.number()),
              heightPx: v.optional(v.number()),
              authorAttributions: v.optional(
                v.array(
                  v.object({
                    displayName: v.optional(v.string()),
                    uri: v.optional(v.string()),
                    photoUri: v.optional(v.string()),
                  })
                )
              ),
              flagContentUri: v.optional(v.string()),
              googleMapsUri: v.optional(v.string()),
            })
          )
        ),
        addressDescriptor: v.optional(
          v.object({
            landmarks: v.optional(
              v.array(
                v.object({
                  name: v.optional(v.string()),
                  placeId: v.optional(v.string()),
                  displayName: v.optional(
                    v.object({
                      text: v.optional(v.string()),
                      languageCode: v.optional(v.string()),
                    })
                  ),
                  types: v.optional(v.array(v.string())),
                  straightLineDistanceMeters: v.optional(v.number()),
                  travelDistanceMeters: v.optional(v.number()),
                  spatialRelationship: v.optional(v.string()),
                })
              )
            ),
            areas: v.optional(
              v.array(
                v.object({
                  name: v.optional(v.string()),
                  placeId: v.optional(v.string()),
                  displayName: v.optional(
                    v.object({
                      text: v.optional(v.string()),
                      languageCode: v.optional(v.string()),
                    })
                  ),
                  containment: v.optional(v.string()),
                })
              )
            ),
          })
        ),
      })
    )
  ),
  searchParams: v.optional(
    v.object({
      latitude: v.optional(v.number()),
      longitude: v.optional(v.number()),
      radius: v.optional(v.number()),
    })
  ),
});

export const attractionSchema = v.object({
  displayName: v.optional(v.string()),
  formattedAddress: v.optional(v.string()),
  summary: v.optional(v.string()),
});

export default defineSchema({
  messages: defineTable({
    role: v.union(v.literal('user'), v.literal('assistant')),
    content: v.string(),
    locationId: v.string(),
  }),
  userMessages: defineTable({
    prompt: v.string(),
    responseStreamId: StreamIdValidator,
    attraction: v.optional(attractionSchema),
  }),
  place: defineTable({
    name: v.string(),
    places: v.optional(placesSchema),
  }),
  places: defineTable({
    name: v.optional(v.string()),
    googlePlaceId: v.optional(v.string()),
    types: v.optional(v.array(v.string())),
    formattedAddress: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    rating: v.optional(v.number()),
    userRatingCount: v.optional(v.number()),
    priceLevel: v.optional(v.string()),
    displayName: v.optional(
      v.object({
        text: v.optional(v.string()),
        languageCode: v.optional(v.string()),
      })
    ),
    editorialSummary: v.optional(
      v.object({
        text: v.optional(v.string()),
        languageCode: v.optional(v.string()),
      })
    ),
    photos: v.optional(
      v.array(
        v.object({
          name: v.optional(v.string()),
          widthPx: v.optional(v.number()),
          heightPx: v.optional(v.number()),
          authorAttributions: v.optional(
            v.array(
              v.object({
                displayName: v.optional(v.string()),
                uri: v.optional(v.string()),
                photoUri: v.optional(v.string()),
              })
            )
          ),
          flagContentUri: v.optional(v.string()),
          googleMapsUri: v.optional(v.string()),
        })
      )
    ),
    addressDescriptor: v.optional(
      v.object({
        landmarks: v.optional(
          v.array(
            v.object({
              name: v.optional(v.string()),
              placeId: v.optional(v.string()),
              displayName: v.optional(
                v.object({
                  text: v.optional(v.string()),
                  languageCode: v.optional(v.string()),
                })
              ),
              types: v.optional(v.array(v.string())),
              straightLineDistanceMeters: v.optional(v.number()),
              travelDistanceMeters: v.optional(v.number()),
              spatialRelationship: v.optional(v.string()),
            })
          )
        ),
        areas: v.optional(
          v.array(
            v.object({
              name: v.optional(v.string()),
              placeId: v.optional(v.string()),
              displayName: v.optional(
                v.object({
                  text: v.optional(v.string()),
                  languageCode: v.optional(v.string()),
                })
              ),
              containment: v.optional(v.string()),
            })
          )
        ),
      })
    ),
    lastUpdated: v.optional(v.number()),
    searchRadius: v.optional(v.number()),
    searchLatitude: v.optional(v.number()),
    searchLongitude: v.optional(v.number()),
  })
    .index('by_location', ['searchLatitude', 'searchLongitude', 'searchRadius'])
    .index('by_google_place_id', ['googlePlaceId'])
    .index('by_last_updated', ['lastUpdated']),
});
