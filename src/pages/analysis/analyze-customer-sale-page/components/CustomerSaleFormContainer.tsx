import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AlertFromQueryError } from "../../../../components/Alert";
import Spinner from "../../../../components/Spinner";
import api from "../../../../stores/api";
import CustomerSaleForm from "./CustomerSaleForm";
import CustomerSaleResult from "./CustomerSaleResult";

export default function CustomerSaleFormContainer() {
  const [queryURL, setQueryURL] = useState("");
  const analysisQuery = useQuery({
    queryKey: ["analyze-customer-sale", queryURL],
    queryFn: async () => {
      const result = await api.get(queryURL);
      return result.data;
    },
    // NOTE: Probably use skipToken if React Query is on v5+.
    // https://tanstack.com/query/v5/docs/framework/react/guides/disabling-queries#typesafe-disabling-of-queries-using-skiptoken
    enabled: !!queryURL,
    refetchOnWindowFocus: false,
  });

  const onFormSubmit = (url: string) => {
    setQueryURL(url);
  };

  const onFormClear = () => {
    setQueryURL("");
  };

  return (
    <>
      <CustomerSaleForm
        onFormSubmit={onFormSubmit}
        onFormClear={onFormClear}
      ></CustomerSaleForm>
      {/* TODO: Add more strict status check here later. */}
      {/* Since query is disabled at the beginning,
      query is NOT fetching, but the status is pending. We want to make sure to only show spinner on actual network call. */}
      {!analysisQuery.isFetching && analysisQuery.status === "pending" ? (
        <></>
      ) : analysisQuery.status === "pending" ||
        analysisQuery.fetchStatus === "fetching" ? (
        // The fetchStatus check is necessary because when user request the same data,
        // query will return data (cuz it's in cache) without triggering the .status change, which cause Result to not render correctly.
        // Therefore, we want to make sure the queryFn is actually running as well.
        <div className="mx-auto mt-4 w-11/12 md:w-10/12 lg:w-8/12">
          <Spinner></Spinner>
        </div>
      ) : analysisQuery.status === "error" ? (
        <div className="mx-auto mt-4 w-11/12 md:w-10/12 lg:w-8/12">
          <AlertFromQueryError queryError={analysisQuery.error} />
        </div>
      ) : (
        // <CustomerSaleTable
        //   columns={["Customer", "Box"]}
        //   data={analysisQuery.data}
        // />
        <CustomerSaleResult data={analysisQuery.data}></CustomerSaleResult>
      )}
    </>
  );
}
