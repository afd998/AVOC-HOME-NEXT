"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resourceEvents = exports.facultyEvents = exports.shifts = exports.shiftBlocks = exports.panoptoChecks = exports.events = exports.resourcesDict = exports.tasks = exports.roomFilters = exports.profiles = exports.rooms = exports.facultyUpdates = exports.notifications = exports.faculty = exports.organizations = exports.academicCalendar = exports.facultySetup = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
var drizzle_orm_1 = require("drizzle-orm");
exports.facultySetup = (0, pg_core_1.pgTable)("faculty_setup", {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    faculty: (0, pg_core_1.bigint)({ mode: "number" }).generatedByDefaultAsIdentity({ name: "faculty_setup_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    usesMic: (0, pg_core_1.boolean)("uses_mic"),
    leftSource: (0, pg_core_1.text)("left_source"),
    rightSource: (0, pg_core_1.text)("right_source"),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true, mode: 'string' }),
    mirroring360: (0, pg_core_1.boolean)(),
    id: (0, pg_core_1.uuid)().defaultRandom().primaryKey().notNull(),
    name: (0, pg_core_1.text)(),
    notes: (0, pg_core_1.text)(),
    leftDevice: (0, pg_core_1.text)("left_device"),
    rightDevice: (0, pg_core_1.text)("right_device"),
}, function (table) { return [
    (0, pg_core_1.foreignKey)({
        columns: [table.faculty],
        foreignColumns: [exports.faculty.id],
        name: "faculty_setup_faculty_fkey"
    }),
    (0, pg_core_1.unique)("faculty_setup_id_key").on(table.id),
    (0, pg_core_1.pgPolicy)("allow all to authenticated", { as: "permissive", for: "all", to: ["authenticated"], using: (0, drizzle_orm_1.sql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["true"], ["true"]))) }),
]; });
exports.academicCalendar = (0, pg_core_1.pgTable)("academic_calendar", {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: (0, pg_core_1.bigint)({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "academic_calendar_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
    label: (0, pg_core_1.text)(),
    date: (0, pg_core_1.timestamp)({ withTimezone: true, mode: 'string' }),
    dateString: (0, pg_core_1.text)("date_string"),
    startOfQuarter: (0, pg_core_1.boolean)("start_of_quarter").default(false).notNull(),
}, function (table) { return [
    (0, pg_core_1.pgPolicy)("Allow all to authenticated", { as: "permissive", for: "all", to: ["authenticated"], using: (0, drizzle_orm_1.sql)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["true"], ["true"]))), withCheck: (0, drizzle_orm_1.sql)(templateObject_3 || (templateObject_3 = __makeTemplateObject(["true"], ["true"]))) }),
]; });
exports.organizations = (0, pg_core_1.pgTable)("organizations", {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: (0, pg_core_1.bigint)({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "clubs_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    name: (0, pg_core_1.text)(),
    logo: (0, pg_core_1.text)(),
    about: (0, pg_core_1.text)(),
    url: (0, pg_core_1.text)(),
}, function (table) { return [
    (0, pg_core_1.pgPolicy)("Policy with security definer functions", { as: "permissive", for: "all", to: ["authenticated"], using: (0, drizzle_orm_1.sql)(templateObject_4 || (templateObject_4 = __makeTemplateObject(["true"], ["true"]))) }),
]; });
exports.faculty = (0, pg_core_1.pgTable)("faculty", {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: (0, pg_core_1.bigint)({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "faculty_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    kelloggdirectoryName: (0, pg_core_1.text)("kelloggdirectory_name"),
    twentyfiveliveName: (0, pg_core_1.text)("twentyfivelive_name"),
    kelloggdirectoryTitle: (0, pg_core_1.text)("kelloggdirectory_title"),
    kelloggdirectoryBio: (0, pg_core_1.text)("kelloggdirectory_bio"),
    kelloggdirectoryImageUrl: (0, pg_core_1.text)("kelloggdirectory_image_url"),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }),
    kelloggdirectoryBioUrl: (0, pg_core_1.text)("kelloggdirectory_bio_url"),
    kelloggdirectorySubtitle: (0, pg_core_1.text)("kelloggdirectory_subtitle"),
    cutoutImage: (0, pg_core_1.text)("cutout_image"),
}, function (table) { return [
    (0, pg_core_1.unique)("faculty_kelloggdirectory_name_key").on(table.kelloggdirectoryName),
    (0, pg_core_1.pgPolicy)("Allow all to authenticated", { as: "permissive", for: "all", to: ["authenticated"], using: (0, drizzle_orm_1.sql)(templateObject_5 || (templateObject_5 = __makeTemplateObject(["true"], ["true"]))), withCheck: (0, drizzle_orm_1.sql)(templateObject_6 || (templateObject_6 = __makeTemplateObject(["true"], ["true"]))) }),
]; });
exports.notifications = (0, pg_core_1.pgTable)("notifications", {
    id: (0, pg_core_1.uuid)().defaultRandom().primaryKey().notNull(),
    userId: (0, pg_core_1.uuid)("user_id"),
    title: (0, pg_core_1.text)().notNull(),
    message: (0, pg_core_1.text)().notNull(),
    type: (0, pg_core_1.text)().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    eventId: (0, pg_core_1.bigint)("event_id", { mode: "number" }),
    readAt: (0, pg_core_1.timestamp)("read_at", { withTimezone: true, mode: 'string' }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
    data: (0, pg_core_1.jsonb)(),
}, function (table) { return [
    (0, pg_core_1.foreignKey)({
        columns: [table.eventId],
        foreignColumns: [exports.events.id],
        name: "notifications_event_id_fkey"
    }).onDelete("cascade"),
    (0, pg_core_1.foreignKey)({
        columns: [table.userId],
        foreignColumns: [exports.profiles.id],
        name: "notifications_user_id_fkey1"
    }),
    (0, pg_core_1.pgPolicy)("Allow all to authenticated", { as: "permissive", for: "all", to: ["authenticated"], using: (0, drizzle_orm_1.sql)(templateObject_7 || (templateObject_7 = __makeTemplateObject(["true"], ["true"]))), withCheck: (0, drizzle_orm_1.sql)(templateObject_8 || (templateObject_8 = __makeTemplateObject(["true"], ["true"]))) }),
    (0, pg_core_1.pgPolicy)("notifications_select_own", { as: "permissive", for: "select", to: ["authenticated"] }),
    (0, pg_core_1.pgPolicy)("rt_select_all_notifications", { as: "permissive", for: "select", to: ["anon", "authenticated"] }),
]; });
exports.facultyUpdates = (0, pg_core_1.pgTable)("faculty_updates", {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: (0, pg_core_1.bigint)({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "faculty_updates_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    faculty: (0, pg_core_1.bigint)({ mode: "number" }),
    author: (0, pg_core_1.uuid)().defaultRandom(),
    content: (0, pg_core_1.text)(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true, mode: 'string' }),
}, function (table) { return [
    (0, pg_core_1.pgPolicy)("Allow all to authenticated", { as: "permissive", for: "all", to: ["authenticated"], using: (0, drizzle_orm_1.sql)(templateObject_9 || (templateObject_9 = __makeTemplateObject(["true"], ["true"]))), withCheck: (0, drizzle_orm_1.sql)(templateObject_10 || (templateObject_10 = __makeTemplateObject(["true"], ["true"]))) }),
]; });
exports.rooms = (0, pg_core_1.pgTable)("rooms", {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: (0, pg_core_1.bigint)({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "rooms_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    name: (0, pg_core_1.text)().notNull(),
    spelling: (0, pg_core_1.text)(),
    type: (0, pg_core_1.text)().default('CLASSROOM'),
    subType: (0, pg_core_1.text)("sub_type").default('TIERED'),
}, function (table) { return [
    (0, pg_core_1.pgPolicy)("Allow all to authenticated", { as: "permissive", for: "all", to: ["authenticated"], using: (0, drizzle_orm_1.sql)(templateObject_11 || (templateObject_11 = __makeTemplateObject(["true"], ["true"]))), withCheck: (0, drizzle_orm_1.sql)(templateObject_12 || (templateObject_12 = __makeTemplateObject(["true"], ["true"]))) }),
]; });
exports.profiles = (0, pg_core_1.pgTable)("profiles", {
    id: (0, pg_core_1.uuid)().primaryKey().notNull(),
    name: (0, pg_core_1.text)(),
    autoHide: (0, pg_core_1.boolean)("auto_hide").default(false).notNull(),
    currentFilter: (0, pg_core_1.text)("current_filter"),
    bg: (0, pg_core_1.text)(),
    roles: (0, pg_core_1.jsonb)().default([]).notNull(),
    theme: (0, pg_core_1.text)().default('dark').notNull(),
    color: (0, pg_core_1.text)(),
    zoom: (0, pg_core_1.real)(),
    pixelsPerMin: (0, pg_core_1.doublePrecision)("pixels_per_min"),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    rowHeight: (0, pg_core_1.bigint)("row_height", { mode: "number" }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    startHour: (0, pg_core_1.bigint)("start_hour", { mode: "number" }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    endHour: (0, pg_core_1.bigint)("end_hour", { mode: "number" }),
}, function (table) { return [
    (0, pg_core_1.index)("idx_profiles_name").using("btree", table.name.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.index)("idx_profiles_roles").using("gin", table.roles.asc().nullsLast().op("jsonb_ops")),
    (0, pg_core_1.pgPolicy)("Allow all to authenticated", { as: "permissive", for: "all", to: ["anon", "authenticated"], using: (0, drizzle_orm_1.sql)(templateObject_13 || (templateObject_13 = __makeTemplateObject(["true"], ["true"]))), withCheck: (0, drizzle_orm_1.sql)(templateObject_14 || (templateObject_14 = __makeTemplateObject(["true"], ["true"]))) }),
    (0, pg_core_1.check)("check_roles_is_array", (0, drizzle_orm_1.sql)(templateObject_15 || (templateObject_15 = __makeTemplateObject(["jsonb_typeof(roles) = 'array'::text"], ["jsonb_typeof(roles) = 'array'::text"])))),
]; });
exports.roomFilters = (0, pg_core_1.pgTable)("room_filters", {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: (0, pg_core_1.bigint)({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "room_filters_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    name: (0, pg_core_1.text)(),
    display: (0, pg_core_1.jsonb)(),
}, function (table) { return [
    (0, pg_core_1.pgPolicy)("Allow all to authenticated", { as: "permissive", for: "all", to: ["authenticated"], using: (0, drizzle_orm_1.sql)(templateObject_16 || (templateObject_16 = __makeTemplateObject(["true"], ["true"]))), withCheck: (0, drizzle_orm_1.sql)(templateObject_17 || (templateObject_17 = __makeTemplateObject(["true"], ["true"]))) }),
]; });
exports.tasks = (0, pg_core_1.pgTable)("tasks", {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: (0, pg_core_1.bigint)({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "services_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    name: (0, pg_core_1.text)(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    event: (0, pg_core_1.bigint)({ mode: "number" }),
    taskType: (0, pg_core_1.text)("task_type"),
    startTime: (0, pg_core_1.time)("start_time"),
    status: (0, pg_core_1.text)(),
    assignedTo: (0, pg_core_1.uuid)("assigned_to"),
    completedBy: (0, pg_core_1.uuid)("completed_by"),
    date: (0, pg_core_1.date)().notNull(),
}, function (table) { return [
    (0, pg_core_1.foreignKey)({
        columns: [table.assignedTo],
        foreignColumns: [exports.profiles.id],
        name: "tasks_assigned_to_fkey"
    }),
    (0, pg_core_1.foreignKey)({
        columns: [table.completedBy],
        foreignColumns: [exports.profiles.id],
        name: "tasks_completed_by_fkey"
    }),
    (0, pg_core_1.foreignKey)({
        columns: [table.event],
        foreignColumns: [exports.events.id],
        name: "tasks_event_fkey"
    }),
    (0, pg_core_1.pgPolicy)("Allow all to authenticated", { as: "permissive", for: "all", to: ["authenticated"], using: (0, drizzle_orm_1.sql)(templateObject_18 || (templateObject_18 = __makeTemplateObject(["true"], ["true"]))) }),
]; });
exports.resourcesDict = (0, pg_core_1.pgTable)("resources_dict", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    name: (0, pg_core_1.text)(),
    isAv: (0, pg_core_1.boolean)("is_av"),
    icon: (0, pg_core_1.jsonb)(),
}, function (table) { return [
    (0, pg_core_1.unique)("resources_id_key").on(table.id),
]; });
exports.events = (0, pg_core_1.pgTable)("events", {
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    eventType: (0, pg_core_1.text)("event_type"),
    lectureTitle: (0, pg_core_1.text)("lecture_title"),
    roomName: (0, pg_core_1.text)("room_name").notNull(),
    resources: (0, pg_core_1.jsonb)().default([]),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: (0, pg_core_1.bigint)({ mode: "number" }).primaryKey().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    itemId2: (0, pg_core_1.bigint)("item_id2", { mode: "number" }),
    startTime: (0, pg_core_1.time)("start_time").notNull(),
    endTime: (0, pg_core_1.time)("end_time").notNull(),
    raw: (0, pg_core_1.jsonb)(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    itemId: (0, pg_core_1.bigint)("item_id", { mode: "number" }),
    eventName: (0, pg_core_1.text)("event_name").notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true, mode: 'string' }),
    manOwner: (0, pg_core_1.uuid)("man_owner"),
    date: (0, pg_core_1.date)().notNull(),
    instructorNames: (0, pg_core_1.jsonb)("instructor_names"),
    organization: (0, pg_core_1.text)(),
}, function (table) { return [
    (0, pg_core_1.index)("idx_events_date_start_time").using("btree", table.date.asc().nullsLast().op("date_ops"), table.startTime.asc().nullsLast().op("date_ops")),
    (0, pg_core_1.index)("idx_events_event_name_start_time").using("btree", table.eventName.asc().nullsLast().op("text_ops"), table.startTime.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.index)("idx_events_event_type").using("btree", table.eventType.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.index)("idx_events_id").using("btree", table.id.asc().nullsLast().op("int8_ops")),
    (0, pg_core_1.index)("idx_events_room_name").using("btree", table.roomName.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.index)("idx_events_start_time").using("btree", table.startTime.asc().nullsLast().op("time_ops")),
    (0, pg_core_1.foreignKey)({
        columns: [table.manOwner],
        foreignColumns: [exports.profiles.id],
        name: "events_man_owner_fkey"
    }),
    (0, pg_core_1.pgPolicy)("Allow all to authenticated", { as: "permissive", for: "all", to: ["authenticated"], using: (0, drizzle_orm_1.sql)(templateObject_19 || (templateObject_19 = __makeTemplateObject(["true"], ["true"]))), withCheck: (0, drizzle_orm_1.sql)(templateObject_20 || (templateObject_20 = __makeTemplateObject(["true"], ["true"]))) }),
    (0, pg_core_1.check)("instructor_name_is_array_or_null", (0, drizzle_orm_1.sql)(templateObject_21 || (templateObject_21 = __makeTemplateObject(["(instructor_names IS NULL) OR (jsonb_typeof(instructor_names) = 'array'::text)"], ["(instructor_names IS NULL) OR (jsonb_typeof(instructor_names) = 'array'::text)"])))),
]; });
exports.panoptoChecks = (0, pg_core_1.pgTable)("panopto_checks", {
    id: (0, pg_core_1.bigserial)({ mode: "bigint" }).primaryKey().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    eventId: (0, pg_core_1.bigint)("event_id", { mode: "number" }).notNull(),
    checkTime: (0, pg_core_1.time)("check_time").notNull(),
    completedTime: (0, pg_core_1.time)("completed_time"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
    completedByUserId: (0, pg_core_1.uuid)("completed_by_user_id"),
    status: (0, pg_core_1.text)(),
}, function (table) { return [
    (0, pg_core_1.foreignKey)({
        columns: [table.completedByUserId],
        foreignColumns: [exports.profiles.id],
        name: "panopto_checks_completed_by_user_id_fkey"
    }).onDelete("set null"),
    (0, pg_core_1.foreignKey)({
        columns: [table.eventId],
        foreignColumns: [exports.events.id],
        name: "panopto_checks_event_id_fkey"
    }).onDelete("cascade"),
    (0, pg_core_1.pgPolicy)("Allow all to authenticated", { as: "permissive", for: "all", to: ["authenticated"], using: (0, drizzle_orm_1.sql)(templateObject_22 || (templateObject_22 = __makeTemplateObject(["true"], ["true"]))) }),
]; });
exports.shiftBlocks = (0, pg_core_1.pgTable)("shift_blocks", {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: (0, pg_core_1.bigint)({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "shift_blocks_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    assignments: (0, pg_core_1.jsonb)(),
    startTime: (0, pg_core_1.time)("start_time"),
    endTime: (0, pg_core_1.time)("end_time"),
    date: (0, pg_core_1.date)(),
}, function (table) { return [
    (0, pg_core_1.pgPolicy)("Allow all to authenticated", { as: "permissive", for: "all", to: ["authenticated"], using: (0, drizzle_orm_1.sql)(templateObject_23 || (templateObject_23 = __makeTemplateObject(["true"], ["true"]))), withCheck: (0, drizzle_orm_1.sql)(templateObject_24 || (templateObject_24 = __makeTemplateObject(["true"], ["true"]))) }),
]; });
exports.shifts = (0, pg_core_1.pgTable)("shifts", {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: (0, pg_core_1.bigint)({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "shifts_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    profileId: (0, pg_core_1.uuid)("profile_id"),
    startTime: (0, pg_core_1.time)("start_time"),
    endTime: (0, pg_core_1.time)("end_time"),
    date: (0, pg_core_1.date)(),
}, function (table) { return [
    (0, pg_core_1.foreignKey)({
        columns: [table.profileId],
        foreignColumns: [exports.profiles.id],
        name: "shifts_profile_id_fkey"
    }),
    (0, pg_core_1.pgPolicy)("Allow all to authenticated", { as: "permissive", for: "all", to: ["authenticated"], using: (0, drizzle_orm_1.sql)(templateObject_25 || (templateObject_25 = __makeTemplateObject(["true"], ["true"]))), withCheck: (0, drizzle_orm_1.sql)(templateObject_26 || (templateObject_26 = __makeTemplateObject(["true"], ["true"]))) }),
]; });
exports.facultyEvents = (0, pg_core_1.pgTable)("faculty_events", {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    faculty: (0, pg_core_1.bigint)({ mode: "number" }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    event: (0, pg_core_1.bigint)({ mode: "number" }).notNull(),
}, function (table) { return [
    (0, pg_core_1.foreignKey)({
        columns: [table.event],
        foreignColumns: [exports.events.id],
        name: "faculty_events_event_fkey"
    }).onDelete("cascade"),
    (0, pg_core_1.foreignKey)({
        columns: [table.faculty],
        foreignColumns: [exports.faculty.id],
        name: "faculty_events_faculty_fkey"
    }),
    (0, pg_core_1.primaryKey)({ columns: [table.faculty, table.event], name: "faculty_events_pkey" }),
]; });
exports.resourceEvents = (0, pg_core_1.pgTable)("resource_events", {
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    resourceId: (0, pg_core_1.text)("resource_id").notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    eventId: (0, pg_core_1.bigint)("event_id", { mode: "number" }).notNull(),
    quantity: (0, pg_core_1.integer)().default(1).notNull(),
    instructions: (0, pg_core_1.text)(),
}, function (table) { return [
    (0, pg_core_1.foreignKey)({
        columns: [table.eventId],
        foreignColumns: [exports.events.id],
        name: "fk_event"
    }).onDelete("cascade"),
    (0, pg_core_1.foreignKey)({
        columns: [table.resourceId],
        foreignColumns: [exports.resourcesDict.id],
        name: "fk_resource"
    }).onDelete("cascade"),
    (0, pg_core_1.primaryKey)({ columns: [table.resourceId, table.eventId], name: "resource_events_pkey" }),
]; });
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10, templateObject_11, templateObject_12, templateObject_13, templateObject_14, templateObject_15, templateObject_16, templateObject_17, templateObject_18, templateObject_19, templateObject_20, templateObject_21, templateObject_22, templateObject_23, templateObject_24, templateObject_25, templateObject_26;
