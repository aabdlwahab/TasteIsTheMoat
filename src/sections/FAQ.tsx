import type { ReactNode } from "react";
import { Container, Section, SectionHeading } from "../ui/primitives";
import { Accordion, type AccordionItem } from "../ui/Accordion";

export interface FAQProps {
  eyebrow?: string;
  title?: ReactNode;
  description?: ReactNode;
  items: AccordionItem[];
  /** Extra prompt under the list, e.g. a support link. */
  footer?: ReactNode;
  id?: string;
  className?: string;
}

export function FAQ({
  eyebrow = "FAQ",
  title = "Questions, answered",
  description,
  items,
  footer,
  id,
  className,
}: FAQProps) {
  return (
    <Section id={id} className={className}>
      <Container className="max-w-3xl">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
        />
        <div className="mt-12">
          <Accordion items={items} />
        </div>
        {footer && (
          <p className="mt-8 text-center text-[15px] text-ink-300">{footer}</p>
        )}
      </Container>
    </Section>
  );
}
