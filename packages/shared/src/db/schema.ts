import { pgTable, foreignKey, unique, pgPolicy, bigint, timestamp, boolean, text, uuid, integer, time, jsonb, index, check, real, doublePrecision, date, primaryKey, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const failMode = pgEnum("fail_mode", ['Ticketed', 'Resolved Immediately'])
export const qcStatus = pgEnum("qc_status", ['na', 'pass', 'fail'])
export const waitedReason = pgEnum("waited_reason", ['Faculty Noncompliance'])


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

export const seriesClass = pgTable("series_class", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	series: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "series_class_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.series],
			foreignColumns: [series.id],
			name: "series_class_series_fkey"
		}).onDelete("cascade"),
]);

export const eventHybrid = pgTable("event_hybrid", {
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	event: bigint({ mode: "number" }).primaryKey().notNull(),
	config: text(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	meetingId: bigint("meeting_id", { mode: "number" }),
	meetingLink: text("meeting_link"),
	instructions: text(),
	source: text(),
}, (table) => [
	foreignKey({
			columns: [table.event],
			foreignColumns: [events.id],
			name: "event_hybrid_event_fkey"
		}).onDelete("cascade"),
]);

export const qcItemDict = pgTable("qc_item_dict", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "qc_item_def_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	displayName: text("display_name").notNull(),
	instruction: text().notNull(),
	icon: text(),
});

export const eventAvConfig = pgTable("event_av_config", {
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	event: bigint({ mode: "number" }).primaryKey().notNull(),
	leftSource: text("left_source"),
	rightSource: text("right_source"),
	leftDevice: text("left_device"),
	rightDevice: text("right_device"),
	handhelds: integer().default(0).notNull(),
	lapels: integer().default(0).notNull(),
	clicker: boolean(),
	centerSource: text("center_source"),
	centerDevice: text("center_device"),
}, (table) => [
	foreignKey({
			columns: [table.event],
			foreignColumns: [events.id],
			name: "event_av_config_event_fkey"
		}).onDelete("cascade"),
]);

export const eventRecording = pgTable("event_recording", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	event: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "event_recording_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	instructions: text(),
	type: text(),
}, (table) => [
	foreignKey({
			columns: [table.event],
			foreignColumns: [events.id],
			name: "event_recording_event_fkey"
		}).onDelete("cascade"),
]);

