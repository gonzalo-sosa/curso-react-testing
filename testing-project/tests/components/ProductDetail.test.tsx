import ProductDetail from "@/components/ProductDetail";
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import AllProviders from "tests/AllProviders";
import { server } from "tests/mocks/server";
import { delay, http, HttpResponse } from "msw";
import { db } from "tests/mocks/db";

describe("ProductDetail", () => {
  let productId: number;

  beforeAll(() => {
    [1, 2, 3].forEach(() => {
      const p = db.product.create();
      productId = p.id;
    });
  });

  afterAll(() => {
    db.product.deleteMany({ where: { id: { equals: productId } } });
  });

  const renderProductDetails = (productId: number) =>
    render(<ProductDetail productId={productId} />, { wrapper: AllProviders });

  it('should render a message with "invalid" when productId is not correct', () => {
    renderProductDetails(0);

    expect(screen.getByText(/invalid/i)).toBeInTheDocument();
  });

  it("should render the details of the product when productId is correct", async () => {
    const product = db.product.findFirst({
      where: { id: { equals: productId } },
    });

    renderProductDetails(productId);

    expect(
      await screen.findByText(new RegExp(product!.name))
    ).toBeInTheDocument();
    expect(
      await screen.findByText(new RegExp(product!.price.toString()))
    ).toBeInTheDocument();
  });

  it("should render a message when product is not found", async () => {
    server.use(http.get("/products/1", () => HttpResponse.json(null)));
    renderProductDetails(1);

    expect(await screen.findByText(/not found/i)).toBeInTheDocument();
  });

  it("should render an error message if data fetching fails", async () => {
    server.use(http.get("/products/1", () => HttpResponse.error()));

    renderProductDetails(1);

    expect(await screen.findByText(/error/i)).toBeInTheDocument();
  });

  it("should render a loading indicator when data is fetching", async () => {
    server.use(
      http.get("/products/1", async () => {
        await delay();
        return HttpResponse.json({});
      })
    );

    renderProductDetails(1);

    expect(await screen.findByText(/loading/i)).toBeInTheDocument();
  });

  it("should remove the loading indicator after data is fetched", async () => {
    server.use(
      http.get("/products/1", async () => {
        await delay();
        return HttpResponse.json({});
      })
    );

    renderProductDetails(1);

    await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));
  });

  it("should remove the loading indicator if there is an error", async () => {
    server.use(http.get("/products/1", () => HttpResponse.error()));

    renderProductDetails(1);

    await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));
  });
});
