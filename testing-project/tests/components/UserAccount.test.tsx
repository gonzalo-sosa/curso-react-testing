import { render, screen } from "@testing-library/react";
import { User } from "@/entities";
import UserAccount from "@/components/UserAccount";

describe("UserAccount", () => {
  it("should render user name", () => {
    const user: User = { id: 1, name: "Mosh" };

    render(<UserAccount user={user} />);

    expect(screen.getByText(user.name)).toBeInTheDocument();
  });

  it("should render edit button if user is admin", () => {
    const user: User = { id: 1, name: "Mosh", isAdmin: true };

    render(<UserAccount user={user} />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent(/edit/i);
  });

  it("should not render edit button if user is not admin", () => {
    const user: User = { id: 1, name: "Mosh" };

    render(<UserAccount user={user} />);

    const button = screen.queryByRole("button");
    expect(button).not.toBeInTheDocument();
  });
});
