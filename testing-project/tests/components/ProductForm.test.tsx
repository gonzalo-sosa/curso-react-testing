import ProductForm from "@/components/ProductForm";
import { Category, Product } from "@/entities";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toaster } from "react-hot-toast";
import AllProviders from "tests/AllProviders";
import { db } from "tests/mocks/db";

describe("ProductForm", () => {
  let category: Category;

  beforeAll(() => {
    category = db.category.create();
  });

  afterAll(() => {
    db.category.delete({
      where: { id: { equals: category.id } },
    });
  });

  const renderProductForm = (product?: Product) => {
    const onSubmit = vi.fn();

    render(
      <>
        <Toaster />
        <ProductForm product={product} onSubmit={onSubmit} />
      </>,
      {
        wrapper: AllProviders,
      }
    );

    const waitForFormToLoad = async () => {
      await screen.findByRole("form");

      const nameInput = screen.getByPlaceholderText(/name/i);
      const priceInput = screen.getByPlaceholderText(/price/i);
      const categoryInput = screen.getByRole("combobox", { name: /category/i });
      const submitButton = screen.getByRole("button", { name: /submit/i });

      type ProductData = Partial<Pick<Product, "name" | "categoryId">> & {
        price?: string | number;
      };

      const validData: ProductData = {
        name: "a",
        price: 1,
        categoryId: category.id,
      };

      const fill = async (product: ProductData) => {
        const user = userEvent.setup();
        if (product.name) await user.type(nameInput, product.name);

        if (product.price)
          await user.type(priceInput, product.price.toString());

        await user.tab(); // Para eliminar warnings de act
        await user.click(categoryInput);
        const options = screen.getAllByRole("option");
        await user.click(options[0]);
        await user.click(submitButton);
      };

      return {
        nameInput,
        priceInput,
        categoryInput,
        submitButton,
        validData,
        fill,
      };
    };

    const expectErrorToBeInTheDocument = (errorMessage: RegExp) => {
      const error = screen.getByRole("alert");
      expect(error).toBeInTheDocument();
      expect(error).toHaveTextContent(errorMessage);
    };

    return { waitForFormToLoad, expectErrorToBeInTheDocument, onSubmit };
  };

  it("should render form fields", async () => {
    const { waitForFormToLoad } = renderProductForm();

    const { nameInput, priceInput, categoryInput } = await waitForFormToLoad();

    expect(nameInput).toBeInTheDocument();
    expect(priceInput).toBeInTheDocument();
    expect(categoryInput).toBeInTheDocument();
  });

  it("should populate form fields when editing a product", async () => {
    const product: Product = {
      id: 1,
      name: "Game",
      price: 1,
      categoryId: category.id,
    };

    const { waitForFormToLoad } = renderProductForm(product);

    const { nameInput, priceInput, categoryInput } = await waitForFormToLoad();

    expect(nameInput).toHaveValue(product.name);
    expect(priceInput).toHaveValue(product.price.toString());
    expect(categoryInput).toHaveTextContent(category.name); // combobox es un botón con el nombre de la categoría como texto
  });

  it("should put focus on the name field", async () => {
    const { waitForFormToLoad } = renderProductForm();

    const { nameInput } = await waitForFormToLoad();

    expect(nameInput).toHaveFocus();
  });

  it.each([
    {
      scenario: "missing",
      errorMessage: /required/i,
    },
    {
      scenario: "whitespace",
      name: " ",
      errorMessage: /invalid/i,
    },
    {
      scenario: "long",
      name: "a".repeat(256),
      errorMessage: /255/,
    },
  ])(
    "should display an error if name is $scenario",
    async ({ name, errorMessage }) => {
      const { waitForFormToLoad, expectErrorToBeInTheDocument } =
        renderProductForm();

      const form = await waitForFormToLoad();

      await form.fill({ ...form.validData, name });

      expectErrorToBeInTheDocument(errorMessage);
    }
  );

  it.each([
    {
      scenario: "missing",
      errorMessage: /required/i,
    },
    {
      scenario: "less than 1",
      price: 0,
      errorMessage: /required/,
    },
    {
      scenario: "negative",
      price: -1,
      errorMessage: /1/,
    },
    {
      scenario: "greater than 1000",
      price: 1001,
      errorMessage: /1000/,
    },
    {
      scenario: "not a number",
      price: "a",
      errorMessage: /required/,
    },
  ])(
    "should display an error if price is $scenario",
    async ({ price, errorMessage }) => {
      const { waitForFormToLoad, expectErrorToBeInTheDocument } =
        renderProductForm();

      const form = await waitForFormToLoad();

      await form.fill({ ...form.validData, price });

      expectErrorToBeInTheDocument(errorMessage);
    }
  );

  it("should call onSubmit with the correct data", async () => {
    const { waitForFormToLoad, onSubmit } = renderProductForm();

    const form = await waitForFormToLoad();

    await form.fill(form.validData);

    expect(onSubmit).toHaveBeenCalledWith(form.validData);
  });

  it("should display a toast if submission fails", async () => {
    const { waitForFormToLoad, onSubmit } = renderProductForm();
    onSubmit.mockRejectedValue({});

    const form = await waitForFormToLoad();
    await form.fill(form.validData);

    const toast = await screen.findByRole("status");
    expect(toast).toBeInTheDocument();
    expect(toast).toHaveTextContent(/error/i);
  });

  it("should disable the submit button upon submission", async () => {
    const { waitForFormToLoad, onSubmit } = renderProductForm();
    onSubmit.mockReturnValue(new Promise(() => {}));

    const form = await waitForFormToLoad();
    await form.fill(form.validData);

    expect(form.submitButton).toBeDisabled();
  });

  it("should re-enable the submit button after submission", async () => {
    const { waitForFormToLoad, onSubmit } = renderProductForm();
    onSubmit.mockResolvedValue({});

    const form = await waitForFormToLoad();
    await form.fill(form.validData);

    expect(form.submitButton).not.toBeDisabled();
  });

  it("should re-enable the submit button if submission fails", async () => {
    const { waitForFormToLoad, onSubmit } = renderProductForm();
    onSubmit.mockRejectedValue("error");

    const form = await waitForFormToLoad();
    await form.fill(form.validData);

    expect(form.submitButton).not.toBeDisabled();
  });

  it("should list the correct categories", async () => {
    // Write tests for validating the category field.
    const { waitForFormToLoad } = renderProductForm();

    const form = await waitForFormToLoad();

    const user = userEvent.setup();
    await user.click(form.categoryInput);

    // Sólo funciona si hay una única categoría
    const option = screen.getByRole("option");
    expect(option).toHaveTextContent(category.name);
  });

  it("should reset the field when clicking reset button", async () => {
    const { waitForFormToLoad, onSubmit } = renderProductForm();
    onSubmit.mockRejectedValue("error");

    const form = await waitForFormToLoad();
    await form.fill(form.validData);

    const resetButton = screen.getByRole("button", { name: /reset/i });
    const user = userEvent.setup();
    await user.click(resetButton);

    const fields = [form.nameInput, form.priceInput, form.categoryInput];
    fields.forEach((field) => {
      expect(field).toHaveValue("");
    });
  });
});
