import { useFormik } from "formik";
import { convertTime } from "../../../commons/utils/time.util";
import DateInput from "../../../components/forms/DateInput";
import TextInput from "../../../components/forms/TextInput";

interface FormFields {
  start_date: string;
  end_date: string;
}

export default function ProductRanking({ isOpen, onSubmit, onToPreviousPage }) {
  const searchForm = useFormik<FormFields>({
    initialValues: {
      start_date: convertTime(new Date()),
      end_date: convertTime(new Date()),
    },
    onSubmit: (formData) => {
      let url = "/analytic/product-count?";
      url += `start_date=${formData.start_date}&`;
      url += `end_date=${formData.end_date}&`;
      onSubmit(url);
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

  if (!isOpen) return <></>;

  return (
    <div className="custom-card min-w-fit text-left">
      <form onSubmit={searchForm.handleSubmit}>
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
              id="start_date"
              min="2022-01-01"
              max="2100-12-31"
              placeholder="Date"
              name="start_date"
              value={searchForm.values.end_date}
              onChange={searchForm.handleChange}
            ></DateInput>
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <button
            className="btn btn-primary w-full min-w-fit lg:xl:w-1/2"
            type="submit"
          >
            Submit
          </button>
        </div>
        <div className="mt-2 flex justify-center">
          <button
            className="btn btn-accent w-full min-w-fit lg:xl:w-1/2"
            type="submit"
            onClick={onToPreviousPage}
          >
            Back
          </button>
        </div>
      </form>
    </div>
  );
}
