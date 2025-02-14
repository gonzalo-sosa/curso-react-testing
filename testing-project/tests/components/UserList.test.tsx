import UserList from "@/components/UserList";
import { User } from "@/entities";
import { render, screen } from "@testing-library/react";

describe("UserList", () => {
  const users: User[] = [
    { id: 1, name: "Gonzalo" },
    { id: 2, name: "Agustín" },
    { id: 3, name: "Emanuel" },
    { id: 4, name: "Micaela" },
  ];

  it("should render a message that contains 'no users' if no users were provided", () => {
    render(<UserList users={[]} />);

    expect(screen.getByText(/no users/i)).toBeInTheDocument();
  });

  it("should render a list of users with links if users were provided", () => {
    render(<UserList users={users} />);

    users.forEach((user) => {
      const link = screen.getByRole("link", {
        name: user.name,
      });

      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", `/users/${user.id}`);
    });
  });
});
