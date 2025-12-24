import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "./ui/hover-card"
import { MessageCircleQuestionMark } from "lucide-react"
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover"
import { useIsMobile } from "../hooks/use-mobile"
import type { ReactElement } from "react"

type HoverCardFormItemProps = {
  content: string
}

export function HoverCardFormItem({
  content,
}: HoverCardFormItemProps): ReactElement {
  const isMobile = useIsMobile()
  return (
    isMobile ? (
      <Popover>
        <PopoverTrigger>
          <MessageCircleQuestionMark size={16} className="text-muted-foreground" />
        </PopoverTrigger>
        <PopoverContent side="top" align="start" className="text-sm !px-4 !py-2 bg-background/40 backdrop-blur-md">
          {content}
        </PopoverContent>
      </Popover>
    ) : (
      <HoverCard openDelay={200}>
        <HoverCardTrigger>
          <MessageCircleQuestionMark size={16} className="text-muted-foreground" />
        </HoverCardTrigger>
        <HoverCardContent side="top" align="start" className="text-sm !px-4 !py-2 bg-background/40 backdrop-blur-md">
          {content}
        </HoverCardContent>
      </HoverCard>
    )
  )
}
