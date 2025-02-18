import { Product } from "@/entities";
import { screen, waitForElementToBeRemoved } from "@testing-library/react";
import { db } from "tests/mocks/db";
import { mockAuthState, navigateTo } from "tests/utils";

describe("EditProductPage", () => {
  let product: Product;

  beforeAll(() => {
    product = db.product.create();
    mockAuthState({
      isAuthenticated: true,
      isLoading: false,
      user: { name: "Test" },
    });
  });

  afterAll(() => {
    db.product.delete({ where: { id: { equals: product.id } } });
  });

  it.todo("should show a form with product detail", async () => {
    navigateTo(`/admin/products/${product.id}/edit`);

    await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));

    expect(screen.getByText(product.name)).toBeInTheDocument();
    expect(screen.getByText("$" + product.price)).toBeInTheDocument();
  });
});
