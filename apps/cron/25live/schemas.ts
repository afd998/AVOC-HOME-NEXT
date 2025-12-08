import { z } from "zod";

const availabilityEventItemSchema = z
  .object({
    itemId: z.coerce.number(),
    itemId2: z.coerce.number(),
    itemName: z.string().nullable().optional(),
    start: z.union([z.number(), z.string()]),
    end: z.union([z.number(), z.string()]),
  })
  .catchall(z.unknown());

const availabilitySubjectSchema = z
  .object({
    items: z.array(availabilityEventItemSchema).optional(),
  })
  .catchall(z.unknown());

export const availabilityResponseSchema = z
  .object({
    subjects: z.array(availabilitySubjectSchema).optional(),
  })
  .catchall(z.unknown());

// New API schemas for events.json endpoint
const resourceSchema = z
  .object({
    resource_name: z.string(),
  })
  .catchall(z.unknown());

const resourceReservationSchema = z
  .object({
    resource: resourceSchema.optional(),
    resource_id: z.coerce.number().optional(),
    resource_instructions: z.string().nullable().optional(),
    quantity: z.coerce.number().optional(),
    status: z.string().optional(),
    crc: z.string().optional(),
  })
  .catchall(z.unknown());

const spaceSchema = z
  .object({
    space_name: z.string(),
    formal_name: z.string().optional(),
    building_name: z.string().nullable().optional(),
    partition_name: z.string().optional(),
    max_capacity: z.coerce.number().optional(),
  })
  .catchall(z.unknown());

const spaceReservationSchema = z
  .object({
    space: spaceSchema.optional(),
    space_id: z.coerce.number().optional(),
    space_instructions: z.string().nullable().optional(),
    default_layout_capacity: z.coerce.number().optional(),
    selected_layout_capacity: z.coerce.number().optional(),
    attendance: z.coerce.number().optional(),
    status: z.string().optional(),
    crc: z.string().optional(),
  })
  .catchall(z.unknown());

const reservationSchema = z
  .object({
    reservation_id: z.coerce.number(),
    reservation_start_dt: z.string().nullable().optional(),
    reservation_end_dt: z.string().nullable().optional(),
    event_start_dt: z.string().nullable().optional(),
    event_end_dt: z.string().nullable().optional(),
    pre_event_dt: z.string().nullable().optional(),
    post_event_dt: z.string().nullable().optional(),
    // resource_reservation can be a single object or an array of objects
    resource_reservation: z.union([resourceReservationSchema, z.array(resourceReservationSchema)]).optional(),
    // space_reservation can be a single object or an array of objects
    space_reservation: z.union([spaceReservationSchema, z.array(spaceReservationSchema)]).optional(),
    reservation_state: z.coerce.number().optional(),
    attendee_count: z.string().nullable().optional(),
    rsrv_comments: z.string().nullable().optional(),
    // rsrv_comment_id can be a string or a number (coerce number to string)
    rsrv_comment_id: z.coerce.string().nullable().optional(),
    status: z.string().optional(),
    crc: z.string().optional(),
  })
  .catchall(z.unknown());

const profileSchema = z
  .object({
    profile_id: z.coerce.number().optional(),
    profile_name: z.string().optional(),
    profile_code: z.string().optional(),
    profile_description: z.string().nullable().optional(),
    profile_comments: z.string().nullable().optional(),
    occurrence_count: z.coerce.number().optional(),
    rec_type_id: z.coerce.number().optional(),
    rec_type_name: z.string().optional(),
    init_start_dt: z.string().nullable().optional(),
    init_end_dt: z.string().nullable().optional(),
    registered_count: z.coerce.number().optional(),
    expected_count: z.coerce.number().optional(),
    prof_use: z.coerce.number().optional(),
    prof_use_name: z.string().optional(),
    pre_event: z.string().nullable().optional(),
    post_event: z.string().nullable().optional(),
    status: z.string().optional(),
    crc: z.string().optional(),
    id: z.string().optional(),
    // Profile can have single reservation or array of reservations
    reservation: z.union([reservationSchema, z.array(reservationSchema)]).optional(),
  })
  .catchall(z.unknown());

