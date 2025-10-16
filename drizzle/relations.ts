import { relations } from "drizzle-orm/relations";
import { faculty, facultySetup, events, eventTasks, tasks, notifications, profiles, facultyByods, panoptoChecks, shifts } from "./schema";

export const facultySetupRelations = relations(facultySetup, ({one}) => ({
	faculty: one(faculty, {
		fields: [facultySetup.faculty],
		references: [faculty.id]
	}),
}));

export const facultyRelations = relations(faculty, ({many}) => ({
	facultySetups: many(facultySetup),
	facultyByods: many(facultyByods),
}));

export const eventTasksRelations = relations(eventTasks, ({one}) => ({
	event: one(events, {
		fields: [eventTasks.event],
		references: [events.id]
	}),
	task: one(tasks, {
		fields: [eventTasks.taskId],
		references: [tasks.id]
	}),
}));

export const eventsRelations = relations(events, ({one, many}) => ({
	eventTasks: many(eventTasks),
	notifications: many(notifications),
	profile: one(profiles, {
		fields: [events.manOwner],
		references: [profiles.id]
	}),
	panoptoChecks: many(panoptoChecks),
}));

export const tasksRelations = relations(tasks, ({many}) => ({
	eventTasks: many(eventTasks),
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

export const profilesRelations = relations(profiles, ({many}) => ({
	notifications: many(notifications),
	events: many(events),
	panoptoChecks: many(panoptoChecks),
	shifts: many(shifts),
}));

export const facultyByodsRelations = relations(facultyByods, ({one}) => ({
	faculty: one(faculty, {
		fields: [facultyByods.faculty],
		references: [faculty.id]
	}),
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