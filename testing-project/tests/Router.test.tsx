import { screen } from "@testing-library/react";
import { db } from "./mocks/db";
import { mockAuthState, navigateTo } from "./utils";

describe("Routes", () => {
  it("should render the home page for /", () => {
    navigateTo("/");

    expect(screen.getByRole("heading", { name: /home/i })).toBeInTheDocument();
  });

  it("should render the products page for /products", () => {
    navigateTo("/products");

    expect(
      screen.getByRole("heading", { name: /products/i })
    ).toBeInTheDocument();
  });

  it("should render the product details page for /products/:id", async () => {
    const product = db.product.create();

    navigateTo("/products/" + product.id);

    expect(
      await screen.findByRole("heading", { name: product.name })
    ).toBeInTheDocument();

    db.product.delete({ where: { id: { equals: product.id } } });
  });

  it("should render the error page when navigating to a non existing route", () => {
    navigateTo("/invalid-route");

    expect(screen.getByText(/not found/i)).toBeInTheDocument();
  });

  it("should render the product page when user is admin", async () => {
    const product = db.product.create();

    mockAuthState({
      isAuthenticated: true,
      isLoading: false,
      user: { name: "Test" },
    });
    navigateTo(`/admin/products/${product.id}/edit`);

    expect(
      await screen.findByRole("heading", { name: /product/i })
    ).toBeInTheDocument();

    db.product.delete({ where: { id: { equals: product.id } } });
  });
});
