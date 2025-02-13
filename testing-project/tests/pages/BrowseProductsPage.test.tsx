import BrowseProducts from "@/pages/BrowseProductsPage";
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { delay, http, HttpResponse } from "msw";
import AllProviders from "tests/AllProviders";
import { server } from "tests/mocks/server";

describe("BrowseProductsPage", () => {
  const renderBrowseProducts = () =>
    render(<BrowseProducts />, { wrapper: AllProviders });

  it("should show a loading skeleton when fetching categories", async () => {
    server.use(
      http.get("/categories", async () => {
        await delay();
        return HttpResponse.json([]);
      })
    );

    renderBrowseProducts();

    expect(
      screen.getByRole("progressbar", { name: /categories/i })
    ).toBeInTheDocument();
  });

  it("should hide the loading skeleton after categories are fetched", async () => {
    renderBrowseProducts();

    await waitForElementToBeRemoved(() =>
      screen.queryByRole("progressbar", { name: /categories/i })
    );
  });

  it("should show a loading skeleton when fetching products", async () => {
    server.use(
      http.get("/products", async () => {
        await delay();
        return HttpResponse.json([]);
      })
    );

    renderBrowseProducts();

    expect(
      screen.getByRole("progressbar", { name: /products/i })
    ).toBeInTheDocument();
  });

  it("should hide the loading skeleton after products are fetched", async () => {
    renderBrowseProducts();

    await waitForElementToBeRemoved(() =>
      screen.queryByRole("progressbar", { name: /products/i })
    );
  });
});
