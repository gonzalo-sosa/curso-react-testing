import ToastDemo from "@/components/ToastDemo";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toaster } from "react-hot-toast";

describe("ToastDemo", () => {
  const renderToasterDemo = () => {
    render(
      <>
        <Toaster />
        <ToastDemo />
      </>
    );

    return {
      button: screen.getByRole("button"),
      user: userEvent.setup(),
    };
  };

  it("should render a button", () => {
    const { button } = renderToasterDemo();

    expect(button).toHaveTextContent(/toast/i);
  });

  it("should show toast when button is clicked", async () => {
    const { button, user } = renderToasterDemo();

    await user.click(button);

    const toast = await screen.findByText(/success/i);

    expect(toast).toBeInTheDocument();
  });
});
