import { useFormik } from "formik";
import { convertTime } from "../../../../commons/utils/time.util";
import DateInput from "../../../../components/forms/DateInput";

interface FormFields {
  start_date: string;
  end_date: string;
}

export default function ProductSaleForm({ onFormSubmit, onFormClear }) {
  const today = new Date();
  const searchForm = useFormik<FormFields>({
    initialValues: {
      start_date: convertTime(
        new Date(today.getFullYear(), today.getMonth(), 1)
      ),
      end_date: convertTime(today),
    },
    onSubmit: (formData) => {
      let url = "/analysis/analyze-product-sale?";
      url += `start_date=${formData.start_date}&`;
      url += `end_date=${formData.end_date}&`;
      onFormSubmit(url);
    },
    validate: (values) => {
      const errors = {};
      if (!values.start_date) {
        errors["start_date"] = "Required";
      }
      if (!values.end_date) {
        errors["end_date"] = "Required";
      }
      return errors;
    },
  });

  const onClear = () => {
    searchForm.resetForm();
    onFormClear();
  };

  return (
    <form onSubmit={searchForm.handleSubmit} className="custom-card mx-auto">
      <div className="flex flex-col justify-between gap-2 sm:flex-row">
        <div className="w-full">
          <label className="custom-label mb-2 inline-block">From</label>
          <DateInput
            id="start_date"
            min="2022-01-01"
            max="2100-12-31"
            placeholder="Date"
            name="start_date"
            value={searchForm.values.start_date}
            onChange={searchForm.handleChange}
          ></DateInput>
        </div>
        <div className="w-full">
          <label className="custom-label mb-2 inline-block">To</label>
          <DateInput
            id="end_date"
            min="2022-01-01"
            max="2100-12-31"
            placeholder="Date"
            name="end_date"
            value={searchForm.values.end_date}
            onChange={searchForm.handleChange}
          ></DateInput>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <button className="btn btn-primary w-full" type="submit">
          Submit
        </button>
        <button
          className="btn btn-accent w-full"
          type="button"
          onClick={onClear}
        >
          Clear all
        </button>
      </div>
    </form>
  );
}
