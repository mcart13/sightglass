import { describe, it, expect, vi, afterEach, beforeAll } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { Slider } from "./Slider";

// jsdom lacks PointerEvent; polyfill for tests
beforeAll(() => {
  if (typeof globalThis.PointerEvent === "undefined") {
    // @ts-expect-error minimal polyfill
    globalThis.PointerEvent = class PointerEvent extends MouseEvent {
      readonly pointerId: number;
      constructor(
        type: string,
        init?: PointerEventInit & { pointerId?: number }
      ) {
        super(type, init);
        this.pointerId = init?.pointerId ?? 0;
      }
    };
  }
});

afterEach(cleanup);

describe("Slider", () => {
  it("renders with label and value", () => {
    render(
      <Slider
        label="Opacity"
        value={50}
        min={0}
        max={100}
        onChange={() => {}}
      />
    );
    expect(screen.getByText("Opacity")).toBeTruthy();
    expect(screen.getByText("50")).toBeTruthy();
  });

  it("displays suffix when provided", () => {
    render(
      <Slider
        label="Size"
        value={16}
        min={0}
        max={100}
        suffix="px"
        onChange={() => {}}
      />
    );
    expect(screen.getByText("16px")).toBeTruthy();
  });

  it("calls onChange on track click", () => {
    const onChange = vi.fn();
    render(
      <Slider label="Test" value={50} min={0} max={100} onChange={onChange} />
    );
    const track = screen.getByTestId("slider-track");
    track.getBoundingClientRect = () =>
      ({
        left: 0,
        width: 100,
        top: 0,
        height: 10,
        right: 100,
        bottom: 10,
        x: 0,
        y: 0,
        toJSON: () => {},
      } as DOMRect);
    // Use native PointerEvent to ensure clientX is properly forwarded
    const event = new PointerEvent("pointerdown", {
      clientX: 75,
      bubbles: true,
      cancelable: true,
      pointerId: 1,
    });
    track.dispatchEvent(event);
    expect(onChange).toHaveBeenCalledWith(75);
  });

  it("calls onReset when reset button clicked", () => {
    const onReset = vi.fn();
    render(
      <Slider
        label="Test"
        value={50}
        min={0}
        max={100}
        changed
        onChange={() => {}}
        onReset={onReset}
      />
    );
    const reset = screen.getByTitle("Reset");
    fireEvent.click(reset);
    expect(onReset).toHaveBeenCalled();
  });
});