const eventSchema = z
  .object({
    event_id: z.coerce.number().optional(),
    id: z.string().optional(),
    event_name: z.string().optional(),
    event_title: z.string().optional(),
    event_locator: z.string().optional(),
    event_type_id: z.coerce.number().optional(),
    event_type_name: z.string().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    state: z.coerce.number().optional(),
    state_name: z.string().optional(),
    cabinet_id: z.coerce.number().optional(),
    cabinet_name: z.string().optional(),
    parent_id: z.coerce.number().optional(),
    creation_dt: z.string().optional(),
    last_mod_dt: z.string().optional(),
    last_mod_user: z.string().optional(),
    alien_uid: z.string().optional(),
    favorite: z.string().optional(),
    event_priority: z.coerce.number().optional(),
    registration_url: z.string().nullable().optional(),
    version_number: z.coerce.number().optional(),
    node_type: z.string().optional(),
    node_type_name: z.string().optional(),
    crc: z.string().optional(),
    status: z.string().optional(),
    // profile can be a single object or an array of objects
    profile: z.union([profileSchema, z.array(profileSchema)]).optional(),
    // todo can be a single object or an array of objects
    todo: z.union([z.unknown(), z.array(z.unknown())]).optional(),
  })
  .catchall(z.unknown());

export const eventsResponseSchema = z
  .object({
    events: z
      .object({
        engine: z.string().optional(),
        event: eventSchema.optional(),
        pubdate: z.string().optional(),
      })
      .optional(),
  })
  .catchall(z.unknown());

// Flattened structure for backward compatibility
// We'll flatten all profile reservations into a single array
const flattenedReservationSchema = reservationSchema;

const flattenedProfileSchema = z
  .object({
    rsv: z.array(flattenedReservationSchema).optional(),
  })
  .catchall(z.unknown());

const eventDetailOccurrenceSchema = z
  .object({
    prof: z.array(flattenedProfileSchema).optional(),
  })
  .catchall(z.unknown());


export const eventDetailSchema = z
  .object({
    itemId: z.coerce.number().optional(),
    event_type_name: z.string().optional(),
    event_type_id: z.coerce.number().optional(),
    event_name: z.string().optional(),
    event_title: z.string().optional(),
    event_locator: z.string().optional(),
    cabinet_name: z.string().optional(),
    profile_comments: z.array(z.string()).optional(),
    occur: eventDetailOccurrenceSchema.optional(),
  })
  .catchall(z.unknown());

export const eventDetailResponseSchema = z
  .object({
    events: z
      .object({
        engine: z.string().optional(),
        event: eventSchema.optional(),
        pubdate: z.string().optional(),
      })
      .optional(),
  })
  .catchall(z.unknown());

export const rawEventSchema = availabilityEventItemSchema
  .extend({
    subject_itemName: z.string().nullable().optional(),
    subject_item_date: z.string().nullable().optional(),
    subject_itemId: z.coerce.number(),
    itemDetails: eventDetailSchema.optional(),
    error: z.string().optional(),
  })
  .catchall(z.unknown());

export type AvailabilitySubject = z.infer<typeof availabilitySubjectSchema>;
export type AvailabilityResponse = z.infer<typeof availabilityResponseSchema>;
export type EventDetail = z.infer<typeof eventDetailSchema>;
export type RawEvent = z.infer<typeof rawEventSchema>;
export type EventDetailReservation = z.infer<typeof flattenedReservationSchema>;
export type EventsResponse = z.infer<typeof eventsResponseSchema>;
export type Event = z.infer<typeof eventSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type Reservation = z.infer<typeof reservationSchema>;
export type ResourceReservation = z.infer<typeof resourceReservationSchema>;
export type SpaceReservation = z.infer<typeof spaceReservationSchema>;
