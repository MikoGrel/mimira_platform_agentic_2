import { cn } from "$/lib/utils";
import { type LinkProps as NextLinkProps } from "next/link";
import { default as NextLink } from "next/link";
import { PropsWithChildren } from "react";

type LinkProps = PropsWithChildren<NextLinkProps> & {
  className?: string;
};

export default function Link(props: LinkProps) {
  return (
    <NextLink
      {...props}
      className={cn(props.className, "hover:text-primary transition-colors")}
    >
      {props.children}
    </NextLink>
  );
}
