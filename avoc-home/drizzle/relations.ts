import { relations } from "drizzle-orm/relations";
import { profiles, events, shifts, notifications, usersInAuth, panoptoChecks } from "./schema";

export const eventsRelations = relations(events, ({one, many}) => ({
	profile: one(profiles, {
		fields: [events.manOwner],
		references: [profiles.id]
	}),
	notifications: many(notifications),
	panoptoChecks: many(panoptoChecks),
}));

export const profilesRelations = relations(profiles, ({many}) => ({
	events: many(events),
	shifts: many(shifts),
	panoptoChecks: many(panoptoChecks),
}));

export const shiftsRelations = relations(shifts, ({one}) => ({
	profile: one(profiles, {
		fields: [shifts.profileId],
		references: [profiles.id]
	}),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	event: one(events, {
		fields: [notifications.eventId],
		references: [events.id]
	}),
	usersInAuth: one(usersInAuth, {
		fields: [notifications.userId],
		references: [usersInAuth.id]
	}),
}));

export const usersInAuthRelations = relations(usersInAuth, ({many}) => ({
	notifications: many(notifications),
}));

export const panoptoChecksRelations = relations(panoptoChecks, ({one}) => ({
	profile: one(profiles, {
		fields: [panoptoChecks.completedByUserId],
		references: [profiles.id]
	}),
	event: one(events, {
		fields: [panoptoChecks.eventId],
		references: [events.id]
	}),
}));