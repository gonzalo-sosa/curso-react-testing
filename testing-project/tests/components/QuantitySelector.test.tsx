import QuantitySelector from "@/components/QuantitySelector";
import { Product } from "@/entities";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AllProviders from "tests/AllProviders";
import { db } from "tests/mocks/db";

describe("QuantitySelector", () => {
  let product: Product;

  beforeAll(() => {
    product = db.product.create();
  });

  afterAll(() => {
    db.product.delete({ where: { id: { equals: product.id } } });
  });

  const renderQuantitySelector = () => {
    render(<QuantitySelector product={product} />, { wrapper: AllProviders });

    const getAddToCartButton = () =>
      screen.queryByRole("button", {
        name: /add to cart/i,
      });

    const getQuantityControls = () => ({
      quantity: screen.queryByRole("status"),
      decrementButton: screen.queryByRole("button", {
        name: "-",
      }),
      incrementButton: screen.queryByRole("button", {
        name: "+",
      }),
    });

    const user = userEvent.setup();

    const addToCart = async () => {
      const button = getAddToCartButton();
      await user.click(button!);
    };

    const incrementQuantity = async () => {
      const { incrementButton } = getQuantityControls();
      await user.click(incrementButton!);
    };

    const decrementQuantity = async () => {
      const { decrementButton } = getQuantityControls();
      await user.click(decrementButton!);
    };

    return {
      getAddToCartButton,
      getQuantityControls,
      addToCart,
      incrementQuantity,
      decrementQuantity,
    };
  };

  it("should render add to cart button", () => {
    const { getAddToCartButton } = renderQuantitySelector();

    expect(getAddToCartButton()).toBeInTheDocument();
  });

  it("should add the product to the cart", async () => {
    const { getAddToCartButton, getQuantityControls, addToCart } =
      renderQuantitySelector();

    await addToCart();

    expect(getQuantityControls().quantity).toHaveTextContent("1");
    expect(getAddToCartButton()).not.toBeInTheDocument();
    expect(getQuantityControls().incrementButton).toBeInTheDocument();
    expect(getQuantityControls().decrementButton).toBeInTheDocument();
  });

  it("should increment the quantity", async () => {
    const { incrementQuantity, addToCart, getQuantityControls } =
      renderQuantitySelector();
    await addToCart();

    await incrementQuantity();

    const { quantity } = getQuantityControls();
    expect(quantity).toHaveTextContent("2");
  });

  it("should decrement the quantity", async () => {
    const {
      incrementQuantity,
      decrementQuantity,
      addToCart,
      getQuantityControls,
    } = renderQuantitySelector();
    await addToCart();
    await incrementQuantity();

    await decrementQuantity();

    const { quantity } = getQuantityControls();
    expect(quantity).toHaveTextContent("1");
  });

  it("should remove the product from the cart", async () => {
    const {
      getAddToCartButton,
      decrementQuantity,
      addToCart,
      getQuantityControls,
    } = renderQuantitySelector();
    await addToCart();

    await decrementQuantity();

    const { incrementButton, decrementButton, quantity } =
      getQuantityControls();
    expect(quantity).not.toBeInTheDocument();
    expect(decrementButton).not.toBeInTheDocument();
    expect(incrementButton).not.toBeInTheDocument();
    expect(getAddToCartButton()).toBeInTheDocument();
  });
});
