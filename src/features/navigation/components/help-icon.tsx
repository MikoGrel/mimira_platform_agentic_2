"use client";

import { Popover, PopoverTrigger, PopoverContent, Button } from "@heroui/react";
import { HelpCircleIcon } from "lucide-react";

export function HelpIcon() {
  return (
    <Popover placement="bottom-end">
      <PopoverTrigger>
        <Button
          variant="bordered"
          radius="lg"
          className="bg-background"
          isIconOnly
        >
          <HelpCircleIcon className="w-5 h-5 stroke-[1.5]" />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-2 p-2">
          <h3 className="text-sm font-bold">Help</h3>
          <div className="text-sm">
            <p className="text-muted-foreground">Contact us:</p>
            <div className="mt-1 space-y-1">
              <p>
                <span className="font-medium">Email: </span>
                <a
                  href="mailto:mimira@mimiraoffers.eu"
                  className="text-primary underline"
                >
                  mimira@mimiraoffers.eu
                </a>
              </p>
              <p>
                <span className="font-medium">Tel: </span>
                <a href="tel:+48732070469" className="text-primary underline">
                  +48 732 070 469
                </a>
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            If you have questions about a specific tender, remember that you can
            ask the chatbot.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
