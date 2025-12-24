"use client"

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
import type { ComponentProps, ReactElement } from "react"

function Collapsible({
  ...props
}: ComponentProps<typeof CollapsiblePrimitive.Root>): ReactElement {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

function CollapsibleTrigger({
  ...props
}: ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>): ReactElement {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  )
}

function CollapsibleContent({
  ...props
}: ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>): ReactElement {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      {...props}
    />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
