import { pgTable, foreignKey, unique, pgPolicy, bigint, timestamp, boolean, text, uuid, time, jsonb, index, check, real, doublePrecision, date, bigserial, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const facultySetup = pgTable("faculty_setup", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	faculty: bigint({ mode: "number" }).generatedByDefaultAsIdentity({ name: "faculty_setup_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	usesMic: boolean("uses_mic"),
	leftSource: text("left_source"),
	rightSource: text("right_source"),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	mirroring360: boolean(),
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text(),
	notes: text(),
	leftDevice: text("left_device"),
	rightDevice: text("right_device"),
}, (table) => [
	foreignKey({
			columns: [table.faculty],
			foreignColumns: [faculty.id],
			name: "faculty_setup_faculty_fkey"
		}),
	unique("faculty_setup_id_key").on(table.id),
	pgPolicy("allow all to authenticated", { as: "permissive", for: "all", to: ["authenticated"], using: sql`true` }),
]);

export const eventTasks = pgTable("event_tasks", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "event_services_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	event: bigint({ mode: "number" }),
	status: text(),
	startTime: time("start_time"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	taskId: bigint("task_id", { mode: "number" }),
}, (table) => [
	foreignKey({
			columns: [table.event],
			foreignColumns: [events.id],
			name: "event_services_event_fkey"
		}),
	foreignKey({
			columns: [table.taskId],
			foreignColumns: [tasks.id],
			name: "event_tasks_task_id_fkey"
		}),
	pgPolicy("Allow all to authenticated", { as: "permissive", for: "all", to: ["authenticated"], using: sql`true` }),
]);

export const academicCalendar = pgTable("academic_calendar", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "academic_calendar_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	label: text(),
	date: timestamp({ withTimezone: true, mode: 'string' }),
	dateString: text("date_string"),
	startOfQuarter: boolean("start_of_quarter").default(false).notNull(),
}, (table) => [
	pgPolicy("Allow all to authenticated", { as: "permissive", for: "all", to: ["authenticated"], using: sql`true`, withCheck: sql`true`  }),
]);

export const organizations = pgTable("organizations", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "clubs_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	name: text(),
	logo: text(),
	about: text(),
	url: text(),
}, (table) => [
	pgPolicy("Policy with security definer functions", { as: "permissive", for: "all", to: ["authenticated"], using: sql`true` }),
]);

export const faculty = pgTable("faculty", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "faculty_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	kelloggdirectoryName: text("kelloggdirectory_name"),
	twentyfiveliveName: text("twentyfivelive_name"),
	kelloggdirectoryTitle: text("kelloggdirectory_title"),
	kelloggdirectoryBio: text("kelloggdirectory_bio"),
	kelloggdirectoryImageUrl: text("kelloggdirectory_image_url"),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	kelloggdirectoryBioUrl: text("kelloggdirectory_bio_url"),
	kelloggdirectorySubtitle: text("kelloggdirectory_subtitle"),
	cutoutImage: text("cutout_image"),
}, (table) => [
	unique("faculty_kelloggdirectory_name_key").on(table.kelloggdirectoryName),
	pgPolicy("Allow all to authenticated", { as: "permissive", for: "all", to: ["authenticated"], using: sql`true`, withCheck: sql`true`  }),
]);

export const notifications = pgTable("notifications", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id"),
	title: text().notNull(),
	message: text().notNull(),
	type: text().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	eventId: bigint("event_id", { mode: "number" }),
	readAt: timestamp("read_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	data: jsonb(),
}, (table) => [
	foreignKey({
			columns: [table.eventId],
			foreignColumns: [events.id],
			name: "notifications_event_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "notifications_user_id_fkey1"
		}),
	pgPolicy("Allow all to authenticated", { as: "permissive", for: "all", to: ["authenticated"], using: sql`true`, withCheck: sql`true`  }),
	pgPolicy("notifications_select_own", { as: "permissive", for: "select", to: ["authenticated"] }),
	pgPolicy("rt_select_all_notifications", { as: "permissive", for: "select", to: ["anon", "authenticated"] }),
]);

export const facultyUpdates = pgTable("faculty_updates", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "faculty_updates_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	faculty: bigint({ mode: "number" }),
	author: uuid().defaultRandom(),
	content: text(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	pgPolicy("Allow all to authenticated", { as: "permissive", for: "all", to: ["authenticated"], using: sql`true`, withCheck: sql`true`  }),
]);

export const tasks = pgTable("tasks", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "services_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	name: text(),
}, (table) => [
	pgPolicy("Allow all to authenticated", { as: "permissive", for: "all", to: ["authenticated"], using: sql`true` }),
]);

export const rooms = pgTable("rooms", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "rooms_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	name: text().notNull(),
	spelling: text(),
	type: text().default('CLASSROOM'),
	subType: text("sub_type").default('TIERED'),
}, (table) => [
	pgPolicy("Allow all to authenticated", { as: "permissive", for: "all", to: ["authenticated"], using: sql`true`, withCheck: sql`true`  }),
]);

