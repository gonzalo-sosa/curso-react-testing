import { Category, Product } from "@/entities";
import BrowseProducts from "@/pages/BrowseProductsPage";
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AllProviders from "tests/AllProviders";
import { db, getProductsByCategory } from "tests/mocks/db";
import { simulateDelay, simulateError } from "tests/utils";

describe("BrowseProductsPage", () => {
  const products: Product[] = [];
  const categories: Category[] = [];

  beforeAll(() => {
    [1, 2].forEach((item) => {
      const category = db.category.create({ name: "Category " + item });
      categories.push(category);
      [1, 2].forEach(() => {
        products.push(db.product.create({ categoryId: category.id }));
      });
    });
  });

  afterAll(() => {
    const productIds = products.map((p) => p.id);
    db.product.deleteMany({
      where: { id: { in: productIds } },
    });

    const categoryIds = categories.map((c) => c.id);
    db.category.deleteMany({
      where: { id: { in: categoryIds } },
    });
  });

  it("should show a loading skeleton when fetching categories", () => {
    simulateDelay("/categories");

    const { getCategoriesSkeleton } = renderBrowseProducts();

    expect(getCategoriesSkeleton()).toBeInTheDocument();
  });

  it("should hide the loading skeleton after categories are fetched", async () => {
    const { getCategoriesSkeleton } = renderBrowseProducts();

    await waitForElementToBeRemoved(getCategoriesSkeleton);
  });

  it("should show a loading skeleton when fetching products", () => {
    simulateDelay("/products");

    const { getProductsSkeleton } = renderBrowseProducts();

    expect(getProductsSkeleton()).toBeInTheDocument();
  });

  it("should hide the loading skeleton after products are fetched", async () => {
    const { getCategoriesSkeleton } = renderBrowseProducts();

    await waitForElementToBeRemoved(getCategoriesSkeleton);
  });

  it("should not render an error if categories cannot be fetched", async () => {
    simulateError("/categories");

    const { getCategoriesSkeleton, getCategoriesCombobox } =
      renderBrowseProducts();

    await waitForElementToBeRemoved(getCategoriesSkeleton);

    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    expect(getCategoriesCombobox()).not.toBeInTheDocument();
  });

  it("should renden an error if products cannot be fetched", async () => {
    simulateError("/products");

    renderBrowseProducts();

    expect(await screen.findByText(/error/i)).toBeInTheDocument();
  });

  it("should render categories", async () => {
    const { getCategoriesSkeleton, getCategoriesCombobox } =
      renderBrowseProducts();

    await waitForElementToBeRemoved(getCategoriesSkeleton);

    const combobox = getCategoriesCombobox();
    expect(combobox).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(combobox!);

    expect(screen.getByRole("option", { name: /all/i })).toBeInTheDocument();
    categories.forEach((category) => {
      expect(
        screen.getByRole("option", { name: category.name })
      ).toBeInTheDocument();
    });
  });

  it("should render products", async () => {
    const { getProductsSkeleton } = renderBrowseProducts();

    await waitForElementToBeRemoved(getProductsSkeleton);

    products.forEach((product) => {
      expect(screen.getByText(product.name)).toBeInTheDocument();
    });
  });

  it("should filter products by category", async () => {
    const { selectCategory, expectProductsToBeInTheDocument } =
      renderBrowseProducts();

    const [selectedCategory] = categories;
    await selectCategory(selectedCategory.name);

    const products = getProductsByCategory(selectedCategory.id);
    expectProductsToBeInTheDocument(products);
  });

  it("should render all products if all category is selected", async () => {
    const { selectCategory, expectProductsToBeInTheDocument } =
      renderBrowseProducts();

    await selectCategory(/all/i);

    const products = db.product.getAll();
    expectProductsToBeInTheDocument(products);
  });

  const renderBrowseProducts = () => {
    render(<BrowseProducts />, { wrapper: AllProviders });

    const getCategoriesSkeleton = () =>
      screen.queryByRole("progressbar", { name: /categories/i });

    const getProductsSkeleton = () =>
      screen.queryByRole("progressbar", { name: /products/i });

    const getCategoriesCombobox = () => screen.queryByRole("combobox");

    const selectCategory = async (name: RegExp | string) => {
      await waitForElementToBeRemoved(getCategoriesSkeleton);
      const combobox = getCategoriesCombobox();
      const user = userEvent.setup();
      await user.click(combobox!);

      const option = screen.getByRole("option", { name });
      await user.click(option);
    };

    const expectProductsToBeInTheDocument = (products: Product[]) => {
      const rows = screen.getAllByRole("row");
      const dataRows = rows.slice(1);
      expect(dataRows).toHaveLength(products.length);

      products.forEach((product) => {
        expect(screen.getByText(product.name)).toBeInTheDocument();
      });
    };

    return {
      getCategoriesSkeleton,
      getProductsSkeleton,
      getCategoriesCombobox,
      selectCategory,
      expectProductsToBeInTheDocument,
    };
  };
});
