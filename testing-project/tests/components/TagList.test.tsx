import TagList from "@/components/TagList";
import { render, screen } from "@testing-library/react";

describe("TagList", () => {
  it("should render a list of tags", async () => {
    render(<TagList />);

    // await waitFor(() => {
    //   const listItems = screen.getAllByRole("listitem");
    //   expect(listItems.length).toBeGreaterThan(0);
    // });

    await screen.findAllByRole("listitem").then((listItems) => {
      expect(listItems.length).toBeGreaterThan(0);
    });
  });
});
