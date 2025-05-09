"use client";

import { KeyboardButton } from "@/components/keyboard-button";
import { Drawer } from "@/components/ui/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { useResponsive } from "@/hooks/use-responsive";
import { cn, processTimeFilters } from "@/lib/utils";
import { ChevronDown } from "@unkey/icons";
import { Button, DateTime, type Range, type TimeUnit } from "@unkey/ui";
import { motion } from "framer-motion";
import { type PropsWithChildren, useEffect, useState } from "react";
import { CUSTOM_OPTION_ID, DEFAULT_OPTIONS } from "./constants";
import { DateTimeSuggestions } from "./suggestions";
import type { OptionsType } from "./types";

const CUSTOM_PLACEHOLDER = "Custom";

interface DatetimePopoverProps extends PropsWithChildren {
  initialTitle: string;
  initialTimeValues: { startTime?: number; endTime?: number; since?: string };
  onSuggestionChange: (title: string) => void;
  onDateTimeChange: (startTime?: number, endTime?: number, since?: string) => void;
  customOptions?: OptionsType; // Add this to accept custom options
}

type TimeRangeType = {
  startTime?: number;
  endTime?: number;
};

export const DatetimePopover = ({
  children,
  initialTitle,
  initialTimeValues,
  onSuggestionChange,
  onDateTimeChange,
  customOptions, // Accept custom options
}: DatetimePopoverProps) => {
  const { isMobile } = useResponsive();
  const [timeRangeOpen, setTimeRangeOpen] = useState(false);
  const [open, setOpen] = useState(false);
  useKeyboardShortcut("t", () => setOpen((prev) => !prev));

  const { startTime, since, endTime } = initialTimeValues;
  const [time, setTime] = useState<TimeRangeType>({ startTime, endTime });
  const [lastAppliedTime, setLastAppliedTime] = useState<{
    startTime?: number;
    endTime?: number;
  }>({ startTime, endTime });

  // Use customOptions if provided, otherwise use DEFAULT_OPTIONS
  const OPTIONS = customOptions || DEFAULT_OPTIONS;
  // Find the custom option ID in the provided options
  const CURRENT_CUSTOM_OPTION_ID = customOptions
    ? customOptions.find((o) => o.value === undefined)?.id || CUSTOM_OPTION_ID
    : CUSTOM_OPTION_ID;

  const [suggestions, setSuggestions] = useState<OptionsType>(() => {
    const matchingSuggestion = since
      ? OPTIONS.find((s) => s.value === since)
      : startTime
        ? OPTIONS.find((s) => s.id === CURRENT_CUSTOM_OPTION_ID)
        : null;

    return OPTIONS.map((s) => ({
      ...s,
      checked: s.id === matchingSuggestion?.id,
    }));
  });

  useEffect(() => {
    const newTitle = since
      ? (OPTIONS.find((s) => s.value === since)?.display ?? CUSTOM_PLACEHOLDER)
      : startTime
        ? CUSTOM_PLACEHOLDER
        : initialTitle;

    onSuggestionChange(newTitle);
  }, [since, startTime, initialTitle, onSuggestionChange, OPTIONS]);

  const handleSuggestionChange = (id: number) => {
    if (id === CURRENT_CUSTOM_OPTION_ID) {
      return;
    }

    const newSuggestions = suggestions.map((s) => ({
      ...s,
      checked: s.id === id && !s.checked,
    }));
    setSuggestions(newSuggestions);

    const selectedValue = newSuggestions.find((s) => s.checked)?.value;
    onDateTimeChange(undefined, undefined, selectedValue);
    setOpen(false);
  };

  const handleDateTimeChange = (newRange?: Range, newStart?: TimeUnit, newEnd?: TimeUnit) => {
    setSuggestions(
      suggestions.map((s) => ({
        ...s,
        checked: s.id === CURRENT_CUSTOM_OPTION_ID,
      })),
    );

    setTime({
      startTime: processTimeFilters(newRange?.from, newStart)?.getTime(),
      endTime: processTimeFilters(newRange?.to, newEnd)?.getTime(),
    });
  };

  const isTimeChanged =
    time.startTime !== lastAppliedTime.startTime || time.endTime !== lastAppliedTime.endTime;

  const handleApplyFilter = () => {
    if (!isTimeChanged) {
      setOpen(false);
      return;
    }

    onDateTimeChange(time.startTime, time.endTime);
    setLastAppliedTime({ startTime: time.startTime, endTime: time.endTime });
    setOpen(false);
  };

  return (
    <>
      {isMobile ? (
        <Drawer.Root open={open} onOpenChange={setOpen}>
          <Drawer.Trigger asChild>
            <div className="flex flex-row items-center">{children}</div>
          </Drawer.Trigger>
          <Drawer.Content className="h-[488px]">
            <div className="overflow-auto w-full">
              <div className="flex flex-col w-full gap-2 p-2">
                <button
                  type="button"
                  onClick={() => setTimeRangeOpen(!timeRangeOpen)}
                  className="text-gray-11 h-9  border-border border px-2 text-sm w-full rounded-lg bg-gray-3 flex items-center justify-between"
                >
                  <span>Filter by time range</span>
                  <ChevronDown
                    className={cn("rotate-0 duration-150 ease-out", {
                      "rotate-180": timeRangeOpen,
                    })}
                  />
                </button>
                {timeRangeOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex w-full"
                  >
                    <DateTimeSuggestions options={suggestions} onChange={handleSuggestionChange} />
                  </motion.div>
                )}
              </div>
              <motion.div
                animate={timeRangeOpen ? { opacity: 0 } : { opacity: 1 }}
                className="w-full"
              >
                <DateTime
                  onChange={handleDateTimeChange}
                  initialRange={{
                    from: startTime ? new Date(startTime) : undefined,
                    to: endTime ? new Date(endTime) : undefined,
                  }}
                  className={cn("gap-3 h-full w-full flex", timeRangeOpen && "hidden")}
                >
                  <DateTime.Calendar
                    mode="range"
                    className="px-3 pt-2.5 pb-3.5 border-b border-gray-4 text-[13px]"
                  />
                  <DateTime.TimeInput type="range" className="px-3.5 h-9 mt-0" />
                  <DateTime.Actions className="px-3.5 h-full pb-4">
                    <Button
                      variant="primary"
                      className="font-sans w-full h-9 rounded-md"
                      onClick={handleApplyFilter}
                      disabled={!isTimeChanged}
                    >
                      Apply Filter
                    </Button>
                  </DateTime.Actions>
                </DateTime>
              </motion.div>
            </div>
          </Drawer.Content>
        </Drawer.Root>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="flex flex-row items-center">{children}</div>
          </PopoverTrigger>
          <PopoverContent
            className="flex w-full bg-gray-1 dark:bg-black shadow-2xl p-0 m-0 border-gray-6 rounded-lg"
            align="start"
          >
            <div className="flex flex-col w-60 px-1.5 py-3 m-0 border-r border-gray-4">
              <PopoverHeader />
              <DateTimeSuggestions options={suggestions} onChange={handleSuggestionChange} />
            </div>
            <DateTime
              onChange={handleDateTimeChange}
              initialRange={{
                from: startTime ? new Date(startTime) : undefined,
                to: endTime ? new Date(endTime) : undefined,
              }}
              className="gap-3 h-full"
            >
              <DateTime.Calendar
                mode="range"
                className="px-3 pt-2.5 pb-3.5 border-b border-gray-4 text-[13px]"
              />
              <DateTime.TimeInput type="range" className="px-3.5 h-9 mt-0" />
              <DateTime.Actions className="px-3.5 h-full pb-4">
                <Button
                  variant="primary"
                  className="font-sans w-full h-9 rounded-md"
                  onClick={handleApplyFilter}
                  disabled={!isTimeChanged}
                >
                  Apply Filter
                </Button>
              </DateTime.Actions>
            </DateTime>
          </PopoverContent>
        </Popover>
      )}
    </>
  );
};

const PopoverHeader = () => {
  return (
    <div className="flex w-full h-8 justify-between px-2">
      <span className="text-gray-9 text-[13px] w-full">Filter by time range</span>
      <KeyboardButton shortcut="T" className="p-0 m-0 min-w-5 w-5 h-5" />
    </div>
  );
};
