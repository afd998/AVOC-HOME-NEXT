import { relations } from "drizzle-orm/relations";
import { faculty, facultySetup, events, eventHybrid, eventAvConfig, eventRecording, profiles, actions, notifications, series, venues, panoptoChecks, shifts, facultyEvents, shiftBlockProfile, shiftBlocks, shiftBlockProfileRoom, resourceEvents, resourcesDict, eventOtherHardware, otherHardwareDict, qcItemDict, qcItems } from "./schema";

export const facultySetupRelations = relations(facultySetup, ({one}) => ({
	faculty: one(faculty, {
		fields: [facultySetup.faculty],
		references: [faculty.id]
	}),
}));

export const facultyRelations = relations(faculty, ({many}) => ({
	facultySetups: many(facultySetup),
	facultyEvents: many(facultyEvents),
}));

export const eventHybridRelations = relations(eventHybrid, ({one}) => ({
	event: one(events, {
		fields: [eventHybrid.event],
		references: [events.id]
	}),
}));

export const eventsRelations = relations(events, ({one, many}) => ({
	eventHybrids: many(eventHybrid),
	eventAvConfigs: many(eventAvConfig),
	eventRecordings: many(eventRecording),
	actions: many(actions),
	notifications: many(notifications),
	profile: one(profiles, {
		fields: [events.manOwner],
		references: [profiles.id]
	}),
	series: one(series, {
		fields: [events.series],
		references: [series.id]
	}),
	venue: one(venues, {
		fields: [events.venue],
		references: [venues.id]
	}),
	panoptoChecks: many(panoptoChecks),
	facultyEvents: many(facultyEvents),
	resourceEvents: many(resourceEvents),
	eventOtherHardwares: many(eventOtherHardware),
}));

export const eventAvConfigRelations = relations(eventAvConfig, ({one}) => ({
	event: one(events, {
		fields: [eventAvConfig.event],
		references: [events.id]
	}),
}));

export const eventRecordingRelations = relations(eventRecording, ({one}) => ({
	event: one(events, {
		fields: [eventRecording.event],
		references: [events.id]
	}),
}));

export const actionsRelations = relations(actions, ({one, many}) => ({
	profile_assignedTo: one(profiles, {
		fields: [actions.assignedTo],
		references: [profiles.id],
		relationName: "actions_assignedTo_profiles_id"
	}),
	profile_assignedToManual: one(profiles, {
		fields: [actions.assignedToManual],
		references: [profiles.id],
		relationName: "actions_assignedToManual_profiles_id"
	}),
	profile_completedBy: one(profiles, {
		fields: [actions.completedBy],
		references: [profiles.id],
		relationName: "actions_completedBy_profiles_id"
	}),
	event: one(events, {
		fields: [actions.event],
		references: [events.id]
	}),
	qcItems: many(qcItems),
}));

export const profilesRelations = relations(profiles, ({many}) => ({
	actions_assignedTo: many(actions, {
		relationName: "actions_assignedTo_profiles_id"
	}),
	actions_assignedToManual: many(actions, {
		relationName: "actions_assignedToManual_profiles_id"
	}),
	actions_completedBy: many(actions, {
		relationName: "actions_completedBy_profiles_id"
	}),
	notifications: many(notifications),
	events: many(events),
	panoptoChecks: many(panoptoChecks),
	shifts: many(shifts),
	shiftBlockProfiles: many(shiftBlockProfile),
	shiftBlockProfileRooms: many(shiftBlockProfileRoom),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	event: one(events, {
		fields: [notifications.eventId],
		references: [events.id]
	}),
	profile: one(profiles, {
		fields: [notifications.userId],
		references: [profiles.id]
	}),
}));

export const seriesRelations = relations(series, ({many}) => ({
	events: many(events),
}));

export const venuesRelations = relations(venues, ({many}) => ({
	events: many(events),
	shiftBlockProfileRooms: many(shiftBlockProfileRoom),
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

export const shiftsRelations = relations(shifts, ({one}) => ({
	profile: one(profiles, {
		fields: [shifts.profileId],
		references: [profiles.id]
	}),
}));

export const facultyEventsRelations = relations(facultyEvents, ({one}) => ({
	event: one(events, {
		fields: [facultyEvents.event],
		references: [events.id]
	}),
	faculty: one(faculty, {
		fields: [facultyEvents.faculty],
		references: [faculty.id]
	}),
}));

export const shiftBlockProfileRelations = relations(shiftBlockProfile, ({one}) => ({
	profile: one(profiles, {
		fields: [shiftBlockProfile.profile],
		references: [profiles.id]
	}),
	shiftBlock: one(shiftBlocks, {
		fields: [shiftBlockProfile.shiftBlock],
		references: [shiftBlocks.id]
	}),
}));

export const shiftBlocksRelations = relations(shiftBlocks, ({many}) => ({
	shiftBlockProfiles: many(shiftBlockProfile),
	shiftBlockProfileRooms: many(shiftBlockProfileRoom),
}));

export const shiftBlockProfileRoomRelations = relations(shiftBlockProfileRoom, ({one}) => ({
	profile: one(profiles, {
		fields: [shiftBlockProfileRoom.profile],
		references: [profiles.id]
	}),
	venue: one(venues, {
		fields: [shiftBlockProfileRoom.room],
		references: [venues.id]
	}),
	shiftBlock: one(shiftBlocks, {
		fields: [shiftBlockProfileRoom.shiftBlock],
		references: [shiftBlocks.id]
	}),
}));

export const resourceEventsRelations = relations(resourceEvents, ({one}) => ({
	event: one(events, {
		fields: [resourceEvents.eventId],
		references: [events.id]
	}),
	resourcesDict: one(resourcesDict, {
		fields: [resourceEvents.resourceId],
		references: [resourcesDict.id]
	}),
}));

export const resourcesDictRelations = relations(resourcesDict, ({many}) => ({
	resourceEvents: many(resourceEvents),
}));

export const eventOtherHardwareRelations = relations(eventOtherHardware, ({one}) => ({
	event: one(events, {
		fields: [eventOtherHardware.event],
		references: [events.id]
	}),
	otherHardwareDict: one(otherHardwareDict, {
		fields: [eventOtherHardware.otherHardwareDict],
		references: [otherHardwareDict.id]
	}),
}));

export const otherHardwareDictRelations = relations(otherHardwareDict, ({many}) => ({
	eventOtherHardwares: many(eventOtherHardware),
}));

export const qcItemsRelations = relations(qcItems, ({one}) => ({
	qcItemDict: one(qcItemDict, {
		fields: [qcItems.qcItemDict],
		references: [qcItemDict.id]
	}),
	action: one(actions, {
		fields: [qcItems.action],
		references: [actions.id]
	}),
}));

export const qcItemDictRelations = relations(qcItemDict, ({many}) => ({
	qcItems: many(qcItems),
}));