import { useState } from "react";
import { BiError } from "react-icons/bi";
import Input from "../components/Input";
import Spinner from "../components/Spinner";
import { useFormik } from "formik";
import { SignInResponse } from "../models/sign-in-response.model";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";
import api from "../stores/api";

export default function SignInPage() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const signIn = useAuthStore((state) => state.signIn);

  const signInForm = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    onSubmit: async (data) => {
      setLoading(true);
      await api.post<SignInResponse>(`/auth/login`, data)
      .then((res) => {
        const resData: SignInResponse = res.data;
        signIn(resData);
        setLoading(false);
        navigate("/sold");
      })
      .catch(e => {
        setLoading(false);
        const error = JSON.parse(JSON.stringify(e));
        setErrorMessage(error.message);
      });
    }
  });

  return (
    <>
      <div className="flex flex-col justify-center items-center min-h-screen p-6 bg-base-200">
        <form onSubmit={signInForm.handleSubmit} className="max-w-5/12 bg-white p-6 rounded-box shadow-md">
          {errorMessage ? (
          <div className="alert alert-error text-red-700 mb-5">
            <div>
              <BiError className="flex-shrink-0 h-6 w-6"></BiError>
              <span>{errorMessage}</span>
            </div>
          </div>
          )  : <></>}
          <div className="mb-5">
            <label htmlFor="username" className="font-medium text-gray-600 mb-4">Username</label>
            <Input id="username" type="text" placeholder={`Username`} 
            value={signInForm.values.username} onChange={signInForm.handleChange}></Input>
          </div>
          <div className="my-5">
            <label htmlFor="password" className="font-medium text-gray-600">Password</label>
            <Input id="password" type="password" placeholder={`Password`}
            value={signInForm.values.password} onChange={signInForm.handleChange}></Input>
          </div>
          <button type="submit" className="btn btn-primary text-white w-full mt-3">Sign in</button>
        </form>
        {loading ? (
        <>
          <div className="mt-4">
            <Spinner></Spinner>
          </div>
        </>
        ) : <></>}

      </div>
    </>
  )
}