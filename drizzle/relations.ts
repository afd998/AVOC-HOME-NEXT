import { relations } from "drizzle-orm/relations";
import { faculty, facultySetup, profiles, actions, events, tasks, qcs, notifications, taskDict, panoptoChecks, shifts, facultyEvents, resourceEvents, resourcesDict, propertiesEvents, propertiesDict, qcItems, qcItemDict } from "./schema";

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

export const actionsRelations = relations(actions, ({one}) => ({
	profile_assignedTo: one(profiles, {
		fields: [actions.assignedTo],
		references: [profiles.id],
		relationName: "actions_assignedTo_profiles_id"
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
}));

export const profilesRelations = relations(profiles, ({many}) => ({
	actions_assignedTo: many(actions, {
		relationName: "actions_assignedTo_profiles_id"
	}),
	actions_completedBy: many(actions, {
		relationName: "actions_completedBy_profiles_id"
	}),
	notifications: many(notifications),
	tasks_assignedTo: many(tasks, {
		relationName: "tasks_assignedTo_profiles_id"
	}),
	tasks_completedBy: many(tasks, {
		relationName: "tasks_completedBy_profiles_id"
	}),
	events: many(events),
	panoptoChecks: many(panoptoChecks),
	shifts: many(shifts),
}));

export const eventsRelations = relations(events, ({one, many}) => ({
	actions: many(actions),
	notifications: many(notifications),
	tasks: many(tasks),
	profile: one(profiles, {
		fields: [events.manOwner],
		references: [profiles.id]
	}),
	panoptoChecks: many(panoptoChecks),
	facultyEvents: many(facultyEvents),
	resourceEvents: many(resourceEvents),
	propertiesEvents: many(propertiesEvents),
}));

export const qcsRelations = relations(qcs, ({one, many}) => ({
	task: one(tasks, {
		fields: [qcs.task],
		references: [tasks.id]
	}),
	qcItems: many(qcItems),
}));

export const tasksRelations = relations(tasks, ({one, many}) => ({
	qcs: many(qcs),
	profile_assignedTo: one(profiles, {
		fields: [tasks.assignedTo],
		references: [profiles.id],
		relationName: "tasks_assignedTo_profiles_id"
	}),
	profile_completedBy: one(profiles, {
		fields: [tasks.completedBy],
		references: [profiles.id],
		relationName: "tasks_completedBy_profiles_id"
	}),
	event: one(events, {
		fields: [tasks.event],
		references: [events.id]
	}),
	taskDict: one(taskDict, {
		fields: [tasks.taskDict],
		references: [taskDict.id]
	}),
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

export const taskDictRelations = relations(taskDict, ({many}) => ({
	tasks: many(tasks),
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

export const propertiesEventsRelations = relations(propertiesEvents, ({one}) => ({
	event: one(events, {
		fields: [propertiesEvents.event],
		references: [events.id]
	}),
	propertiesDict: one(propertiesDict, {
		fields: [propertiesEvents.propertiesDict],
		references: [propertiesDict.id]
	}),
}));

export const propertiesDictRelations = relations(propertiesDict, ({many}) => ({
	propertiesEvents: many(propertiesEvents),
}));

export const qcItemsRelations = relations(qcItems, ({one}) => ({
	qc: one(qcs, {
		fields: [qcItems.qc],
		references: [qcs.task]
	}),
	qcItemDict: one(qcItemDict, {
		fields: [qcItems.qcItemDict],
		references: [qcItemDict.id]
	}),
}));

export const qcItemDictRelations = relations(qcItemDict, ({many}) => ({
	qcItems: many(qcItems),
}));