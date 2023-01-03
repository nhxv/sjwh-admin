import ProductForm from "./components/ProductForm";
import ProductSearch from "./components/ProductSearch";

export default function ProductPage() {
  return (
    <>
      <section className="flex flex-col items-center min-h-screen">
        <h1 className="font-bold text-xl my-4">Configure product</h1>
        <div className="w-11/12 sm:w-6/12 md:w-5/12 bg-base-100 p-6 rounded-box shadow-md">
          <ProductForm></ProductForm>
        </div>
        <ProductSearch></ProductSearch>
      </section>
    </>
  )
}