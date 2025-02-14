import ProductImageGallery from "@/components/ProductImageGallery";
import { render, screen } from "@testing-library/react";

describe("ProductImageGallery", () => {
  const imageUrls: string[] = [
    "https://via.placeholder.com/150",
    "https://via.placeholder.com/160",
    "https://via.placeholder.com/170",
  ];

  it("should not render anything if imageUrls array is empty", () => {
    const { container } = render(<ProductImageGallery imageUrls={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("should render a list of images", () => {
    render(<ProductImageGallery imageUrls={imageUrls} />);

    const list = screen.getByRole("list");
    const images = screen.getAllByRole("img");

    expect(list).toBeInTheDocument();
    expect(images).toHaveLength(imageUrls.length);
    images.forEach((image, index) => {
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("src", imageUrls[index]);
    });
  });
});