export const actions = pgTable("actions", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	event: bigint({ mode: "number" }),
	type: text().notNull(),
	startTime: time("start_time").notNull(),
	status: text().notNull(),
	assignedTo: uuid("assigned_to"),
	completedBy: uuid("completed_by"),
	completedTime: timestamp("completed_time", { withTimezone: true, mode: 'string' }),
	subType: text("sub_type"),
	source: text(),
	assignedToManual: uuid("assigned_to_manual"),
	notes: text(),
}, (table) => [
	foreignKey({
			columns: [table.assignedTo],
			foreignColumns: [profiles.id],
			name: "actions_assigned_to_fkey"
		}),
	foreignKey({
			columns: [table.assignedToManual],
			foreignColumns: [profiles.id],
			name: "actions_assigned_to_manual_fkey"
		}),
	foreignKey({
			columns: [table.completedBy],
			foreignColumns: [profiles.id],
			name: "actions_completed_by_fkey"
		}),
	foreignKey({
			columns: [table.event],
			foreignColumns: [events.id],
			name: "actions_event_fkey"
		}).onDelete("cascade"),
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
	email: text(),
}, (table) => [
	unique("faculty_kelloggdirectory_name_key").on(table.kelloggdirectoryName),
	pgPolicy("Allow all to authenticated", { as: "permissive", for: "all", to: ["authenticated"], using: sql`true`, withCheck: sql`true`  }),
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

export const venues = pgTable("venues", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "rooms_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	name: text().notNull(),
	spelling: text(),
	type: text().default('CLASSROOM'),
	subType: text("sub_type").default('TIERED'),
	building: text().default('GLOBAL HUB').notNull(),
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

export const series = pgTable("series", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	seriesName: text("series_name").notNull(),
	seriesType: text("series_type").notNull(),
	totalEvents: integer("total_events").notNull(),
	firstDate: date("first_date").notNull(),
	lastDate: date("last_date").notNull(),
	quarter: text(),
	year: integer(),
	raw: jsonb(),
});

export const resourcesDict = pgTable("resources_dict", {
	id: text().primaryKey().notNull(),
	name: text(),
	isAv: boolean("is_av"),
	icon: jsonb(),
}, (table) => [
	unique("resources_id_key").on(table.id),
]);

export const events = pgTable("events", {
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	resources: jsonb().default([]),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	itemId2: bigint("item_id2", { mode: "number" }),
	startTime: time("start_time").notNull(),
	endTime: time("end_time").notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	date: date().notNull(),
	transform: text(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	seriesPos: bigint("series_pos", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	series: bigint({ mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	venue: bigint({ mode: "number" }),
}, (table) => [
	index("idx_events_date_start_time").using("btree", table.date.asc().nullsLast().op("date_ops"), table.startTime.asc().nullsLast().op("date_ops")),
	index("idx_events_id").using("btree", table.id.asc().nullsLast().op("int8_ops")),
	index("idx_events_start_time").using("btree", table.startTime.asc().nullsLast().op("time_ops")),
	foreignKey({
			columns: [table.series],
			foreignColumns: [series.id],
			name: "events_series_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.venue],
			foreignColumns: [venues.id],
			name: "events_venue_fkey"
		}).onDelete("cascade"),
	pgPolicy("Allow all to authenticated", { as: "permissive", for: "all", to: ["authenticated"], using: sql`true`, withCheck: sql`true`  }),
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

export const venueFilters = pgTable("venue_filters", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "venue_filters_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	name: text(),
	display: jsonb(),
});

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

export const otherHardwareDict = pgTable("other_hardware_dict", {
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	id: text().primaryKey().notNull(),
}, (table) => [
	unique("other_hardware_dict_id_key").on(table.id),
]);

export const shiftBlockProfile = pgTable("shift_block_profile", {
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	shiftBlock: bigint("shift_block", { mode: "number" }).notNull(),
	profile: uuid().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.profile],
			foreignColumns: [profiles.id],
			name: "shift_block_profile_profile_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.shiftBlock],
			foreignColumns: [shiftBlocks.id],
			name: "shift_block_profile_shift_block_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.shiftBlock, table.profile], name: "shift_block_profile_pkey"}),
]);

export const seriesFaculty = pgTable("series_faculty", {
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	faculty: bigint({ mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	series: bigint({ mode: "number" }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.faculty],
			foreignColumns: [faculty.id],
			name: "series_faculty_faculty_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.series],
			foreignColumns: [series.id],
			name: "series_faculty_series_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.faculty, table.series], name: "series_faculty_pkey"}),
]);

export const shiftBlockProfileRoom = pgTable("shift_block_profile_room", {
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	room: bigint({ mode: "number" }).notNull(),
	profile: uuid().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	shiftBlock: bigint("shift_block", { mode: "number" }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.profile],
			foreignColumns: [profiles.id],
			name: "shift_block_profile_room_profile_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.room],
			foreignColumns: [venues.id],
			name: "shift_block_profile_room_room_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.shiftBlock],
			foreignColumns: [shiftBlocks.id],
			name: "shift_block_profile_room_shift_block_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.room, table.profile, table.shiftBlock], name: "shift_block_profile_room_pkey"}),
]);

export const resourceEvents = pgTable("resource_events", {
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	resourceId: text("resource_id").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	eventId: bigint("event_id", { mode: "number" }).notNull(),
	quantity: integer().default(1).notNull(),
	instructions: text(),
}, (table) => [
	foreignKey({
			columns: [table.eventId],
			foreignColumns: [events.id],
			name: "fk_event"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.resourceId],
			foreignColumns: [resourcesDict.id],
			name: "fk_resource"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.resourceId, table.eventId], name: "resource_events_pkey"}),
]);

export const eventOtherHardware = pgTable("event_other_hardware", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	event: bigint({ mode: "number" }).generatedByDefaultAsIdentity({ name: "event_external_hardware_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	quantity: integer(),
	instructions: text(),
	otherHardwareDict: text("other_hardware_dict").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.event],
			foreignColumns: [events.id],
			name: "event_other_hardware_event_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.otherHardwareDict],
			foreignColumns: [otherHardwareDict.id],
			name: "event_other_hardware_other_hardware_dict_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.event, table.otherHardwareDict], name: "event_other_hardware_pkey"}),
]);

export const qcItems = pgTable("qc_items", {
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	action: bigint({ mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	qcItemDict: bigint("qc_item_dict", { mode: "number" }).notNull(),
	snTicket: text("sn_ticket"),
	waived: boolean(),
	waivedReason: waitedReason("waived_reason"),
	failMode: failMode("fail_mode"),
	status: qcStatus(),
}, (table) => [
	foreignKey({
			columns: [table.qcItemDict],
			foreignColumns: [qcItemDict.id],
			name: "qc_item_qc_item_dict_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.action],
			foreignColumns: [actions.id],
			name: "qc_items_action_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.action, table.qcItemDict], name: "qc_items_pk"}),
]);
