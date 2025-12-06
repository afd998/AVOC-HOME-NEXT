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

const eventDetailResourceSchema = z
  .object({
    itemName: z.string(),
    quantity: z.coerce.number().optional(),
    instruction: z.string().nullable().optional(),
  })
  .catchall(z.unknown());

const eventDetailSpaceSchema = z
  .object({
    itemName: z.string().nullable().optional(),
  })
  .catchall(z.unknown());

const eventDetailReservationSchema = z
  .object({
    rsvId: z.coerce.number(),
    startDt: z.string().nullable().optional(),
    endDt: z.string().nullable().optional(),
    res: z.array(eventDetailResourceSchema).optional(),
    space: z.array(eventDetailSpaceSchema).optional(),
  })
  .catchall(z.unknown());

const eventDetailProfSchema = z
  .object({
    rsv: z.array(eventDetailReservationSchema).optional(),
  })
  .catchall(z.unknown());

const eventDetailNestedItemSchema: z.ZodType<{
  itemName?: string | number | null;
  item?: Array<Record<string, unknown>>;
}> = z.lazy(() =>
  z
    .object({
      itemName: z.union([z.string(), z.number()]).nullable().optional(),
      item: z.array(eventDetailNestedItemSchema).optional(),
    })
    .catchall(z.unknown())
);

const eventDetailPanelSchema = z
  .object({
    typeId: z.coerce.number().optional(),
    item: z.array(eventDetailNestedItemSchema).optional(),
  })
  .catchall(z.unknown());

const eventDetailDefinitionSchema = z
  .object({
    panel: z.array(eventDetailPanelSchema).optional(),
  })
  .catchall(z.unknown());

const eventDetailOccurrenceSchema = z
  .object({
    prof: z.array(eventDetailProfSchema).optional(),
  })
  .catchall(z.unknown());

export const eventDetailSchema = z
  .object({
    itemId: z.coerce.number().optional(),
    defn: eventDetailDefinitionSchema.optional(),
    occur: eventDetailOccurrenceSchema.optional(),
  })
  .catchall(z.unknown());

export const eventDetailResponseSchema = z
  .object({
    evdetail: eventDetailSchema.optional(),
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
export type EventDetailReservation = z.infer<typeof eventDetailReservationSchema>;
