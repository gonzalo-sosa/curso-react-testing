import OrderStatusSelector from "@/components/OrderStatusSelector";
import { Theme } from "@radix-ui/themes";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("OrderStatusSelector", () => {
  const renderOrderStatusSelector = () => {
    const onChange = vi.fn();
    render(
      <Theme>
        <OrderStatusSelector onChange={onChange} />
      </Theme>
    );

    return {
      onChange,
      user: userEvent.setup(),
      trigger: screen.getByRole("combobox"),
      getOption: (label: RegExp) =>
        screen.findByRole("option", { name: label }),
      getOptions: () => screen.findAllByRole("option"),
    };
  };

  const statuses = [
    { value: "new", label: /new/i },
    { value: "processed", label: /processed/i },
    { value: "fulfilled", label: /fulfilled/i },
  ];

  it("should render New as the default value", () => {
    const { trigger } = renderOrderStatusSelector();

    expect(trigger).toHaveTextContent(/new/i);
  });

  it("should render correct statuses", async () => {
    const { trigger, user, getOptions } = renderOrderStatusSelector();

    await user.click(trigger);

    const options = await getOptions();
    expect(options).toHaveLength(statuses.length);

    statuses.forEach((status, index) => {
      expect(options[index]).toHaveTextContent(status.label);
    });
  });

  // "new" es el valor por defecto por lo que no se ejecutará la función onChange por eso se lo trata en un caso aparte
  it.each(statuses.slice(1))(
    "should call onChange with $value when the $label option is selected",
    async ({ value, label }) => {
      const { trigger, onChange, user, getOption } =
        renderOrderStatusSelector();

      await user.click(trigger);

      const option = await getOption(label);
      await user.click(option);

      expect(onChange).toHaveBeenCalledWith(value);
    }
  );

  it('should call onChange with "new" when the New option is selected', async () => {
    const { trigger, onChange, user, getOption } = renderOrderStatusSelector();

    await user.click(trigger);
    const processedOption = await getOption(/processed/i);
    await user.click(processedOption);

    await user.click(trigger);
    const newOption = await getOption(/new/i);
    await user.click(newOption);

    expect(onChange).toHaveBeenCalledWith("new");
  });
});
