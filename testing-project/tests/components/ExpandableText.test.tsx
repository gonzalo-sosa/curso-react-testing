import ExpandableText from "@/components/ExpandableText";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("ExpandableText", () => {
  const renderComponent = (text: string) => {
    render(<ExpandableText text={text} />);

    return {
      button: screen.getByRole("button"),
    };
  };

  const limit = 255;
  const shortText = "a".repeat(limit - 1);
  const longText = "a".repeat(limit + 1);
  const truncatedText = longText.substring(0, limit) + "...";

  it(`should render entire text if it is less or equal than ${limit} characters`, () => {
    render(<ExpandableText text={shortText} />);

    expect(screen.getByText(shortText)).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it(`should truncate text if it is longer than ${limit} characters`, () => {
    const { button } = renderComponent(longText);

    expect(screen.getByText(truncatedText)).toBeInTheDocument();
    expect(button).toHaveTextContent(/more/i);
  });

  it("should expand text when button is clicked", async () => {
    const { button } = renderComponent(longText);

    const user = userEvent.setup();

    await user.click(button);

    expect(screen.getByText(longText)).toBeInTheDocument();
    expect(button).toHaveTextContent(/less/i);
  });

  it("should collapse text when button is clicked", async () => {
    render(<ExpandableText text={longText} />);

    const user = userEvent.setup();

    const showMoreButton = screen.getByRole("button", { name: /more/i });
    await user.click(showMoreButton);

    const showLessButton = screen.getByRole("button", { name: /less/i });
    await user.click(showLessButton);

    expect(screen.getByText(truncatedText)).toBeInTheDocument();
    expect(showMoreButton).toHaveTextContent(/more/i);
  });
});
