"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Trash2,
  Laptop,
  Tablet,
  X,
  ChevronUp,
  CircleAlertIcon,
  Loader2,
} from "lucide-react";
import BYODOSSelector from "./BYODOSSelector";
import PanelModal from "./PanelModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFacultyByods } from "./hooks/useFacultyByods";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Item,
  ItemHeader,
  ItemContent,
  ItemTitle,
  ItemMedia,
  ItemActions,
} from "@/components/ui/item";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupControl,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { faculty } from "@/drizzle/schema";
import { facultySetup } from "@/drizzle/schema";
import {
  createFacultySetup,
  updateFacultySetup,
  deleteFacultySetup,
} from "@/lib/data/faculty";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { PANEL_OPTIONS, getPanelImageSrc, BYOD_OPTIONS } from "../av-config/constants";
export default function SessionSetups({
  facultyMember,
  setups,
}: {
  facultyMember: InferSelectModel<typeof faculty>;
  setups: InferSelectModel<typeof facultySetup>[];
}) {
  // Get all setups for this faculty

  const [activeSetupId, setActiveSetupId] = useState<string | null>(null);
  const setup = setups.find((s) => s.id === activeSetupId) ?? setups[0];

  // Local panel modal state (moved here to avoid prop drilling)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPanel, setEditingPanel] = useState<"left" | "right" | null>(
    null
  );
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // BYOD selection dialog state
  const [isByodDialogOpen, setIsByodDialogOpen] = useState(false);
  const [byodTarget, setByodTarget] = useState<"left" | "right" | null>(null);
  //const { data: byods = [] } = useFacultyByods(facultyMember?.id || 0);
  // Notes editing state
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState<string>("");

  const byods = BYOD_OPTIONS;

  // Create new faculty setup
  const handleCreateSetup = async (
    data: Partial<InferSelectModel<typeof facultySetup>>
  ) => {
    if (!facultyMember?.id) return;

    startTransition(async () => {
      try {
        const result = await createFacultySetup({
          ...data,
          faculty: facultyMember.id,
        });
        router.refresh();
        if (result?.id) {
          setActiveSetupId(result.id);
        }
      } catch (error) {
        console.error("Error creating setup:", error);
      }
    });
  };

  // Update existing faculty setup
  const handleUpdateSetup = async (
    updates: Partial<InferSelectModel<typeof facultySetup>>,
    setupId?: string
  ) => {
    const targetSetupId = setupId || setup?.id;
    if (!targetSetupId) return;
    console.log("updating setup handler", targetSetupId, updates);

    startTransition(async () => {
      try {
        await updateFacultySetup(targetSetupId, updates);
        await router.refresh();
      } catch (error) {
        console.error("Error updating setup:", error);
      }
    });
  };

  // Delete faculty setup
  const handleDeleteSetup = async (setupId: string) => {
    startTransition(async () => {
      try {
        await deleteFacultySetup(setupId);
        router.refresh();
        // Switch to first setup if current is deleted
        if (activeSetupId === setupId && setups.length > 1) {
          const remainingSetup = setups.find((s) => s.id !== setupId);
          setActiveSetupId(remainingSetup?.id || null);
        }
      } catch (error) {
        console.error("Error deleting setup:", error);
      }
    });
  };

  const handleSelectByod = (value: string) => {
    if (!setup?.id || !byodTarget) return;
    const byodName = byods[parseInt(value)];
    if (!byodName) {
      setIsByodDialogOpen(false);
      setByodTarget(null);
      return;
    }

    handleUpdateSetup({
      leftDevice: byodTarget === "left" ? byodName : undefined,
      rightDevice: byodTarget === "right" ? byodName : undefined,
    });

    setIsByodDialogOpen(false);
    setByodTarget(null);
  };

  const selectPanelImage = (imageId: string) => {
    if (!editingPanel) return;
    const current =
      setups.find((s) => s.id === (activeSetupId ?? "")) ?? setups[0];
    if (!current) return;

    handleUpdateSetup(
      {
        leftSource:
          editingPanel === "left" ? imageId : current.leftSource ?? "",
        rightSource:
          editingPanel === "right" ? imageId : current.rightSource ?? "",
      },
      current.id
    );

    closeLocalModal();
  };

  const renderByodIcon = (deviceName?: string | null) => {
    const name = (deviceName || "").toUpperCase();
    if (
      name.includes("MAC") ||
      name.includes("PC") ||
      name.includes("LAPTOP") ||
      name.includes("SURFACE")
    )
      return <Laptop className="w-3.5 h-3.5" />;
    if (name.includes("IPAD") || name.includes("TABLET"))
      return <Tablet className="w-3.5 h-3.5" />;
    return <Laptop className="w-3.5 h-3.5" />;
  };

  React.useEffect(() => {
    if (setup && !isEditingNotes) {
      setNotesDraft((setup.notes as any) ?? "");
    }
  }, [setup, isEditingNotes]);

  const panelOptions = PANEL_OPTIONS;

  const openLocalPanelModal = (panel: "left" | "right") => {
    setEditingPanel(panel);
    setIsModalOpen(true);
  };

  const closeLocalModal = () => {
    setIsModalOpen(false);
    setEditingPanel(null);
  };

  // Scroll position preservation for each tab
  const [scrollPositions, setScrollPositions] = useState<
    Record<string, number>
  >({});
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!activeSetupId && setups.length > 0) setActiveSetupId(setups[0].id);
  }, [setups, activeSetupId]);

  // Handle tab change with scroll position preservation
  const handleTabChange = (newSetupId: string) => {
    // Save current scroll position
    if (activeSetupId && contentRef.current) {
      setScrollPositions((prev) => ({
        ...prev,
        [activeSetupId]: contentRef.current?.scrollTop || 0,
      }));
    }

    // Change to new tab
    setActiveSetupId(newSetupId);
  };

  // Restore scroll position when tab becomes active
  React.useEffect(() => {
    if (
      activeSetupId &&
      contentRef.current &&
      scrollPositions[activeSetupId] !== undefined
    ) {
      contentRef.current.scrollTop = scrollPositions[activeSetupId];
    }
  }, [activeSetupId, scrollPositions]);

  // Create new setup state
  const [isCreating, setIsCreating] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<{ name: string }>({
    defaultValues: { name: "" },
  });
  const onCreate = async (values: { name: string }) => {
    if (!facultyMember?.id) return;
    await handleCreateSetup({ name: values.name });
    reset();
    setIsCreating(false);
  };

  // Check if either panel is a laptop (LAPTOP_1, LAPTOP_2, or LAPTOP_3)
  const isLaptopPanel = (panel: string | null) => {
    return panel === "LAPTOP_1" || panel === "LAPTOP_2" || panel === "LAPTOP_3";
  };

  return (
    <Card className="relative p-0 overflow-hidden" aria-busy={isPending}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-base sm:text-lg ">Setups</CardTitle>
            <CardDescription className="/70">
              Configure panels and options for this instructor
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {!isCreating ? (
              <Button
                size="icon"
                variant="default"
                onClick={() => setIsCreating(true)}
                title="Create setup"
              >
                <Plus className="w-4 h-4" />
              </Button>
            ) : (
              <form
                onSubmit={handleSubmit(onCreate)}
                className="flex items-center gap-2"
              >
                <Input
                  placeholder="Setup name"
                  {...register("name", { required: true })}
                  className="h-9"
                />
                <Button type="submit" disabled={isSubmitting} size="sm">
                  Save
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    reset();
                    setIsCreating(false);
                  }}
                >
                  Cancel
                </Button>
              </form>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {/* Tabs over setups (header + content must be children of Tabs) */}
        <Tabs
          value={activeSetupId ?? undefined}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <div className="flex items-center justify-between mb-3 gap-2">
            <TabsList className="flex gap-1">
              {setups.map((s) => (
                <div key={s.id} className="relative">
                  <TabsTrigger
                    value={s.id}
                    className={activeSetupId === s.id ? "pr-8" : undefined}
                  >
                    {(s as any).name || `Default`}
                  </TabsTrigger>
                  {activeSetupId === s.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                      title="Delete setup"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const current = setups.find((x) => x.id === s.id);
                        if (!current) return;
                        if (!confirm("Delete this setup?")) return;
                        handleDeleteSetup(current.id);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </TabsList>
          </div>

          {/* Tab Content */}
          {setups.map((setup) => {
            const leftPanelSrc = getPanelImageSrc(setup?.leftSource);
            const rightPanelSrc = getPanelImageSrc(setup?.rightSource);

            return (
              <TabsContent key={setup.id} value={setup.id} className="mt-0">
                <div
                  ref={contentRef}
                  className="space-y-4 px-1 py-1 overflow-y-auto"
                >
                  <div className="">
                    {!isEditingNotes ? (
                      <InputGroup>
                        <InputGroupControl
                          multiline
                          className="text-lg w-full whitespace-pre-wrap min-h-8 "
                        >
                          {setup?.notes ? (
                            <Alert className="border-none bg-amber-600/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
                              <CircleAlertIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />

                              <AlertDescription className=" text-lg text-amber-600/80 dark:text-amber-400/80">
                                {String(setup.notes)}
                              </AlertDescription>
                            </Alert>
                          ) : (
                            <span className="text-muted-foreground">
                              No notes
                            </span>
                          )}
                        </InputGroupControl>
                        <InputGroupAddon
                          align="block-end"
                          className="justify-end"
                        >
                          <InputGroupButton
                            size="xs"
                            variant="outline"
                            onClick={() => setIsEditingNotes(true)}
                          >
                            Edit
                          </InputGroupButton>
                        </InputGroupAddon>
                      </InputGroup>
                    ) : (
                      <InputGroup className="">
                        <InputGroupAddon align="block-start">
                          <InputGroupText className="">
                            Editing notes
                          </InputGroupText>
                        </InputGroupAddon>
                        <InputGroupTextarea
                          className="min-h-[120px] !text-lg"
                          value={notesDraft}
                          onChange={(e) => setNotesDraft(e.target.value)}
                          placeholder="Enter notes for this setup"
                        />
                        <InputGroupAddon align="block-end" className="">
                          <InputGroupButton
                            variant="default"
                            size="sm"
                            onClick={async () => {
                              if (!setup?.id) return;
                              await handleUpdateSetup({ notes: notesDraft });
                              setIsEditingNotes(false);
                            }}
                          >
                            Save
                          </InputGroupButton>
                          <InputGroupButton
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setIsEditingNotes(false);
                              setNotesDraft(String(setup?.notes ?? ""));
                            }}
                          >
                            Cancel
                          </InputGroupButton>
                        </InputGroupAddon>
                      </InputGroup>
                    )}
                  </div>
                  {/* Panels */}
                  <Item variant="outline" className="mt-6">
                    <ItemHeader>
                      <ItemTitle className="">Panels</ItemTitle>
                    </ItemHeader>
                    <ItemContent className="pt-2">
                      <div className="flex gap-3 sm:gap-4">
                        <div className="flex-1">
                          <p className="text-xs sm:text-sm  mb-2">Left Panel</p>
                          <Button
                            onClick={() => openLocalPanelModal("left")}
                            className="w-full h-20 sm:h-24 rounded-lg border border-white/10 dark:border-white/5 flex items-center justify-center transition-colors cursor-pointer backdrop-blur-sm shadow-lg hover:shadow-xl relative overflow-hidden"
                            title="Click to change panel setup"
                            variant="outline"
                          >
                            {setup?.leftSource ? (
                              <Image
                                src={leftPanelSrc}
                                alt={`Left panel setup for ${facultyMember?.kelloggdirectoryName}`}
                                fill
                                className="object-contain"
                                sizes="(max-width: 640px) 100vw, 33vw"
                              />
                            ) : (
                              <span className="">No source</span>
                            )}
                          </Button>
                          {setup?.leftSource &&
                          setup.leftSource !== "DOC_CAM" ? (
                            <>
                              <p className="text-xs  text-center mt-2 font-medium">
                                {setup.leftSource.replace(/_/g, " ")}
                              </p>
                              <div className="w-full relative mt-2 h-12">
                                <div className="absolute left-1/2 -translate-x-1/2 -top-2">
                                  <ChevronUp className="w-4 h-4 dark:text-white light:text-black " />
                                </div>
                                <div className="absolute left-1/2 -translate-x-1/2 h-12 border-l-2 border-dashed dark:border-white light:border-black"></div>
                                {setup?.leftDevice &&
                                  (setup.leftSource === "ROOM_PC" ||
                                    setup.leftSource === "PC_EXT") && (
                                    <div className="absolute right-1/2 pr-2 top-1/2 -translate-y-1/2">
                                      <span className="text-xs ">
                                        Mirroring 360
                                      </span>
                                    </div>
                                  )}
                              </div>
                              <div className="w-full flex justify-center mt-2">
                                {setup?.leftDevice ? (
                                  <Badge
                                    className="cursor-default flex items-center gap-1 pr-1"
                                    variant="outline"
                                    title={setup.leftDevice || "BYOD"}
                                  >
                                    {renderByodIcon(setup.leftDevice)}
                                    <span>{setup.leftDevice || "BYOD"}</span>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="ml-1 h-5 w-5 p-0 rounded hover:bg-black/10"
                                      title="Remove device"
                                      onClick={() => {
                                        if (!setup?.id) return;
                                        handleUpdateSetup({ leftDevice: null });
                                      }}
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </Button>
                                  </Badge>
                                ) : (
                                  <Button
                                    type="button"
                                    aria-label="Select BYOD for left panel"
                                    onClick={() => {
                                      setByodTarget("left");
                                      setIsByodDialogOpen(true);
                                    }}
                                    variant="outline"
                                    size="icon"
                                    className="w-8 h-8 rounded-full border-2 border-dashed border-black/50 /70 hover:bg-black/5 transition-colors"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </>
                          ) : (
                            <p className="text-xs  text-center mt-2 font-medium">
                              {setup?.leftSource
                                ? setup.leftSource.replace(/_/g, " ")
                                : "No source"}
                            </p>
                          )}
                        </div>

                        <div className="flex-1">
                          <p className="text-xs sm:text-sm  mb-2">
                            Right Panel
                          </p>
                          <Button
                            onClick={() => openLocalPanelModal("right")}
                            className="w-full h-20 sm:h-24 rounded-lg border border-white/10 dark:border-white/5 flex items-center justify-center transition-colors cursor-pointer backdrop-blur-sm shadow-lg hover:shadow-xl relative overflow-hidden"
                            title="Click to change panel setup"
                            variant="outline"
                          >
                            {setup?.rightSource ? (
                              <Image
                                src={rightPanelSrc}
                                alt={`Right panel setup for ${facultyMember?.kelloggdirectoryName}`}
                                fill
                                className="object-contain"
                                sizes="(max-width: 640px) 100vw, 33vw"
                              />
                            ) : (
                              <span className="">No source</span>
                            )}
                          </Button>
                          {setup?.rightSource &&
                          setup.rightSource !== "DOC_CAM" ? (
                            <>
                              <p className="text-xs  text-center mt-2 font-medium">
                                {setup.rightSource.replace(/_/g, " ")}
                              </p>
                              <div className="w-full relative mt-2 h-12">
                                <div className="absolute left-1/2 -translate-x-1/2 -top-2">
                                  <ChevronUp className="w-4 h-4 dark:text-white light:text-black " />
                                </div>
                                <div className="absolute left-1/2 -translate-x-1/2 h-12 border-l-2 border-dashed light:border-black dark:border-white"></div>
                                {setup?.rightDevice &&
                                  (setup.rightSource === "ROOM_PC" ||
                                    setup.rightSource === "PC_EXT") && (
                                    <div className="absolute right-1/2 pr-2 top-1/2 -translate-y-1/2">
                                      <span className="text-xs ">
                                        Mirroring 360
                                      </span>
                                    </div>
                                  )}
                              </div>
                              <div className="w-full flex justify-center mt-2">
                                {setup?.rightDevice ? (
                                  <Badge
                                    className="cursor-default flex items-center gap-1 pr-1"
                                    variant="outline"
                                    title={setup.rightDevice || "BYOD"}
                                  >
                                    {renderByodIcon(setup.rightDevice)}
                                    <span>{setup.rightDevice || "BYOD"}</span>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="ml-1 h-5 w-5 p-0 rounded hover:bg-black/10"
                                      title="Remove device"
                                      onClick={() => {
                                        if (!setup?.id) return;
                                        handleUpdateSetup({
                                          rightDevice: null,
                                        });
                                      }}
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </Button>
                                  </Badge>
                                ) : (
                                  <Button
                                    type="button"
                                    aria-label="Select BYOD for right panel"
                                    onClick={() => {
                                      setByodTarget("right");
                                      setIsByodDialogOpen(true);
                                    }}
                                    variant="outline"
                                    size="icon"
                                    className="w-8 h-8 rounded-full border-2 border-dashed border-black/50 /70 hover:bg-black/5 transition-colors"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </>
                          ) : (
                            <p className="text-xs  text-center mt-2 font-medium">
                              {setup?.rightSource
                                ? setup.rightSource.replace(/_/g, " ")
                                : "No source"}
                            </p>
                          )}
                        </div>
                      </div>
                    </ItemContent>
                  </Item>

                  {/* Uses Microphone */}
                  <Item variant="outline" className="items-center">
                    <ItemMedia variant="image">
                      <img src="/images/lapel.png" alt="Lapel microphone" />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle className="">Uses Microphone</ItemTitle>
                    </ItemContent>
                    <ItemActions>
                      <Switch
                        checked={Boolean(setup?.usesMic)}
                        onCheckedChange={(checked) => {
                          if (isPending || !setup) return;
                          handleUpdateSetup({
                            usesMic: Boolean(checked),
                          });
                        }}
                        aria-label="Toggle microphone usage"
                      />
                    </ItemActions>
                  </Item>

                  {/* Notes */}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>

      <CardFooter className="justify-between pt-0">
        <div className="text-xs /70">
          {setup?.updatedAt
            ? `Last updated: ${new Date(setup.updatedAt).toLocaleString(
                "en-US",
                {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                }
              )}`
            : "Never updated"}
        </div>
      </CardFooter>
      {isPending && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
      {/* Panel Selection Modal (scoped to this component) */}
      <PanelModal
        isModalOpen={isModalOpen}
        editingPanel={editingPanel}
        panelOptions={panelOptions}
        onClose={closeLocalModal}
        onSelectPanel={selectPanelImage}
      />
      {/* BYOD Selection Dialog */}
      <Dialog open={isByodDialogOpen} onOpenChange={setIsByodDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {byodTarget === "left"
                ? "Select BYOD for Left Panel"
                : byodTarget === "right"
                ? "Select BYOD for Right Panel"
                : "Select BYOD Device"}
            </DialogTitle>
          </DialogHeader>
          <div>
            <Select onValueChange={handleSelectByod}>
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    byods.length
                      ? "Choose a device"
                      : "No BYOD devices available"
                  }
                />
              </SelectTrigger>
              {
                <SelectContent>
                  {byods.map((deviceName, index) => (
                    <SelectItem key={index} value={String(index)}>
                      {deviceName}
                    </SelectItem>
                  ))}
                </SelectContent>
              }
            </Select>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
