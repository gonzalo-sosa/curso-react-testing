import ProductList from "@/components/ProductList";
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { delay, http, HttpResponse } from "msw";
import AllProviders from "tests/AllProviders";
import { db } from "tests/mocks/db";
import { server } from "tests/mocks/server";

describe("ProductList", () => {
  const productIds: number[] = [];

  beforeAll(() => {
    [1, 2, 3].forEach(() => {
      const product = db.product.create();
      productIds.push(product.id);
    });
  });

  afterAll(() => {
    db.product.deleteMany({ where: { id: { in: productIds } } });
  });

  const renderProductList = () =>
    render(<ProductList />, { wrapper: AllProviders });

  it("should render the list of products", async () => {
    renderProductList();

    const items = await screen.findAllByRole("listitem");
    expect(items.length).toBeGreaterThan(0);
  });

  it('should render "no products" if no product is found', async () => {
    server.use(http.get("/products", () => HttpResponse.json([])));

    renderProductList();

    const message = await screen.findByText(/no products/i);

    expect(message).toBeInTheDocument();
  });

  it("should render an error message when there is an error", async () => {
    server.use(http.get("/products", () => HttpResponse.error()));

    renderProductList();

    expect(await screen.findByText(/error/i)).toBeInTheDocument();
  });

  it("should render a loading indicator when fetching data", async () => {
    server.use(
      http.get("/products", async () => {
        await delay();
        return HttpResponse.json([]);
      })
    );

    renderProductList();

    // si fuese un elemento visual es necesario agregarle un custom role o un testId
    expect(await screen.findByText(/loading/i)).toBeInTheDocument();
  });

  it("should remove loading indicator after data is fetched", async () => {
    renderProductList();

    await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));
  });

  it("should remove loading indicator if there is an error", async () => {
    server.use(http.get("/products", () => HttpResponse.error()));

    renderProductList();

    await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));
  });
});
