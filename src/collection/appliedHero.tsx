/**
 * The hero, with a piece from the workbench dropped into it.
 *
 * The preview stage answers "what does this do". It cannot answer "what does
 * this look like on a page", because a component in a bordered box on a dark
 * background is not a page — the thing you actually want to judge is whether it
 * survives contact with a headline, a subhead, and two buttons. So the top of
 * the screen becomes the test: same nav, same copy, same call to action, your
 * piece and your settings in place of the default hero.
 *
 * Where the piece lands depends on what it is, because "apply this to a page"
 * means three different things:
 *
 *   background — a shader or full-bleed surface goes behind the copy
 *   section    — a section already is the top of a page, so it replaces the hero
 *   inset      — everything else sits where the product shot would go
 */
import { Button, Container, GradientText } from "../ui/index";
import type { ControlValues, Work } from "./types";

export interface AppliedPiece {
  work: Work;
  values: ControlValues;
  /** Bumped on every apply, so re-applying remounts rather than diffing. */
  nonce: number;
}

type Placement = "background" | "section" | "inset";

/** Where a piece belongs in a hero, from what kind of piece it is. */
export function placementFor(work: Work): Placement {
  if (work.group === "Sections") return "section";
  return (work.fit ?? "center") === "fill" ? "background" : "inset";
}

const PLACEMENT_LABEL: Record<Placement, string> = {
  background: "as the hero background",
  section: "in place of the hero",
  inset: "inside the hero",
};

/**
 * A floating pill rather than a full-width band: the nav is 4rem tall and fixed
 * over the top of the hero, and a band underneath it reads as a second navbar.
 * This has to look like a control the visitor put there, not page furniture.
 *
 * It only floats from `sm` up. On a phone the pill wraps to two lines, and no
 * amount of guessed top padding underneath reliably clears a box whose height
 * depends on how long the piece's name is — so there it sits in the flow and
 * pushes the hero down on its own.
 */
function AppliedBar({ work, onClear }: { work: Work; onClear: () => void }) {
  return (
    <div className="relative z-40 flex justify-center px-4 pb-2 pt-[4.75rem] sm:pointer-events-none sm:absolute sm:inset-x-0 sm:top-[4.5rem] sm:p-0 sm:px-4">
      <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-full border border-white/15 bg-black/65 px-4 py-2 text-xs shadow-[0_10px_40px_rgba(0,0,0,.45)] backdrop-blur-md">
        <span className="text-white/70">
          <strong className="font-semibold text-white">{work.name}</strong>
          {/* The placement phrase is the first thing to go when the pill has to
              share a narrow screen with the hero copy underneath it. */}
          <span className="hidden sm:inline"> {PLACEMENT_LABEL[placementFor(work)]}</span>
        </span>
        <span aria-hidden="true" className="text-white/25">·</span>
        <a
          href="#collection"
          className="rounded-full bg-white/12 px-2.5 py-1 font-medium text-white transition-colors hover:bg-white/20"
        >
          Keep tuning
        </a>
        <button
          type="button"
          onClick={onClear}
          className="rounded-full bg-white/12 px-2.5 py-1 font-medium text-white transition-colors hover:bg-white/20"
        >
          Restore the hero
        </button>
      </div>
    </div>
  );
}

/** The page furniture the piece has to survive: headline, subhead, two CTAs. */
function HeroCopy({ boxed }: { boxed?: boolean }) {
  return (
    <div
      className={
        boxed
          ? "w-fit max-w-[39rem] rounded-3xl border border-white/15 bg-[#07080c]/75 p-6 shadow-[0_24px_80px_rgba(0,0,0,.34)] backdrop-blur-xl sm:p-8"
          : "max-w-[39rem]"
      }
    >
      <p className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 ring-1 ring-inset ring-white/15">
        The anti-generic web collection
      </p>
      <h1 className="mt-6 text-balance font-sans text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-white sm:text-6xl">
        Your competitors can copy your features.{" "}
        <GradientText>They can’t copy your eye.</GradientText>
      </h1>
      <p className="mt-5 text-pretty text-lg leading-relaxed text-white/70">
        This is the page you were tuning a moment ago. Same nav, same copy, same
        buttons — with your piece and your settings in place.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="#collection">Back to the workbench</Button>
        <Button href="#websites" variant="secondary">
          See complete websites
        </Button>
      </div>
    </div>
  );
}

export function AppliedHero({
  applied,
  onClear,
}: {
  applied: AppliedPiece;
  onClear: () => void;
}) {
  const { work, values, nonce } = applied;
  const placement = placementFor(work);
  const render = work.renderApplied ?? work.render;
  const piece = <div key={`${work.id}-${nonce}`}>{render(values)}</div>;

  if (placement === "section") {
    return (
      <header className="relative isolate">
        <AppliedBar work={work} onClear={onClear} />
        {/* From `sm` up the pill overlays the section, so the section starts
            below both it and the fixed nav rather than under them. */}
        <div className="pt-2 sm:pt-28">{piece}</div>
      </header>
    );
  }

  if (placement === "background") {
    return (
      <header className="relative isolate min-h-[88vh] overflow-hidden bg-[#07080c]">
        <div className="absolute inset-0 z-0 [&>*]:h-full [&>*]:w-full">{piece}</div>
        {/* Copy over a moving background is the single biggest legibility risk
            on this page, so the scrim is not optional here. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_30%_45%,rgba(7,8,12,0.72)_0%,rgba(7,8,12,0.5)_55%,rgba(7,8,12,0.85)_100%)]"
        />
        <AppliedBar work={work} onClear={onClear} />
        <Container className="relative z-20">
          <div className="flex min-h-[88vh] items-center pb-24 pt-10 sm:pt-28">
            <HeroCopy boxed />
          </div>
        </Container>
      </header>
    );
  }

  return (
    <header className="relative isolate overflow-hidden border-b border-ink-700 bg-[radial-gradient(ellipse_at_20%_10%,rgba(249,115,22,.14),transparent_45%),radial-gradient(ellipse_at_85%_75%,rgba(190,242,100,.1),transparent_45%),#08090d]">
      <AppliedBar work={work} onClear={onClear} />
      <Container className="relative z-20">
        <div className="grid items-center gap-12 pb-24 pt-10 sm:pt-32 lg:grid-cols-[1fr_1fr] lg:gap-16 lg:pb-28 lg:pt-40">
          <HeroCopy />
          <div className="grid min-h-[22rem] place-items-center overflow-hidden rounded-3xl border border-white/12 bg-[#0a0b10] p-8">
            {piece}
          </div>
        </div>
      </Container>
    </header>
  );
}
