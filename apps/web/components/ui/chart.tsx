"use client"

import * as React from "react"
import {
  Legend as RechartsLegend,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  type LegendPayload,
  type LegendProps as RechartsLegendProps,
  type TooltipProps as RechartsTooltipProps,
} from "recharts"

import { cn } from "@/lib/utils"

export type ChartConfig = Record<
  string,
  {
    label?: string
    icon?: React.ComponentType<{ className?: string }>
    color?: string
  }
>

type ChartContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  config: ChartConfig
  children: React.ReactElement
}

type ChartTooltipProps = RechartsTooltipProps<number, string>

type ChartTooltipContentProps = ChartTooltipProps & {
  className?: string
  indicator?: "dot" | "line"
  hideLabel?: boolean
}

type ChartLegendProps = RechartsLegendProps

type ChartLegendContentProps = {
  className?: string
  payload?: LegendPayload[]
}

const ChartContext = React.createContext<{ config: ChartConfig }>({
  config: {},
})

export const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ children, className, config, style, ...props }, ref) => {
    const cssVars = React.useMemo(() => {
      return Object.entries(config).reduce((acc, [key, value]) => {
        if (!value?.color) {
          return acc
        }

        acc[`--color-${key}` as keyof React.CSSProperties] = value.color
        return acc
      }, {} as React.CSSProperties)
    }, [config])

    const mergedStyle = style ? { ...cssVars, ...style } : cssVars

    return (
      <ChartContext.Provider value={{ config }}>
        <div
          ref={ref}
          className={cn("relative h-[300px] w-full", className)}
          style={mergedStyle}
          {...props}
        >
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        </div>
      </ChartContext.Provider>
    )
  }
)
ChartContainer.displayName = "ChartContainer"

export function ChartTooltip({ wrapperStyle, ...props }: ChartTooltipProps) {
  return (
    <RechartsTooltip
      {...props}
      wrapperStyle={{ outline: "none", ...wrapperStyle }}
    />
  )
}

export const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  ChartTooltipContentProps
>(({ active, payload, label, className, indicator = "dot", hideLabel }, ref) => {
  const { config } = React.useContext(ChartContext)

  if (!active || !payload?.length) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-md border bg-background/90 p-2 text-xs shadow-md backdrop-blur",
        className
      )}
    >
      {!hideLabel && label ? (
        <div className="mb-1 font-medium text-foreground">{label}</div>
      ) : null}
      <div className="grid gap-1 text-muted-foreground">
        {payload.map((item) => {
          if (!item) {
            return null
          }
          const key = item.dataKey ? String(item.dataKey) : undefined
          const configEntry = key ? config[key] : undefined
          const name = configEntry?.label ?? item.name ?? key ?? "Value"
          const Icon = configEntry?.icon
          const color = item.color ?? configEntry?.color

          return (
            <div
              key={`${key ?? item.name ?? item.value}`}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    indicator === "line" ? "h-0.5 w-4 rounded-full" : "h-2.5 w-2.5 rounded-full"
                  )}
                  style={{ backgroundColor: color ?? "hsl(var(--primary))" }}
                />
                {Icon ? <Icon className="h-3 w-3 text-muted-foreground" /> : null}
                <span className="text-foreground">{name}</span>
              </div>
              <span className="font-medium text-foreground">{item.value}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

export function ChartLegend({ wrapperStyle, ...props }: ChartLegendProps) {
  return (
    <RechartsLegend
      {...props}
      wrapperStyle={{ paddingTop: 0, marginTop: 0, ...wrapperStyle }}
    />
  )
}

export function ChartLegendContent({ payload, className }: ChartLegendContentProps) {
  const { config } = React.useContext(ChartContext)

  const items = Array.isArray(payload)
    ? payload.filter(
        (item): item is LegendPayload => Boolean(item && typeof item === "object" && "dataKey" in item)
      )
    : []

  if (items.length === 0) {
    return null
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-4 text-sm text-muted-foreground", className)}>
      {items.map((item) => {
        const key = item.dataKey ? String(item.dataKey) : undefined
        const configEntry = key ? config[key] : undefined
        const name = configEntry?.label ?? item.value ?? key ?? "Value"
        const Icon = configEntry?.icon
        const color = item.color ?? configEntry?.color ?? "hsl(var(--primary))"

        return (
          <div key={`${key ?? item.value}`} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
            {Icon ? <Icon className="h-3 w-3 text-muted-foreground" /> : null}
            <span className="font-medium text-foreground">{name}</span>
          </div>
        )
      })}
    </div>
  )
}
