import UserAccount from "@/components/UserAccount";
import { User } from "@/entities";
import { render, screen } from "@testing-library/react";

describe("UserAccount", () => {
  const user: User = { id: 1, name: "Gonzalo" };

  it("should render the user name", () => {
    render(<UserAccount user={{ ...user, isAdmin: false }} />);

    expect(screen.getByText(user.name)).toBeInTheDocument();
  });

  it("should not render the edit button if user is not admin", () => {
    render(<UserAccount user={{ ...user, isAdmin: false }} />);

    const button = screen.queryByRole("button");

    expect(button).not.toBeInTheDocument();
  });

  it("should render the edit button if user is admin", () => {
    render(<UserAccount user={{ ...user, isAdmin: true }} />);

    const button = screen.getByRole("button");

    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent(/edit/i);
  });
});
