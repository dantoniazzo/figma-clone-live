import { render, screen } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
  it("should render with children", () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText("Click Me")).toBeInTheDocument();
  });
});