export const profiles = pgTable("profiles", {
	id: uuid().primaryKey().notNull(),
	name: text(),
	autoHide: boolean("auto_hide").default(false).notNull(),
	currentFilter: text("current_filter"),
	bg: text(),
	roles: jsonb().default([]).notNull(),
	theme: text().default('dark').notNull(),
	color: text(),
	zoom: real(),
	pixelsPerMin: doublePrecision("pixels_per_min"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	rowHeight: bigint("row_height", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	startHour: bigint("start_hour", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	endHour: bigint("end_hour", { mode: "number" }),
}, (table) => [
	index("idx_profiles_name").using("btree", table.name.asc().nullsLast().op("text_ops")),
	index("idx_profiles_roles").using("gin", table.roles.asc().nullsLast().op("jsonb_ops")),
	pgPolicy("Allow all to authenticated", { as: "permissive", for: "all", to: ["anon", "authenticated"], using: sql`true`, withCheck: sql`true`  }),
	check("check_roles_is_array", sql`jsonb_typeof(roles) = 'array'::text`),
]);

export const roomFilters = pgTable("room_filters", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "room_filters_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	name: text(),
	display: jsonb(),
}, (table) => [
	pgPolicy("Allow all to authenticated", { as: "permissive", for: "all", to: ["authenticated"], using: sql`true`, withCheck: sql`true`  }),
]);

export const events = pgTable("events", {
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	eventType: text("event_type"),
	lectureTitle: text("lecture_title"),
	roomName: text("room_name").notNull(),
	resources: jsonb().default([]),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "events_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	itemId2: bigint("item_id2", { mode: "number" }),
	startTime: time("start_time"),
	endTime: time("end_time"),
	raw: jsonb(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	itemId: bigint("item_id", { mode: "number" }),
	eventName: text("event_name"),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	manOwner: uuid("man_owner"),
	date: date(),
	instructorNames: jsonb("instructor_names"),
	organization: text(),
}, (table) => [
	index("idx_events_date_start_time").using("btree", table.date.asc().nullsLast().op("date_ops"), table.startTime.asc().nullsLast().op("date_ops")),
	index("idx_events_event_name_start_time").using("btree", table.eventName.asc().nullsLast().op("text_ops"), table.startTime.asc().nullsLast().op("text_ops")),
	index("idx_events_event_type").using("btree", table.eventType.asc().nullsLast().op("text_ops")),
	index("idx_events_id").using("btree", table.id.asc().nullsLast().op("int8_ops")),
	index("idx_events_room_name").using("btree", table.roomName.asc().nullsLast().op("text_ops")),
	index("idx_events_start_time").using("btree", table.startTime.asc().nullsLast().op("time_ops")),
	foreignKey({
			columns: [table.manOwner],
			foreignColumns: [profiles.id],
			name: "events_man_owner_fkey"
		}),
	pgPolicy("Allow all to authenticated", { as: "permissive", for: "all", to: ["authenticated"], using: sql`true`, withCheck: sql`true`  }),
	check("instructor_name_is_array_or_null", sql`(instructor_names IS NULL) OR (jsonb_typeof(instructor_names) = 'array'::text)`),
]);

export const panoptoChecks = pgTable("panopto_checks", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	eventId: bigint("event_id", { mode: "number" }).notNull(),
	checkTime: time("check_time").notNull(),
	completedTime: time("completed_time"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	completedByUserId: uuid("completed_by_user_id"),
	status: text(),
}, (table) => [
	foreignKey({
			columns: [table.completedByUserId],
			foreignColumns: [profiles.id],
			name: "panopto_checks_completed_by_user_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.eventId],
			foreignColumns: [events.id],
			name: "panopto_checks_event_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("Allow all to authenticated", { as: "permissive", for: "all", to: ["authenticated"], using: sql`true` }),
]);

export const shiftBlocks = pgTable("shift_blocks", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "shift_blocks_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	assignments: jsonb(),
	startTime: time("start_time"),
	endTime: time("end_time"),
	date: date(),
}, (table) => [
	pgPolicy("Allow all to authenticated", { as: "permissive", for: "all", to: ["authenticated"], using: sql`true`, withCheck: sql`true`  }),
]);

export const shifts = pgTable("shifts", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "shifts_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	profileId: uuid("profile_id"),
	startTime: time("start_time"),
	endTime: time("end_time"),
	date: date(),
}, (table) => [
	foreignKey({
			columns: [table.profileId],
			foreignColumns: [profiles.id],
			name: "shifts_profile_id_fkey"
		}),
	pgPolicy("Allow all to authenticated", { as: "permissive", for: "all", to: ["authenticated"], using: sql`true`, withCheck: sql`true`  }),
]);

export const facultyEvents = pgTable("faculty_events", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	faculty: bigint({ mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	event: bigint({ mode: "number" }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.event],
			foreignColumns: [events.id],
			name: "faculty_events_event_fkey"
		}),
	foreignKey({
			columns: [table.faculty],
			foreignColumns: [faculty.id],
			name: "faculty_events_faculty_fkey"
		}),
	primaryKey({ columns: [table.faculty, table.event], name: "faculty_events_pkey"}),
]);
