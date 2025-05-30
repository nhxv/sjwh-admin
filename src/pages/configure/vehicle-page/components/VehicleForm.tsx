import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { BiCheckDouble, BiError } from "react-icons/bi";
import { VehicleResponse } from "../../../../models/vehicle-response.model";
import api from "../../../../stores/api";
import Spinner from "../../../../components/Spinner";
import TextInput from "../../../../components/forms/TextInput";
import { useVehicleConfigStore } from "../../../../stores/vehicle-config.store";
import { FormType } from "../../../../commons/form-type.enum";
import Checkbox from "../../../../components/forms/Checkbox";
import NumberInput from "../../../../components/forms/NumberInput";
import Alert from "../../../../components/Alert";

export default function VehicleForm() {
  const [formState, setFormState] = useState({
    success: "",
    error: "",
    loading: false,
  });
  const { vehicle, formType } = useVehicleConfigStore((state) => {
    return state;
  });
  const clearVehicleConfig = useVehicleConfigStore(
    (state) => state.clearVehicleConfig
  );

  const vehicleForm = useFormik({
    enableReinitialize: true,
    initialValues: {
      licensePlate: formType === FormType.EDIT ? vehicle.licensePlate : "",
      available: formType === FormType.EDIT ? vehicle.available : true,
      discontinued: formType === FormType.EDIT ? vehicle.discontinued : false,
      nickname: formType === FormType.EDIT ? vehicle.nickname : "",
      volume: formType === FormType.EDIT ? vehicle.volume : 0,
    },
    onSubmit: async (data) => {
      setFormState((prev) => ({
        ...prev,
        error: "",
        success: "",
        loading: true,
      }));
      if (formType === FormType.EDIT) {
        // edit mode
        try {
          const res = await api.put<VehicleResponse>(
            `/vehicles/${vehicle.id}`,
            data
          );
          setFormState((prev) => ({
            ...prev,
            success: "Updated successfully.",
            error: "",
            loading: false,
          }));
          setTimeout(() => {
            setFormState((prev) => ({ ...prev, success: "" }));
            clearVehicleConfig();
          }, 2000);
        } catch (e) {
          const error = JSON.parse(
            JSON.stringify(e.response ? e.response.data.error : e)
          );
          setFormState((prev) => ({
            ...prev,
            error: error.message,
            success: "",
            loading: false,
          }));
        }
      } else if (formType === FormType.CREATE) {
        // add mode
        try {
          const res = await api.post<VehicleResponse>(`/vehicles`, data);
          setFormState((prev) => ({
            ...prev,
            success: "Added successfully.",
            error: "",
            loading: false,
          }));
          setTimeout(() => {
            setFormState((prev) => ({ ...prev, success: "" }));
          }, 2000);
          vehicleForm.resetForm();
        } catch (e) {
          const error = JSON.parse(
            JSON.stringify(e.response ? e.response.data.error : e)
          );
          setFormState((prev) => ({
            ...prev,
            error: error.message,
            success: "",
            loading: false,
          }));
        }
      }
    },
  });

  useEffect(() => {
    vehicleForm.values.licensePlate = vehicle.licensePlate;
    vehicleForm.values.available = vehicle.available;
    vehicleForm.values.discontinued = vehicle.discontinued;
    vehicleForm.values.nickname = vehicle.nickname;
    vehicleForm.values.volume = vehicle.volume;
  }, [vehicle]);

  const onClear = () => {
    clearVehicleConfig();
    setFormState((prev) => ({
      ...prev,
      success: "",
      error: "",
      loading: false,
    }));
    vehicleForm.resetForm();
  };

  return (
    <>
      <form onSubmit={vehicleForm.handleSubmit}>
        <div className="mb-5">
          <label
            htmlFor="license-plate"
            className="custom-label mb-2 inline-block"
          >
            <span>License Plate</span>
            <span className="text-red-500">*</span>
          </label>
          <TextInput
            id="license-plate"
            type="text"
            name="licensePlate"
            placeholder={`License Plate`}
            value={vehicleForm.values.licensePlate}
            onChange={vehicleForm.handleChange}
          ></TextInput>
        </div>

        <div className="mb-5">
          <label htmlFor="nickname" className="custom-label mb-2 inline-block">
            Nickname
          </label>
          <TextInput
            id="nickname"
            type="text"
            name="nickname"
            placeholder={`Nickname`}
            value={vehicleForm.values.nickname}
            onChange={vehicleForm.handleChange}
          ></TextInput>
        </div>

        <div className="mb-5">
          <label htmlFor="volume" className="custom-label mb-2 inline-block">
            Volume
          </label>
          <NumberInput
            id="volume"
            name="volume"
            placeholder={`Volume`}
            value={vehicleForm.values.volume}
            onChange={vehicleForm.handleChange}
          ></NumberInput>
        </div>

        <div className="mb-5 flex items-center">
          <Checkbox
            id="available"
            name="available"
            onChange={() =>
              vehicleForm.setFieldValue(
                "available",
                !vehicleForm.values.available
              )
            }
            checked={vehicleForm.values.available}
            label="Available"
          ></Checkbox>
        </div>

        <div className="mb-5 flex items-center">
          <Checkbox
            id="discontinued"
            name="discontinued"
            onChange={() =>
              vehicleForm.setFieldValue(
                "discontinued",
                !vehicleForm.values.discontinued
              )
            }
            checked={!vehicleForm.values.discontinued}
            label="In use"
          ></Checkbox>
        </div>

        <button
          type="submit"
          className="btn btn-primary mt-1 w-full"
          disabled={formState.loading}
        >
          <span>{formType} vehicle</span>
        </button>

        <button
          type="button"
          className="btn btn-accent mt-3 w-full"
          onClick={onClear}
        >
          <span>Clear change(s)</span>
        </button>

        <div>
          {formState.loading ? (
            <div className="mt-5">
              <Spinner></Spinner>
            </div>
          ) : null}
          {formState.success ? (
            <>
              <div className="mt-5">
                <Alert message={formState.success} type="success"></Alert>
              </div>
            </>
          ) : null}
          {formState.error ? (
            <div className="mt-5">
              <Alert message={formState.error} type="error"></Alert>
            </div>
          ) : null}
        </div>
      </form>
    </>
  );
}
