import SearchBox from "@/components/SearchBox";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("SearchBox", () => {
  const renderSearchBox = () => {
    const onChange = vi.fn();
    render(<SearchBox onChange={onChange} />);

    return {
      input: screen.getByPlaceholderText(/search/i),
      onChange,
      user: userEvent.setup(),
    };
  };

  it("should render an input field for searching", () => {
    const { input } = renderSearchBox();

    expect(input).toHaveAttribute("type", "text");
  });

  it("should call onChange when the key 'enter' is pressed", async () => {
    const { input, onChange, user } = renderSearchBox();

    const searchTerm = "SearchTerm";

    await user.type(input, searchTerm + "{enter}");

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(searchTerm);
  });

  it("should not call onChange if input field is empty", () => {
    const { input, onChange, user } = renderSearchBox();

    user.type(input, "{enter}");

    expect(onChange).not.toHaveBeenCalled();
  });
});
