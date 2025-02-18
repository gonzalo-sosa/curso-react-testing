import { Product } from "@/entities";
import { screen, waitForElementToBeRemoved } from "@testing-library/react";
import { db } from "tests/mocks/db";
import { navigateTo } from "tests/utils";

describe("ProductDetailPage", () => {
  let product: Product;

  beforeAll(() => {
    product = db.product.create();
  });

  afterAll(() => {
    db.product.delete({ where: { id: { equals: product.id } } });
  });

  it("should render product details", async () => {
    navigateTo(`/products/${product.id}`);

    await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));

    expect(
      screen.getByRole("heading", { name: product.name })
    ).toBeInTheDocument();

    expect(screen.getByText("$" + product.price)).toBeInTheDocument();
  });

  it("should render a not found message when product not exists", async () => {
    navigateTo("/products/invalid-product");

    expect(await screen.findByText(/not found/i)).toBeInTheDocument();
  });

  it("should render loading when fetching the product", () => {
    navigateTo(`/products/${product.id}`);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
