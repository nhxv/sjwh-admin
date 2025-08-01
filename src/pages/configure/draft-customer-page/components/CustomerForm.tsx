import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { BiLeftArrowAlt, BiRightArrowAlt, BiX } from "react-icons/bi";
import Alert from "../../../../components/Alert";
import Spinner from "../../../../components/Spinner";
import Checkbox from "../../../../components/forms/Checkbox";
import NumberInput from "../../../../components/forms/NumberInput";
import SearchSuggest from "../../../../components/forms/SearchSuggest";
import TextInput from "../../../../components/forms/TextInput";
import SelectInput from "../../../../components/forms/SelectInput";
import api from "../../../../stores/api";
import { handleTokenExpire } from "../../../../commons/utils/token.util";

export default function CustomerForm({
  editedId,
  editedProducts,
  initialData,
  allProducts,
  onClear,
}) {
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    success: "",
    error: "",
    loading: false,
    page: 0,
  });
  const [selectedProducts, setSelectedProducts] = useState(
    editedProducts ? editedProducts : []
  );
  const [search, setSearch] = useState({
    products: [],
    query: "",
  });

  const customerForm = useFormik({
    enableReinitialize: true,
    initialValues: initialData,
    onSubmit: async (data) => {
      setFormState((prev) => ({
        ...prev,
        loading: true,
        error: "",
        success: "",
      }));
      const reqData = {};
      reqData["name"] = data["name"];
      reqData["address"] = data["address"];
      reqData["phone"] = data["phone"];
      reqData["email"] = data["email"];
      reqData["presentative"] = data["presentative"];
      reqData["discontinued"] = data["discontinued"];
      let productTendencies = new Map();
      const properties = Object.keys(data).sort();
      for (const property of properties) {
        if (property.includes("quantity")) {
          const id = +property.replace("quantity", "");
          const selected = selectedProducts.find((p) => p.id === id);
          if (selected) {
            productTendencies.set(selected.id, {
              customerName: data["name"],
              productName: selected.name,
              quantity: data[property],
            });
          }
        } else if (property.includes("unit")) {
          const id = +property.replace("unit", "");
          const selected = selectedProducts.find((p) => p.id === id);
          if (selected) {
            productTendencies.set(selected.id, {
              ...productTendencies.get(selected.id),
              unitCode: `${selected.id}_${data[property]}`,
            });
          }
        }
      }
      reqData["customerProductTendencies"] = [...productTendencies.values()];
      try {
        let res = null;
        if (editedId) {
          res = await api.put(`/customers/${editedId}`, reqData);
          if (res) {
            setFormState((prev) => ({
              ...prev,
              error: "",
              loading: false,
              success: "Update customer successfully.",
            }));
            setTimeout(() => {
              setFormState((prev) => ({
                ...prev,
                success: "",
                error: "",
                loading: false,
              }));
              navigate("/configure/view-customer");
            }, 2000);
          }
        } else {
          res = await api.post(`/customers`, reqData);
          if (res) {
            setFormState((prev) => ({
              ...prev,
              error: "",
              loading: false,
              success: "Create customer successfully.",
            }));
            setTimeout(() => {
              setFormState((prev) => ({
                ...prev,
                success: "",
                error: "",
                loading: false,
              }));
              navigate("/configure/view-customer");
            }, 2000);
          }
        }
      } catch (e) {
        const error = JSON.parse(
          JSON.stringify(e.response ? e.response.data.error : e)
        );
        setFormState((prev) => ({
          ...prev,
          error: error.message,
          loading: false,
        }));

        if (error.status === 401) {
          handleTokenExpire(navigate, setFormState);
        }
      }
    },
  });

  const onNextPage = () => {
    setFormState((prev) => ({ ...prev, page: 1 }));
  };

  const onPreviousPage = () => {
    setFormState((prev) => ({ ...prev, page: 0 }));
  };

  const onChangeSearch = (e) => {
    if (e.target.value) {
      const searched = allProducts.filter((product) =>
        product.name
          .toLowerCase()
          .replace(/\s+/g, "")
          .includes(e.target.value.toLowerCase().replace(/\s+/g, ""))
      );
      setSearch((prev) => ({
        ...prev,
        products: searched,
        query: e.target.value,
      }));
    } else {
      setSearch((prev) => ({ ...prev, products: [], query: e.target.value }));
    }
  };

  const onAddProduct = (product) => {
    const found = selectedProducts.find((p) => p.name === product.name);
    if (!found) {
      setSelectedProducts([product, ...selectedProducts]);
      customerForm.setFieldValue(`quantity${product.id}`, 0);
      customerForm.setFieldValue(`unit${product.id}`, "BOX");
    }
    setSearch((prev) => ({ ...prev, products: [], query: "" }));
  };

  const onRemoveProduct = (id) => {
    setSearch((prev) => ({ ...prev, products: [], query: "" }));
    customerForm.setFieldValue(`quantity${id}`, 0);
    customerForm.setFieldValue(`unit${id}`, "BOX");
    setSelectedProducts(
      selectedProducts.filter((product) => product.id !== id)
    );
  };

  const onClearQuery = () => {
    setSearch((prev) => ({ ...prev, products: [], query: "" }));
  };

  const onChangeUnit = (field: string, v) => {
    customerForm.setFieldValue(field, v);
  };

  return (
    <form onSubmit={customerForm.handleSubmit}>
      {formState.page === 0 ? (
        <>
          {/* 1st Page */}
          <div className="mb-5">
            <label htmlFor="name" className="custom-label mb-2 inline-block">
              <span>Name</span>
              <span className="text-red-500">*</span>
            </label>
            <TextInput
              id="name"
              type="text"
              placeholder={`Name`}
              name="name"
              value={customerForm.values.name}
              onChange={customerForm.handleChange}
            ></TextInput>
          </div>

          <div className="mb-5">
            <label htmlFor="address" className="custom-label mb-2 inline-block">
              Address
            </label>
            <TextInput
              id="address"
              type="text"
              placeholder={`Address`}
              name="address"
              value={customerForm.values.address}
              onChange={customerForm.handleChange}
            ></TextInput>
          </div>

          <div className="mb-5">
            <label htmlFor="phone" className="custom-label mb-2 inline-block">
              Phone
            </label>
            <TextInput
              id="phone"
              type="text"
              name="phone"
              placeholder={`Phone`}
              value={customerForm.values.phone}
              onChange={customerForm.handleChange}
            ></TextInput>
          </div>

          <div className="mb-5">
            <label htmlFor="email" className="custom-label mb-2 inline-block">
              Email
            </label>
            <TextInput
              id="email"
              type="email"
              name="email"
              placeholder={`Email`}
              value={customerForm.values.email}
              onChange={customerForm.handleChange}
            ></TextInput>
          </div>

          <div className="mb-5">
            <label
              htmlFor="presentative"
              className="custom-label mb-2 inline-block"
            >
              Presentative
            </label>
            <TextInput
              id="presentative"
              type="presentative"
              name="presentative"
              placeholder={`Presentative`}
              value={customerForm.values.presentative}
              onChange={customerForm.handleChange}
            ></TextInput>
          </div>

          <div className="mb-5 flex items-center">
            <Checkbox
              id="discontinued"
              name="discontinued"
              onChange={() =>
                customerForm.setFieldValue(
                  "discontinued",
                  !customerForm.values.discontinued
                )
              }
              checked={!customerForm.values.discontinued}
              label="In use"
            ></Checkbox>
          </div>
          <button
            type="button"
            className="btn btn-primary mt-3 w-full"
            onClick={onNextPage}
            disabled={formState.loading || customerForm.isSubmitting}
          >
            <span>Product template</span>
            <span>
              <BiRightArrowAlt className="ml-1 h-7 w-7"></BiRightArrowAlt>
            </span>
          </button>
        </>
      ) : (
        <>
          {formState.page === 1 && (
            <>
              {/* 2nd Page */}
              <div className="mb-5">
                <SearchSuggest
                  query={search.query}
                  items={search.products}
                  onChange={(e) => onChangeSearch(e)}
                  onFocus={() =>
                    setSearch((prev) => ({
                      ...prev,
                      products: allProducts,
                      query: "",
                    }))
                  }
                  onSelect={onAddProduct}
                  onClear={onClearQuery}
                  allowOverlap
                ></SearchSuggest>
              </div>

              <div className="mb-5">
                {selectedProducts && selectedProducts.length > 0 ? (
                  <div className="grid grid-cols-12 gap-3">
                    {selectedProducts.map((product) => (
                      <div
                        key={product.id}
                        className="rounded-box col-span-12 flex flex-col border-2 border-base-300 p-3 md:col-span-6"
                      >
                        <div className="mb-3 flex justify-between">
                          <div>
                            <span className="text-lg font-semibold">
                              {product.name}
                            </span>
                            <span className="block text-sm text-neutral">
                              Product
                            </span>
                          </div>
                          <button
                            type="button"
                            className="btn btn-circle btn-accent btn-sm"
                            onClick={() => onRemoveProduct(product.id)}
                          >
                            <span>
                              <BiX className="h-6 w-6"></BiX>
                            </span>
                          </button>
                        </div>
                        <div className="mb-2 flex gap-2">
                          <div className="w-6/12">
                            <label className="custom-label mb-2 inline-block">
                              Qty
                            </label>
                            <NumberInput
                              id={`quantity${product.id}`}
                              name={`quantity${product.id}`}
                              placeholder="Qty"
                              value={
                                customerForm.values[`quantity${product.id}`]
                              }
                              onChange={customerForm.handleChange}
                            ></NumberInput>
                          </div>
                          <div className="w-6/12">
                            <label className="custom-label mb-2 inline-block">
                              Unit
                            </label>
                            <SelectInput
                              name={`unit${product.id}`}
                              value={customerForm.values[`unit${product.id}`]}
                              setValue={(v) =>
                                customerForm.setFieldValue(
                                  `unit${product.id}`,
                                  v
                                )
                              }
                              options={product.units.map(
                                (unit) => unit.code.split("_")[1]
                              )}
                            ></SelectInput>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mb-2 mt-5 flex justify-center">
                    <span>Empty template.</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-12 gap-3">
                <button
                  type="button"
                  className="btn-outline-primary btn col-span-6"
                  onClick={onPreviousPage}
                >
                  <span>
                    <BiLeftArrowAlt className="mr-1 h-7 w-7"></BiLeftArrowAlt>
                  </span>
                  <span>Go back</span>
                </button>
                <button
                  type="submit"
                  className="btn btn-primary col-span-6"
                  disabled={formState.loading || customerForm.isSubmitting}
                >
                  <span>{editedId ? "Update" : "Create"}</span>
                </button>
              </div>
            </>
          )}
        </>
      )}
      <button
        type="button"
        className="btn btn-accent mt-3 w-full"
        onClick={onClear}
      >
        <span>Clear change(s)</span>
      </button>
      <div>
        {formState.loading && (
          <div className="mt-5">
            <Spinner></Spinner>
          </div>
        )}
        {formState.error && (
          <div className="mt-5">
            <Alert message={formState.error} type="error"></Alert>
          </div>
        )}
        {formState.success && (
          <div className="mt-5">
            <Alert message={formState.success} type="success"></Alert>
          </div>
        )}
      </div>
    </form>
  );
}
